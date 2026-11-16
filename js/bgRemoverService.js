/**
 * Habib iFix .Tech - Non-Blocking Client-Side AI Background Remover Service
 * Powered by BgRemovers JavaScript SDK (https://bgremovers.org/sdk/v1.js)
 *
 * Executes inside a dedicated Web Worker (with automatic main-thread fallback
 * for older browsers) so heavy ONNX WASM / WebGPU inference and 4K PNG encoding
 * NEVER freeze the desktop or mobile UI thread.
 * 100% local in the browser: no API key, no server upload.
 */
(function (window, document) {
  'use strict';

  const SDK_SCRIPT_URL = 'https://bgremovers.org/sdk/v1.js';
  const MAX_DIMENSION = 4096;
  const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024; // 30 MB SDK limit
  const SUPPORTED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]);

  let mainThreadSdkPromise = null;
  let workerInstance = null;
  let workerUrl = null;
  let workerInitFailed = false;
  let preloadPromise = null;
  let jobCounter = 0;

  function canUseWorkerEngine() {
    return (
      typeof window !== 'undefined' &&
      typeof Worker === 'function' &&
      typeof OffscreenCanvas === 'function' &&
      typeof createImageBitmap === 'function' &&
      typeof Blob === 'function' &&
      typeof URL !== 'undefined' &&
      typeof URL.createObjectURL === 'function'
    );
  }

  function checkBrowserSupport() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new Error('Background removal requires a browser environment.');
    }
    if (typeof WebAssembly === 'undefined') {
      throw new Error('Your browser does not support WebAssembly, which is required for local AI background removal.');
    }
    if (typeof Blob === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      throw new Error('Your browser does not support Blob URLs required for local image processing.');
    }
    const testCanvas = document.createElement('canvas');
    if (!testCanvas || typeof testCanvas.getContext !== 'function' || typeof testCanvas.toBlob !== 'function') {
      throw new Error('Your browser does not support HTML5 Canvas image encoding.');
    }
  }

  function buildWorkerSource() {
    return `
      "use strict";
      var _activeBitmaps = [];
      if (typeof Image === "undefined") {
        self.Image = function WorkerImage() {
          this.naturalWidth = 0;
          this.naturalHeight = 0;
          this.width = 0;
          this.height = 0;
          this.onload = null;
          this.onerror = null;
          this._bmp = null;
        };
        Object.defineProperty(self.Image.prototype, "src", {
          set: function (url) {
            var selfImg = this;
            fetch(url)
              .then(function (r) { return r.blob(); })
              .then(function (b) { return createImageBitmap(b); })
              .then(function (bmp) {
                selfImg._bmp = bmp;
                _activeBitmaps.push(bmp);
                selfImg.naturalWidth = bmp.width;
                selfImg.naturalHeight = bmp.height;
                selfImg.width = bmp.width;
                selfImg.height = bmp.height;
                if (typeof selfImg.onload === "function") selfImg.onload();
              })
              .catch(function (err) {
                if (typeof selfImg.onerror === "function") selfImg.onerror(err);
              });
          }
        });
      }

      if (typeof document === "undefined") {
        self.document = {
          createElement: function (tag) {
            if (tag === "canvas") {
              var oc = new OffscreenCanvas(1, 1);
              oc.toBlob = function (cb, type, quality) {
                oc.convertToBlob({ type: type || "image/png", quality: quality })
                  .then(cb)
                  .catch(function () { cb(null); });
              };
              var origGetContext = oc.getContext.bind(oc);
              oc.getContext = function (ctxType, opts) {
                var ctx = origGetContext(ctxType, opts);
                if (ctx && !ctx._habibPatched) {
                  var origDrawImage = ctx.drawImage.bind(ctx);
                  ctx.drawImage = function (img) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var target = img && img._bmp ? img._bmp : img;
                    return origDrawImage.apply(ctx, [target].concat(args));
                  };
                  ctx._habibPatched = true;
                }
                return ctx;
              };
              return oc;
            }
            return {};
          }
        };
      }

      function cleanupBitmaps() {
        while (_activeBitmaps.length > 0) {
          var bmp = _activeBitmaps.pop();
          try { if (bmp && typeof bmp.close === "function") bmp.close(); } catch (_) {}
        }
      }

      importScripts(${JSON.stringify(SDK_SCRIPT_URL)});

      self.onmessage = async function (event) {
        var msg = event.data || {};
        var id = msg.id;
        try {
          if (msg.type === "preload") {
            if (self.BgRemove && typeof self.BgRemove.preload === "function") {
              await self.BgRemove.preload();
            }
            self.postMessage({ id: id, type: "preloaded", ok: true });
          } else if (msg.type === "remove") {
            if (!self.BgRemove || typeof self.BgRemove.removeBackground !== "function") {
              throw new Error("BgRemovers SDK failed to initialize in worker.");
            }
            var resultBlob = await self.BgRemove.removeBackground(msg.blob, {
              maxDimension: msg.maxDimension || ${MAX_DIMENSION},
              onProgress: function (info) {
                self.postMessage({ id: id, type: "progress", info: info });
              }
            });
            cleanupBitmaps();
            self.postMessage({ id: id, type: "done", blob: resultBlob });
          }
        } catch (err) {
          cleanupBitmaps();
          self.postMessage({
            id: id,
            type: "error",
            message: err && err.message ? err.message : "Background removal failed."
          });
        }
      };
    `;
  }

  function getOrCreateWorker() {
    if (workerInitFailed || !canUseWorkerEngine()) return null;
    if (workerInstance) return workerInstance;
    try {
      const code = buildWorkerSource();
      workerUrl = URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
      workerInstance = new Worker(workerUrl);
      workerInstance.addEventListener('error', () => {
        workerInitFailed = true;
        try { workerInstance.terminate(); } catch (_) {}
        workerInstance = null;
      });
      return workerInstance;
    } catch (_) {
      workerInitFailed = true;
      return null;
    }
  }

  function runWorkerCommand(type, payload, onProgressInfo) {
    return new Promise((resolve, reject) => {
      const worker = getOrCreateWorker();
      if (!worker) {
        reject(new Error('WORKER_UNAVAILABLE'));
        return;
      }

      const id = ++jobCounter;
      const onMessage = (event) => {
        const data = event.data;
        if (!data || data.id !== id) return;

        if (data.type === 'progress') {
          if (typeof onProgressInfo === 'function') onProgressInfo(data.info);
        } else if (data.type === 'preloaded') {
          cleanup();
          resolve(true);
        } else if (data.type === 'done') {
          cleanup();
          resolve(data.blob);
        } else if (data.type === 'error') {
          cleanup();
          reject(new Error(data.message || 'Background removal failed.'));
        }
      };

      const onError = (err) => {
        cleanup();
        workerInitFailed = true;
        reject(new Error(err && err.message ? err.message : 'WORKER_CRASHED'));
      };

      function cleanup() {
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
      }

      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);
      worker.postMessage(Object.assign({ id, type }, payload));
    });
  }

  function loadMainThreadSdkOnce() {
    if (window.BgRemove && typeof window.BgRemove.removeBackground === 'function' && !window.BgRemove._isWorkerProxy) {
      return Promise.resolve(window.BgRemove);
    }
    if (mainThreadSdkPromise) {
      return mainThreadSdkPromise;
    }

    mainThreadSdkPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${SDK_SCRIPT_URL}"]`);
      if (existingScript) {
        if (window.BgRemove && typeof window.BgRemove.removeBackground === 'function' && !window.BgRemove._isWorkerProxy) {
          resolve(window.BgRemove);
          return;
        }
        existingScript.addEventListener('load', () => {
          if (window.BgRemove && typeof window.BgRemove.removeBackground === 'function') {
            resolve(window.BgRemove);
          } else {
            mainThreadSdkPromise = null;
            reject(new Error('BgRemovers SDK loaded, but BgRemove API is unavailable.'));
          }
        }, { once: true });
        existingScript.addEventListener('error', () => {
          mainThreadSdkPromise = null;
          reject(new Error('Failed to load BgRemovers SDK. Check your internet connection.'));
        }, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = SDK_SCRIPT_URL;
      script.async = true;
      script.onload = () => {
        if (window.BgRemove && typeof window.BgRemove.removeBackground === 'function') {
          resolve(window.BgRemove);
        } else {
          mainThreadSdkPromise = null;
          reject(new Error('BgRemovers SDK initialized without BgRemove global.'));
        }
      };
      script.onerror = () => {
        mainThreadSdkPromise = null;
        reject(new Error('Unable to load BgRemovers JavaScript SDK. Check network access and try again.'));
      };
      document.head.appendChild(script);
    });

    return mainThreadSdkPromise;
  }

  function preloadBgRemoveModel() {
    if (preloadPromise) return preloadPromise;

    preloadPromise = (async () => {
      try {
        checkBrowserSupport();
        const worker = getOrCreateWorker();
        if (worker) {
          await runWorkerCommand('preload', {});
          return true;
        }
        const sdk = await loadMainThreadSdkOnce();
        if (typeof sdk.preload === 'function') {
          await sdk.preload();
        }
        return true;
      } catch (_) {
        preloadPromise = null;
        return false;
      }
    })();

    return preloadPromise;
  }

  function validateImageInput(input) {
    if (typeof input === 'string') {
      if (!input.startsWith('data:image/')) {
        throw new Error('Invalid image data. Please select or paste a JPG, PNG, or WebP image.');
      }
      return;
    }

    if (!(input instanceof Blob)) {
      throw new Error('Invalid input. Please upload, drop, or paste a JPG, PNG, or WebP image.');
    }

    if (input.size === 0) {
      throw new Error('The selected image file is empty (0 bytes).');
    }

    if (input.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (input.size / (1024 * 1024)).toFixed(1);
      throw new Error(`Image file is too large (${sizeMb} MB). Maximum supported size is 30 MB.`);
    }

    const type = (input.type || '').toLowerCase();
    const name = (input.name || '').toLowerCase();
    const hasSupportedMime = type && SUPPORTED_MIME_TYPES.has(type);
    const hasSupportedExt = /\.(jpe?g|png|webp)$/i.test(name);

    if (type && !hasSupportedMime && !hasSupportedExt) {
      throw new Error(`Unsupported image format (${type}). Please upload a JPG, PNG, or WebP image.`);
    }
    if (!type && name && !hasSupportedExt) {
      throw new Error('Unsupported file extension. Please upload a JPG, PNG, or WebP image.');
    }
  }

  function normalizeError(err) {
    const raw = (err && err.message) ? String(err.message) : 'Background removal failed.';
    const lower = raw.toLowerCase();

    if (lower.includes('out of memory') || lower.includes('oom') || err instanceof RangeError) {
      return new Error('Insufficient device memory to process this image. Close extra tabs or try a slightly smaller photo.');
    }
    if (lower.includes('decode')) {
      return new Error('Could not decode this image file. Please try another JPG, PNG, or WebP photo.');
    }
    if (lower.includes('too large')) {
      return new Error('Image is too large. Please use an image under 30 MB.');
    }
    if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('load bgremovers')) {
      return new Error('Could not download the browser AI model files. Check your internet connection and retry.');
    }
    return err instanceof Error ? err : new Error(raw);
  }

  function yieldToUi() {
    return new Promise((resolve) => {
      if (typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(() => setTimeout(resolve, 0));
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  class BgRemoverSDK {
    constructor(config = {}) {
      this.maxDimension = config.maxDimension || MAX_DIMENSION;
      this._isProcessing = false;
      this._activeBlobUrls = new Set();
    }

    isProcessing() {
      return this._isProcessing;
    }

    async preload() {
      return preloadBgRemoveModel();
    }

    revokeBlobUrl(url) {
      if (url && typeof url === 'string' && url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(url);
          this._activeBlobUrls.delete(url);
        } catch (_) {}
      }
    }

    revokeAllBlobUrls() {
      this._activeBlobUrls.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (_) {}
      });
      this._activeBlobUrls.clear();
    }

    createTrackedBlobUrl(blob) {
      const url = URL.createObjectURL(blob);
      this._activeBlobUrls.add(url);
      return url;
    }

    /**
     * Extract an image File/Blob or image URL from a browser Clipboard paste event (Ctrl+V)
     */
    extractFromPasteEvent(pasteEvent) {
      const cd = pasteEvent && (pasteEvent.clipboardData || window.clipboardData);
      if (!cd) return null;

      if (cd.items && cd.items.length) {
        for (let i = 0; i < cd.items.length; i++) {
          const item = cd.items[i];
          if (item.kind === 'file' && item.type && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) return { kind: 'file', file };
          }
        }
      }

      if (cd.files && cd.files.length) {
        for (let i = 0; i < cd.files.length; i++) {
          const f = cd.files[i];
          if (f && (!f.type || f.type.startsWith('image/'))) {
            return { kind: 'file', file: f };
          }
        }
      }

      const text = typeof cd.getData === 'function' ? (cd.getData('text/plain') || '').trim() : '';
      if (text && (/^https?:\/\/\S+/i.test(text) || text.startsWith('data:image/'))) {
        return { kind: 'url', url: text };
      }

      return null;
    }

    /**
     * Fetch a pasted image URL directly in browser memory (never sent to any backend)
     */
    async fetchImageUrlAsFile(rawUrl) {
      const trimmed = String(rawUrl || '').trim();
      if (!trimmed) {
        throw new Error('Please paste a valid image URL.');
      }
      if (!trimmed.startsWith('data:image/') && !/^https?:\/\/\S+/i.test(trimmed)) {
        throw new Error('Please enter a valid http(s) image URL.');
      }

      let res;
      try {
        res = await fetch(trimmed, { mode: 'cors' });
      } catch (_) {
        throw new Error('This website blocks direct browser image access (CORS). Please copy the image itself and press Ctrl+V, or download & upload it.');
      }

      if (!res.ok) {
        throw new Error(`Could not load image from URL (HTTP ${res.status}). Try copying the image and pressing Ctrl+V.`);
      }

      const blob = await res.blob();
      if (!blob.type || !blob.type.startsWith('image/')) {
        throw new Error('The pasted URL did not return a valid JPG, PNG, or WebP image.');
      }

      const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
      return new File([blob], `pasted-image.${ext}`, { type: blob.type });
    }

    async removeBackground(inputImage, onProgress = () => {}, options = {}) {
      if (this._isProcessing) {
        throw new Error('An image is already being processed. Please wait until the current task finishes.');
      }

      this._isProcessing = true;
      let highestPercent = 2;

      const emitProgress = (percent, text, detail = {}) => {
        const clamped = Math.max(highestPercent, Math.min(100, Math.round(percent)));
        highestPercent = clamped;
        try {
          onProgress(clamped, text, detail);
        } catch (_) {}
      };

      try {
        checkBrowserSupport();
        validateImageInput(inputImage);

        emitProgress(4, 'Starting background worker...');
        await yieldToUi();

        let blobInput = inputImage;
        if (typeof inputImage === 'string') {
          const dataRes = await fetch(inputImage);
          blobInput = await dataRes.blob();
          validateImageInput(blobInput);
        }

        const fileProgressMap = new Map();
        const handleSdkProgress = (info) => {
          if (!info || !info.stage) return;

          if (info.stage === 'loading-runtime') {
            emitProgress(14, 'Loading browser AI runtime (ONNX / WebAssembly)...', info);
          } else if (info.stage === 'loading-model') {
            const accel = info.device === 'webgpu' ? 'WebGPU' : 'WebAssembly';
            emitProgress(22, `Starting background remover (${accel})...`, info);
          } else if (info.stage === 'downloading') {
            const p = info.progress || {};
            if (p.file && typeof p.progress === 'number') {
              fileProgressMap.set(p.file, p.progress);
              let sum = 0;
              fileProgressMap.forEach((val) => { sum += val; });
              const avg = sum / Math.max(1, fileProgressMap.size);
              const mapped = 24 + (avg * 0.62);
              emitProgress(mapped, `Caching AI model in browser (${Math.round(avg)}%)...`, info);
            } else if (p.status === 'initiate' || p.status === 'download') {
              emitProgress(26, 'Downloading AI segmentation model...', info);
            } else if (p.status === 'ready') {
              emitProgress(86, 'AI model ready in memory.', info);
            }
          } else if (info.stage === 'ready') {
            emitProgress(90, 'Segmenting subject & generating transparent PNG...', info);
          }
        };

        const targetMaxDim = options.maxDimension || this.maxDimension || MAX_DIMENSION;
        let resultBlob = null;

        // Primary: Execute inside Dedicated Web Worker so UI never hangs
        if (getOrCreateWorker()) {
          try {
            emitProgress(12, 'Removing background in non-blocking worker...');
            resultBlob = await runWorkerCommand(
              'remove',
              { blob: blobInput, maxDimension: targetMaxDim },
              handleSdkProgress
            );
          } catch (workerErr) {
            const msg = workerErr && workerErr.message ? workerErr.message : '';
            if (msg !== 'WORKER_UNAVAILABLE' && msg !== 'WORKER_CRASHED') {
              throw workerErr;
            }
          }
        }

        // Fallback: Main thread SDK if Web Worker / OffscreenCanvas unavailable
        if (!resultBlob) {
          const sdk = await loadMainThreadSdkOnce();
          emitProgress(10, 'AI SDK ready. Processing image...');
          await yieldToUi();
          resultBlob = await sdk.removeBackground(blobInput, {
            maxDimension: targetMaxDim,
            onProgress: handleSdkProgress
          });
        }

        if (!(resultBlob instanceof Blob) || resultBlob.size === 0) {
          throw new Error('The AI engine returned an empty image result.');
        }

        emitProgress(96, 'Finalizing transparent PNG...');
        await yieldToUi();

        const blobUrl = this.createTrackedBlobUrl(resultBlob);
        let dataUrl = null;
        if (options.includeDataUrl !== false) {
          dataUrl = await this._blobToDataUrl(resultBlob);
        }

        emitProgress(100, 'Background removed automatically & free!');

        return {
          success: true,
          blob: resultBlob,
          blobUrl,
          dataUrl,
          provider: 'bgremovers-client-sdk'
        };
      } catch (err) {
        throw normalizeError(err);
      } finally {
        this._isProcessing = false;
      }
    }

    _blobToDataUrl(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to encode transparent PNG.'));
        reader.readAsDataURL(blob);
      });
    }
  }

  function scheduleBackgroundPreload() {
    const trigger = () => {
      preloadBgRemoveModel();
    };
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(trigger, { timeout: 2500 });
    } else {
      setTimeout(trigger, 600);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleBackgroundPreload, { once: true });
  } else {
    scheduleBackgroundPreload();
  }

  const instance = new BgRemoverSDK({ maxDimension: MAX_DIMENSION });
  window.BgRemoverSDK = BgRemoverSDK;
  window.bgRemoverInstance = instance;

  // Expose lightweight global facade if running via Web Worker
  if (!window.BgRemove) {
    window.BgRemove = {
      _isWorkerProxy: true,
      version: '1.0.0',
      preload: () => instance.preload(),
      removeBackground: async (file, opts = {}) => {
        const res = await instance.removeBackground(file, (pct, msg, info) => {
          if (typeof opts.onProgress === 'function' && info) opts.onProgress(info);
        }, { maxDimension: opts.maxDimension || MAX_DIMENSION, includeDataUrl: false });
        return res.blob;
      }
    };
  }
})(window, document);

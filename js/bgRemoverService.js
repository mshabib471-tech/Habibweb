/**
 * Habib iFix .Tech - Client-Side AI Background Remover Service
 * Powered by BgRemovers JavaScript SDK (https://bgremovers.org/sdk/v1.js)
 * Runs 100% locally in the user's browser (WebGPU / WASM). No API key, no server upload.
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

  let sdkLoadPromise = null;
  let preloadPromise = null;

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

  function loadBgRemoveSdkOnce() {
    if (window.BgRemove && typeof window.BgRemove.removeBackground === 'function') {
      return Promise.resolve(window.BgRemove);
    }
    if (sdkLoadPromise) {
      return sdkLoadPromise;
    }

    sdkLoadPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${SDK_SCRIPT_URL}"]`);

      if (existingScript) {
        if (window.BgRemove && typeof window.BgRemove.removeBackground === 'function') {
          resolve(window.BgRemove);
          return;
        }
        existingScript.addEventListener('load', () => {
          if (window.BgRemove && typeof window.BgRemove.removeBackground === 'function') {
            resolve(window.BgRemove);
          } else {
            sdkLoadPromise = null;
            reject(new Error('BgRemovers SDK loaded, but BgRemove API is unavailable.'));
          }
        }, { once: true });
        existingScript.addEventListener('error', () => {
          sdkLoadPromise = null;
          reject(new Error('Failed to load BgRemovers SDK. Please check your internet connection.'));
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
          sdkLoadPromise = null;
          reject(new Error('BgRemovers SDK initialized without BgRemove global.'));
        }
      };
      script.onerror = () => {
        sdkLoadPromise = null;
        reject(new Error('Unable to load BgRemovers JavaScript SDK from CDN. Check network access and try again.'));
      };
      document.head.appendChild(script);
    });

    return sdkLoadPromise;
  }

  function preloadBgRemoveModel() {
    if (preloadPromise) return preloadPromise;

    preloadPromise = (async () => {
      try {
        checkBrowserSupport();
        const sdk = await loadBgRemoveSdkOnce();
        if (typeof sdk.preload === 'function') {
          await sdk.preload();
        }
        return true;
      } catch (err) {
        // Reset so a future user-initiated attempt can retry cleanly
        preloadPromise = null;
        return false;
      }
    })();

    return preloadPromise;
  }

  function validateImageInput(input) {
    if (typeof input === 'string') {
      if (!input.startsWith('data:image/')) {
        throw new Error('Invalid image data. Please select a JPG, PNG, or WebP image file.');
      }
      return;
    }

    if (!(input instanceof Blob)) {
      throw new Error('Invalid input. Please upload a valid JPG, PNG, or WebP image file.');
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
      return new Error('Insufficient browser memory to process this image. Try closing extra tabs or using a smaller photo.');
    }
    if (lower.includes('decode')) {
      return new Error('Could not decode this image file. Please try another JPG, PNG, or WebP photo.');
    }
    if (lower.includes('too large')) {
      return new Error('Image is too large. Please upload an image under 30 MB.');
    }
    if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('load bgremovers')) {
      return new Error('Could not download the browser AI model files. Please check your internet connection and retry.');
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
     * Remove background directly in the user's browser via BgRemove.removeBackground
     * @param {File|Blob|string} inputImage - File, Blob, or data:image/* URL
     * @param {Function} onProgress - Callback (percent: number, statusText: string, detail?: object)
     * @param {Object} options - Optional overrides ({ maxDimension, includeDataUrl })
     */
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

        emitProgress(4, 'Initializing local browser AI engine...');
        await yieldToUi();

        let blobInput = inputImage;
        if (typeof inputImage === 'string') {
          const dataRes = await fetch(inputImage);
          blobInput = await dataRes.blob();
          validateImageInput(blobInput);
        }

        const sdk = await loadBgRemoveSdkOnce();
        emitProgress(10, 'AI SDK ready. Preparing RMBG-1.4 model...');
        await yieldToUi();

        const fileProgressMap = new Map();

        const resultBlob = await sdk.removeBackground(blobInput, {
          maxDimension: options.maxDimension || this.maxDimension || MAX_DIMENSION,
          onProgress: (info) => {
            if (!info || !info.stage) return;

            if (info.stage === 'loading-runtime') {
              emitProgress(14, 'Loading browser AI runtime (ONNX / WebAssembly)...', info);
            } else if (info.stage === 'loading-model') {
              const accel = info.device === 'webgpu' ? 'WebGPU' : 'WebAssembly';
              emitProgress(22, `Starting RMBG-1.4 model (${accel})...`, info);
            } else if (info.stage === 'downloading') {
              const p = info.progress || {};
              if (p.file && typeof p.progress === 'number') {
                fileProgressMap.set(p.file, p.progress);
                let sum = 0;
                fileProgressMap.forEach((val) => { sum += val; });
                const avg = sum / Math.max(1, fileProgressMap.size);
                const mapped = 24 + (avg * 0.62); // 24% -> 86%
                emitProgress(mapped, `Downloading AI model to browser cache (${Math.round(avg)}%)...`, info);
              } else if (p.status === 'initiate' || p.status === 'download') {
                emitProgress(26, 'Downloading AI segmentation weights...', info);
              } else if (p.status === 'ready') {
                emitProgress(86, 'AI model weights loaded into memory.', info);
              }
            } else if (info.stage === 'ready') {
              emitProgress(90, 'Segmenting subject & generating transparent PNG...', info);
            }
          }
        });

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

        emitProgress(100, 'Background removed successfully in your browser!');

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

  // Schedule non-blocking background model preload once when browser is idle
  function scheduleBackgroundPreload() {
    const trigger = () => {
      preloadBgRemoveModel();
    };
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(trigger, { timeout: 2500 });
    } else {
      setTimeout(trigger, 800);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleBackgroundPreload, { once: true });
  } else {
    scheduleBackgroundPreload();
  }

  window.BgRemoverSDK = BgRemoverSDK;
  window.bgRemoverInstance = new BgRemoverSDK({ maxDimension: MAX_DIMENSION });
})(window, document);

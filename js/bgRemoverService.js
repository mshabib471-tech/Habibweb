/**
 * Habib iFix Tech - Modular AI Background Remover SDK
 * Standardized JavaScript SDK for AI Background Removal
 * Provider: BgRemovers JavaScript SDK (Proxied securely through backend API)
 */
(function(window) {
  'use strict';

  class BgRemoverSDK {
    constructor(config = {}) {
      this.endpoint = config.endpoint || '/api/tools/remove-bg';
      this.provider = config.provider || 'bgremovers';
      this.timeoutMs = config.timeoutMs || 35000;
    }

    /**
     * Remove background from File object, Blob, or base64 data URL
     * @param {File|Blob|String} inputImage - Local file or data URL
     * @param {Function} onProgress - Progress callback function (percentage, statusText)
     * @returns {Promise<{success: boolean, blob: Blob, blobUrl: string, dataUrl: string, provider: string}>}
     */
    async removeBackground(inputImage, onProgress = () => {}) {
      try {
        onProgress(5, 'Preparing image file...');
        let payload = '';

        if (inputImage instanceof File || inputImage instanceof Blob) {
          payload = await this._fileToBase64(inputImage, (p) => {
            onProgress(5 + Math.round(p * 0.15), 'Reading local image data...');
          });
        } else if (typeof inputImage === 'string') {
          payload = inputImage;
        } else {
          throw new Error('Invalid image input. Please provide a valid JPEG, PNG, or WebP photo.');
        }

        onProgress(25, 'Connecting to AI Background Removal Engine...');

        // Progressive user feedback timer
        let currentStage = 30;
        const progressInterval = setInterval(() => {
          currentStage = Math.min(92, currentStage + Math.floor(Math.random() * 7) + 3);
          if (currentStage < 50) {
            onProgress(currentStage, 'Uploading photo to AI server...');
          } else if (currentStage < 75) {
            onProgress(currentStage, 'Detecting foreground subjects & fine details...');
          } else {
            onProgress(currentStage, 'Applying transparent alpha mask...');
          }
        }, 400);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Provider': this.provider
          },
          body: JSON.stringify({
            image: payload,
            provider: this.provider
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        clearInterval(progressInterval);

        if (!response.ok) {
          let errData;
          try {
            errData = await response.json();
          } catch(e) {
            errData = { message: `HTTP Error ${response.status}: ${response.statusText}` };
          }
          if (response.status === 429) {
            throw new Error('Rate Limit Exceeded: Too many background removal requests. Please wait 30 seconds and try again.');
          }
          throw new Error(errData.message || errData.details || 'Background removal service error.');
        }

        onProgress(95, 'Rendering transparent HD PNG...');
        const resultBlob = await response.blob();
        const blobUrl = URL.createObjectURL(resultBlob);
        const dataUrl = await this._blobToBase64(resultBlob);

        onProgress(100, 'Background removed successfully!');

        return {
          success: true,
          blob: resultBlob,
          blobUrl: blobUrl,
          dataUrl: dataUrl,
          provider: this.provider
        };

      } catch (err) {
        onProgress(0, 'Error: ' + err.message);
        if (err.name === 'AbortError') {
          throw new Error('Processing timed out. Please try uploading a smaller image.');
        }
        throw err;
      }
    }

    _fileToBase64(file, onProgress) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (e) => reject(new Error('Failed to read file: ' + e.message));
        reader.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress(e.loaded / e.total);
          }
        };
        reader.readAsDataURL(file);
      });
    }

    _blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  }

  // Bind to global window scope for modular usage across all pages
  window.BgRemoverSDK = BgRemoverSDK;
  window.bgRemoverInstance = new BgRemoverSDK({ provider: 'bgremovers' });

})(window);

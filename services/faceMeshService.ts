/* global FaceMesh */

export interface Results {
  multiFaceLandmarks: any[][];
  image: HTMLCanvasElement | HTMLVideoElement;
}

export interface FaceMeshCallbacks {
  onResults?: (results: Results) => void;
}

export class FaceMeshService {
  private model: any = null;
  private onResults: (results: Results) => void;

  constructor(options: FaceMeshCallbacks = {}) {
    this.onResults = options.onResults || (() => {});
  }

  async init() {
    if (typeof window === 'undefined') return;

    // Check if FaceMesh is available on window (loaded from CDN)
    const WinFaceMesh = (window as any).FaceMesh;
    if (!WinFaceMesh) {
      throw new Error('FaceMesh library not found. Ensure script is loaded in layout.');
    }

    this.model = new WinFaceMesh({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`,
    });

    this.model.setOptions({
      maxNumFaces: 2,
      refineLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.model.onResults(this.onResults);

    if (typeof this.model.initialize === 'function') {
      await this.model.initialize();
    }
  }

  async send(image: HTMLVideoElement | HTMLCanvasElement) {
    if (this.model) {
      return this.model.send({ image });
    }
  }

  close() {
    if (this.model && typeof this.model.close === 'function') {
      this.model.close();
      this.model = null;
    }
  }
}

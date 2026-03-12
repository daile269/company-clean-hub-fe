import { FaceMesh, Results } from '@mediapipe/face_mesh';

export interface FaceMeshCallbacks {
  onResults?: (results: Results) => void;
}

export class FaceMeshService {
  private model: FaceMesh | null = null;
  private onResults: (results: Results) => void;

  constructor(options: FaceMeshCallbacks = {}) {
    this.onResults = options.onResults || (() => {});
  }

  async init() {
    if (typeof window === 'undefined') return;

    this.model = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`,
    });

    this.model.setOptions({
      maxNumFaces: 2,
      refineLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.model.onResults(this.onResults);

    // Some versions use initialize()
    if (typeof (this.model as any).initialize === 'function') {
      await (this.model as any).initialize();
    }
  }

  async send(image: HTMLVideoElement | HTMLCanvasElement) {
    if (this.model) {
      return this.model.send({ image });
    }
  }

  close() {
    if (this.model) {
      this.model.close();
      this.model = null;
    }
  }
}

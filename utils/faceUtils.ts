import { AUTO_CAPTURE_CONFIG } from '../config/autoCaptureConfig';

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

/**
 * Calculates yaw and pitch ratios from face landmarks.
 * @param landmarks - Array of NormalizedLandmark {x,y,z}
 * @returns {{ yawRatio: number, pitchOffset: number }}
 */
export function estimateFacePose(landmarks: Landmark[]) {
  if (!landmarks || landmarks.length < 455) return { yawRatio: 0, pitchOffset: 0 };
  
  const nose   = landmarks[4];
  const fore   = landmarks[10];
  const chin   = landmarks[152];
  const lCheek = landmarks[234];  
  const rCheek = landmarks[454];  

  const cheekMidX = (lCheek.x + rCheek.x) / 2;
  const faceWidth = Math.abs(rCheek.x - lCheek.x);
  const yawRatio  = faceWidth > 0.01 ? (nose.x - cheekMidX) / faceWidth : 0;

  const faceHeight  = Math.abs(chin.y - fore.y);
  const noseRatio   = faceHeight > 0.01 ? (nose.y - fore.y) / faceHeight : AUTO_CAPTURE_CONFIG.NEUTRAL_NOSE_RATIO;
  const pitchOffset = noseRatio - AUTO_CAPTURE_CONFIG.NEUTRAL_NOSE_RATIO;

  return { yawRatio, pitchOffset };
}

/**
 * Applies Laplacian kernel 3x3 to grayscale image and calculates variance.
 * @param imageData
 * @returns {number}
 */
export function computeSharpness(imageData: ImageData) {
  const { data, width, height } = imageData;
  if (width < 3 || height < 3) return 0;

  const gray = new Uint8Array(width * height);
  for (let i = 0; i < gray.length; i++) {
    gray[i] = Math.round(
      0.299 * data[i * 4] +
      0.587 * data[i * 4 + 1] +
      0.114 * data[i * 4 + 2]
    );
  }

  let sum   = 0;
  let sumSq = 0;
  const count = (width - 2) * (height - 2);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const lap = (
        (-gray[(y - 1) * width + (x - 1)]) + (-gray[(y - 1) * width + x]) + (-gray[(y - 1) * width + (x + 1)]) +
        (-gray[y       * width + (x - 1)]) + (8 * gray[y * width + x])    + (-gray[y       * width + (x + 1)]) +
        (-gray[(y + 1) * width + (x - 1)]) + (-gray[(y + 1) * width + x]) + (-gray[(y + 1) * width + (x + 1)])
      );
      sum   += lap;
      sumSq += lap * lap;
    }
  }

  const mean     = sum / count;
  const variance = (sumSq / count) - (mean * mean);
  return Math.max(0, variance);
}

/**
 * Calculates average luminance of an ImageData (0-255).
 * @param imageData
 * @returns {number}
 */
export function computeBrightness(imageData: ImageData) {
  const { data } = imageData;
  const pixelCount = data.length / 4;
  if (pixelCount === 0) return 0;

  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return total / pixelCount;
}

/**
 * Extracts face bounding box from landmarks.
 * @param landmarks 
 * @returns {Object|null}
 */
export function getFaceBoundingBox(landmarks: Landmark[]) {
  if (!landmarks || landmarks.length === 0) return null;
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (const lm of landmarks) {
    if (lm.x < minX) minX = lm.x;
    if (lm.x > maxX) maxX = lm.x;
    if (lm.y < minY) minY = lm.y;
    if (lm.y > maxY) maxY = lm.y;
  }
  
  return { minX, maxX, minY, maxY };
}

/**
 * Nén ảnh phía Client trước khi upload lên Server / GPT AI Vision.
 * Giúp giảm dung lượng từ 5-10MB xuống còn 200-300KB mà vẫn đảm bảo nét 100% cho AI bóc tách.
 */
export async function compressImage(file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.85): Promise<File> {
  if (!file || !file.type.startsWith('image/')) return file;
  if (file.size < 400 * 1024) return file; // Nếu ảnh đã nhỏ hơn 400KB thì giữ nguyên

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => resolve(file);
    img.src = url;
  });
}

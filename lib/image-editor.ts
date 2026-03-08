/**
 * Utility to render an image with CSS filters and rotation onto a canvas
 * and return the result as a blob for uploading
 */

export interface PhotoTransforms {
    rotation: number; // 0, 90, 180, 270
    brightness: number; // 0-200, 100 is normal
    contrast: number; // 0-200, 100 is normal
    saturation: number; // 0-200, 100 is normal
    blur: number; // 0-20px
    grayscale: number; // 0-100%
}

export async function renderEditedImage(
    imageUrl: string,
    transforms: PhotoTransforms,
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            const canvas = document.createElement("canvas");

            // Calculate new dimensions based on rotation
            const isSwapped = transforms.rotation === 90 ||
                transforms.rotation === 270;
            const width = isSwapped ? img.height : img.width;
            const height = isSwapped ? img.width : img.height;

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Failed to get canvas context"));
                return;
            }

            // Apply filters via canvas filter property (more efficient than CSS)
            ctx.filter =
                `brightness(${transforms.brightness}%) contrast(${transforms.contrast}%) saturate(${transforms.saturation}%) blur(${transforms.blur}px) grayscale(${transforms.grayscale}%)`;

            // Translate and rotate
            ctx.translate(width / 2, height / 2);
            ctx.rotate((transforms.rotation * Math.PI) / 180);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);

            // Convert canvas to blob
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Failed to convert canvas to blob"));
                    }
                },
                "image/jpeg",
                0.95,
            );
        };

        img.onerror = () => {
            reject(new Error("Failed to load image"));
        };

        img.src = imageUrl;
    });
}

import '@testing-library/jest-dom';

// Polyfill ImageData for Node.js/jsdom environments where it is not globally available
if (typeof globalThis.ImageData === 'undefined') {
    class ImageDataPolyfill {
        readonly data: Uint8ClampedArray;
        readonly width: number;
        readonly height: number;
        readonly colorSpace: PredefinedColorSpace = 'srgb';

        constructor(
            dataOrWidth: Uint8ClampedArray | number,
            widthOrHeight: number,
            height?: number,
        ) {
            if (typeof dataOrWidth === 'number') {
                // new ImageData(width, height)
                this.width = dataOrWidth;
                this.height = widthOrHeight;
                this.data = new Uint8ClampedArray(this.width * this.height * 4);
            } else {
                // new ImageData(data, width, height?)
                this.data = dataOrWidth;
                this.width = widthOrHeight;
                this.height = height ?? (dataOrWidth.length / 4 / widthOrHeight);
            }
        }
    }
    (globalThis as any).ImageData = ImageDataPolyfill;
}

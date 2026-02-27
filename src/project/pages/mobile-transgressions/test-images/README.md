# Test Images for Barcode Preprocessing Pipeline

Drop **real barcode photos** (`.png`, `.jpg`, `.jpeg`, `.bmp`, `.webp`) into this folder.

The `imagePreprocessingRealImages.test.tsx` test will:

1. Load every image in this folder
2. Try every preprocessing pipeline combination (white-balance, greyscale, contrast, threshold — in all orderings, with all parameter values)
3. Attempt to decode the barcode using `zxing-wasm` (PDF417)
4. Print a detailed report showing:
   - ✅ Which combinations **successfully decoded** the barcode
   - ❌ Which combinations **failed** to decode
   - 🏆 Best pipelines ranked by how many images they decoded

## Tips

- Use photos taken under different lighting (warm, cool, fluorescent, harsh)
- Include different resolutions (phone camera, webcam, etc.)
- Include both good and challenging barcode photos
- Supported barcode format: **PDF417** (South African driver's license barcodes)


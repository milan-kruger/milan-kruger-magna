import cv from "@techstark/opencv-js";

export type OpenCVModule = typeof cv & {
    onRuntimeInitialized?: () => void;
};

export function distance(
    a: { x: number; y: number },
    b: { x: number; y: number }
) {
    if (!a || !b) return 0;
    return Math.hypot(a.x - b.x, a.y - b.y);
}

export function orderPoints(points: { x: number; y: number }[]): { x: number; y: number }[] {
    if (!points || points.length < 4) {
        console.warn('Not enough points for ordering', points);
        return points;
    }

    try {
        // Calculate center point
        const center = points.reduce(
            (acc, p) => {
                if (!p) return acc;
                return {
                    x: acc.x + (p.x || 0) / 4,
                    y: acc.y + (p.y || 0) / 4
                };
            },
            { x: 0, y: 0 }
        );

        // Filter out invalid points and add angle
        const validPoints = points.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number');

        if (validPoints.length < 4) {
            console.warn('Not enough valid points after filtering');
            return points;
        }

        const withAngle = validPoints.map(p => ({
            ...p,
            angle: Math.atan2(p.y - center.y, p.x - center.x)
        }));

        // Sort by angle
        withAngle.sort((a, b) => a.angle - b.angle);

        // Reorder: top-left (smallest angle), top-right, bottom-right, bottom-left
        return [
            withAngle[0] || { x: 0, y: 0 },
            withAngle[1] || { x: 0, y: 0 },
            withAngle[2] || { x: 0, y: 0 },
            withAngle[3] || { x: 0, y: 0 }
        ].map(({ x, y }) => ({ x, y }));

    } catch (error) {
        console.error('Error ordering points:', error);
        return points;
    }
}

export function perspectiveCorrect(
    canvas: HTMLCanvasElement,
    openCvReady: boolean
): ImageData | null {
    if (!openCvReady) return null;

    // Create a copy of the canvas to work with
    const src = cv.imread(canvas);
    const gray = new cv.Mat();
    const edges = new cv.Mat();
    const blurred = new cv.Mat();
    const threshold = new cv.Mat();
    const dilated = new cv.Mat();
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();

    try {
        // -------- Stage 1: Aggressive preprocessing --------
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // Apply strong Gaussian blur to reduce noise
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

        // Use Canny edge detection with aggressive thresholds
        cv.Canny(blurred, edges, 30, 150, 3);

        // Dilate edges to connect nearby lines
        const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
        cv.dilate(edges, dilated, kernel, new cv.Point(-1, -1), 2);
        kernel.delete();

        // Find contours on the dilated edges
        cv.findContours(
            dilated,
            contours,
            hierarchy,
            cv.RETR_EXTERNAL,
            cv.CHAIN_APPROX_SIMPLE
        );

        if (contours.size() === 0) {
            console.error('No contours found');
            cleanup();
            return null;
        }

        // -------- Stage 2: Aggressive contour finding --------
        // Find largest contour above threshold
        let largestContour: cv.Mat | null = null;
        let maxArea = 0;

        for (let i = 0; i < contours.size(); i++) {
            const cnt = contours.get(i);
            const area = cv.contourArea(cnt);

            if (area > maxArea) {
                maxArea = area;
                if (largestContour) largestContour.delete();
                largestContour = cnt.clone();
            }
        }

        if (!largestContour) {
            cleanup();
            return null;
        }

// Always use minAreaRect
        const rect = cv.minAreaRect(largestContour);
        const box = cv.boxPoints(rect); // Always 4 points

        largestContour.delete();

// Convert to JS points
        const ordered = orderPoints([
            { x: box[0].x, y: box[0].y },
            { x: box[1].x, y: box[1].y },
            { x: box[2].x, y: box[2].y },
            { x: box[3].x, y: box[3].y },
        ]);

        // Validate ordered points
        if (!ordered || ordered.length !== 4) {
            console.error('Invalid ordered points');
            cleanup();
            return null;
        }

        // Calculate destination dimensions
        const width1 = distance(ordered[0], ordered[1]);
        const width2 = distance(ordered[3], ordered[2]);
        if (width1 === 0 || width2 === 0) {
            console.error('Invalid width calculation');
            cleanup();
            return null;
        }

        const maxWidth = Math.max(Math.round(width1), Math.round(width2));
        // Increase width by 20% for better detail
        const targetWidth = Math.round(maxWidth * 1.2);


        const height1 = distance(ordered[0], ordered[3]);
        const height2 = distance(ordered[1], ordered[2]);
        const maxHeight = Math.max(Math.round(height1), Math.round(height2));
        // Maintain aspect ratio
        const targetHeight = Math.round((maxHeight / maxWidth) * targetWidth);

        const MAX_WARP_WIDTH = 420;
        const finalWidth = Math.min(targetWidth, MAX_WARP_WIDTH);
        const scale = finalWidth / targetWidth;
        const finalHeight = Math.round(targetHeight * scale);

        new cv.Size(finalWidth, finalHeight)

        // -------- Stage 4: Apply perspective transform --------
        const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
            ordered[0].x, ordered[0].y,
            ordered[1].x, ordered[1].y,
            ordered[2].x, ordered[2].y,
            ordered[3].x, ordered[3].y
        ]);

        const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
            0, 0,
            finalWidth - 1, 0,
            finalWidth - 1, finalHeight - 1,
            0, finalHeight - 1
        ]);

        const M = cv.getPerspectiveTransform(srcTri, dstTri);
        const warped = new cv.Mat();

        cv.warpPerspective(
            src,
            warped,
            M,
            new cv.Size(targetWidth, targetHeight),
            cv.INTER_CUBIC,
            cv.BORDER_CONSTANT,
            new cv.Scalar(255, 255, 255, 255)
        );

        // -------- Stage 5: Aggressive post-processing --------
        // Convert to grayscale
        const warpedGray = new cv.Mat();
        cv.cvtColor(warped, warpedGray, cv.COLOR_RGBA2GRAY);

        // Convert warped Mat directly to ImageData
        const imgData = new ImageData(
            new Uint8ClampedArray(warpedGray.data),
            warpedGray.cols,
            warpedGray.rows
        );

        // Clean up transform matrices
        srcTri.delete();
        dstTri.delete();
        M.delete();
        warped.delete();

        cleanup();
        return imgData;

    } catch (error) {
        console.error('Perspective correction failed:', error);
        cleanup();
        return null;
    }

    function cleanup() {
        // Safely delete all matrices
        [src, gray, edges, blurred, threshold, dilated, hierarchy].forEach(mat => {
            if (mat && !mat.isDeleted()) mat.delete();
        });

        // Delete contours
        for (let i = 0; i < contours.size(); i++) {
            const cnt = contours.get(i);
            if (cnt && !cnt.isDeleted()) cnt.delete();
        }
        contours.delete();
    }
}

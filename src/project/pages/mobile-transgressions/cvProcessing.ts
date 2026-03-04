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
    openCvReady: boolean,
    maxWidthParameter : number
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

    // Declare variables that need to be accessible in cleanup
    let maxContour: cv.Mat | null = null;

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
        let maxArea = 0;
        let maxPerimeter = 0;
        const imageArea = src.rows * src.cols;
        const minArea = imageArea * 0.05; // Reduced to 5% to catch smaller regions

        for (let i = 0; i < contours.size(); i++) {
            const cnt = contours.get(i);
            const area = cv.contourArea(cnt);
            const perimeter = cv.arcLength(cnt, true);

            if (area < minArea) continue;

            // Approximate contour to polygon with varying precision
            for (let epsilon = 0.01; epsilon <= 0.05; epsilon += 0.01) {
                const approx = new cv.Mat();
                cv.approxPolyDP(cnt, approx, epsilon * perimeter, true);

                // Check if it's a quadrilateral (4 corners) or try to find one with 4-6 corners
                if ((approx.rows === 4 || approx.rows === 5 || approx.rows === 6) &&
                    area > maxArea &&
                    perimeter > maxPerimeter) {

                    maxArea = area;
                    maxPerimeter = perimeter;
                    if (maxContour) maxContour.delete();
                    maxContour = approx.clone();
                    break; // Found a good approximation
                }

                approx.delete();
            }
        }

        // If no quadrilateral found, try a different approach
        if (!maxContour) {
            // Find the largest contour and try to fit a rectangle
            let largestContour: cv.Mat | null = null;
            maxArea = 0;

            for (let i = 0; i < contours.size(); i++) {
                const cnt = contours.get(i);
                const area = cv.contourArea(cnt);
                if (area > maxArea) {
                    maxArea = area;
                    if (largestContour) largestContour.delete();
                    largestContour = cnt.clone();
                }
            }

            if (largestContour) {
                // Get the minimum area rectangle
                const rect = cv.minAreaRect(largestContour);
                // boxPoints returns an array of Point, not a Mat
                const boxPoints = cv.boxPoints(rect);

                // Convert the box points array to a Mat
                const boxMat = cv.matFromArray(4, 1, cv.CV_32FC2, [
                    boxPoints[0].x, boxPoints[0].y,
                    boxPoints[1].x, boxPoints[1].y,
                    boxPoints[2].x, boxPoints[2].y,
                    boxPoints[3].x, boxPoints[3].y
                ]);

                maxContour = boxMat;
                largestContour.delete();
            }
        }

        if (!maxContour) {
            console.error('No contour found for perspective correction');
            cleanup();
            return null;
        }

        // -------- Stage 3: Extract and order the corner points --------
        const points: { x: number; y: number }[] = [];

        // Check the type of matrix and extract points accordingly
        if (maxContour.type() === cv.CV_32FC2 || maxContour.type() === cv.CV_32F) {
            for (let i = 0; i < maxContour.rows; i++) {
                const ptr = maxContour.floatPtr(i, 0);
                if (ptr && ptr.length >= 2) {
                    points.push({
                        x: Math.round(ptr[0]),
                        y: Math.round(ptr[1])
                    });
                }
            }
        } else {
            for (let i = 0; i < maxContour.rows; i++) {
                const ptr = maxContour.intPtr(i, 0);
                if (ptr && ptr.length >= 2) {
                    points.push({
                        x: ptr[0],
                        y: ptr[1]
                    });
                }
            }
        }

        if (points.length < 4) {
            console.error('Not enough points extracted:', points.length);
            cleanup();
            return null;
        }

        // If we have more than 4 points, reduce to 4 corners
        if (points.length > 4) {
            // Find convex hull
            const pointsMat = cv.matFromArray(points.length, 1, cv.CV_32SC2,
                points.flatMap(p => [p.x, p.y]));
            const hull = new cv.Mat();
            cv.convexHull(pointsMat, hull, false, true);

            points.length = 0;
            for (let i = 0; i < hull.rows; i++) {
                const ptr = hull.intPtr(i, 0);
                if (ptr && ptr.length >= 2) {
                    points.push({ x: ptr[0], y: ptr[1] });
                }
            }
            hull.delete();
            pointsMat.delete();
        }

        // Ensure we have exactly 4 points
        if (points.length !== 4) {
            console.error('Invalid number of points after processing:', points.length);
            cleanup();
            return null;
        }

        // Order points
        const ordered = orderPoints(points);

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

        const MAX_WIDTH = maxWidthParameter; // choose whatever you want

        const maxWidth = Math.max(Math.round(width1), Math.round(width2));
        let targetWidth = Math.round(maxWidth * 1.2);

        const height1 = distance(ordered[0], ordered[3]);
        const height2 = distance(ordered[1], ordered[2]);
        const maxHeight = Math.max(Math.round(height1), Math.round(height2));
        let targetHeight = Math.round((maxHeight / maxWidth) * targetWidth);

// Clamp width while keeping aspect ratio
        if (targetWidth > MAX_WIDTH) {
            const scale = MAX_WIDTH / targetWidth;
            targetWidth = MAX_WIDTH;
            targetHeight = Math.round(targetHeight * scale);
        }

        // -------- Stage 4: Apply perspective transform --------
        const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
            ordered[0].x, ordered[0].y,
            ordered[1].x, ordered[1].y,
            ordered[2].x, ordered[2].y,
            ordered[3].x, ordered[3].y
        ]);

        const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
            0, 0,
            targetWidth - 1, 0,
            targetWidth - 1, targetHeight - 1,
            0, targetHeight - 1
        ]);

        const M = cv.getPerspectiveTransform(srcTri, dstTri);
        const warped = new cv.Mat();

        cv.warpPerspective(
            src,
            warped,
            M,
            new cv.Size(targetWidth, targetHeight),
            cv.INTER_LINEAR,
            cv.BORDER_CONSTANT,
            new cv.Scalar(255, 255, 255, 255)
        );

        // -------- Stage 5: Aggressive post-processing --------
        // Convert to grayscale
        const warpedGray = new cv.Mat();
        cv.cvtColor(warped, warpedGray, cv.COLOR_RGBA2GRAY);

        const clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
        // clipLimit = 2.0 (contrast strength)
        // tileGridSize = 8x8 (local regions)

        const enhanced = new cv.Mat();
        clahe.apply(warpedGray, enhanced);

        // Convert back to RGBA
        const warpedRGBA = new cv.Mat();
        cv.cvtColor(enhanced, warpedRGBA, cv.COLOR_GRAY2RGBA);

        // cleanup
        clahe.delete();
        enhanced.delete();

        const pixelData = new Uint8ClampedArray(warpedRGBA.data.length);
        pixelData.set(warpedRGBA.data);

        const imgData = new ImageData(
            pixelData,
            warpedRGBA.cols,
            warpedRGBA.rows
        );

        warpedGray.delete();
        warpedRGBA.delete();

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

        // Delete maxContour if it exists
        if (maxContour && !maxContour.isDeleted()) {
            maxContour.delete();
        }
    }
}

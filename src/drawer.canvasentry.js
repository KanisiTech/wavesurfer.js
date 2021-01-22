/**
 * @since 3.0.0
 */

import style from './util/style';
import getId from './util/get-id';

/**
 * The `CanvasEntry` class represents an element consisting of a wave `canvas`
 * and an (optional) progress wave `canvas`, and 'restrict' canvases.
 *
 * The `MultiCanvas` renderer uses one or more `CanvasEntry` instances to
 * render a waveform, depending on the zoom level.
 */
export default class CanvasEntry {
    constructor() {
        /**
         * The wave node
         *
         * @type {HTMLCanvasElement}
         */
        this.wave = null;
        /**
         * The wave canvas rendering context
         *
         * @type {CanvasRenderingContext2D}
         */
        this.waveCtx = null;
        /**
         * The (optional) progress wave node
         *
         * @type {HTMLCanvasElement}
         */
        this.progress = null;
        /**
         * The (optional) progress wave canvas rendering context
         *
         * @type {CanvasRenderingContext2D}
         */
        this.progressCtx = null;
        /**
         * The (optional) restricted wave nodes
         *
         * @type {HTMLCanvasElement}
         */
        this.restrictLeft = null;
        this.restrictRight = null;
        /**
         * The (optional) restricted wave canvas rendering contexts
         *
         * @type {CanvasRenderingContext2D}
         */
        this.restrictLeftCtx = null;
        this.restrictRightCtx = null;
        /**
         * Start of the area the canvas should render, between 0 and 1
         *
         * @type {number}
         */
        this.start = 0;
        /**
         * End of the area the canvas should render, between 0 and 1
         *
         * @type {number}
         */
        this.end = 1;
        /**
         * Unique identifier for this entry
         *
         * @type {string}
         */
        this.id = getId(
            typeof this.constructor.name !== 'undefined'
                ? this.constructor.name.toLowerCase() + '_'
                : 'canvasentry_'
        );
        /**
         * Canvas 2d context attributes
         *
         * @type {object}
         */
        this.canvasContextAttributes = {};
    }

    /**
     * Store the wave canvas element and create the 2D rendering context
     *
     * @param {HTMLCanvasElement} element The wave `canvas` element.
     */
    initWave(element) {
        this.wave = element;
        this.waveCtx = this.wave.getContext('2d', this.canvasContextAttributes);
    }

    /**
     * Store the progress wave canvas element and create the 2D rendering
     * context
     *
     * @param {HTMLCanvasElement} element The progress wave `canvas` element.
     */
    initProgress(element) {
        this.progress = element;
        this.progressCtx = this.progress.getContext(
            '2d',
            this.canvasContextAttributes
        );
    }

    initRestricted(elementLeft, elementRight) {
        this.restrictLeft = elementLeft;
        this.restrictRight = elementRight;
        this.restrictLeftCtx = this.restrictLeft.getContext(
            '2d',
            this.canvasContextAttributes
        );
        this.restrictRightCtx = this.restrictRight.getContext(
            '2d',
            this.canvasContextAttributes
        );
    }

    /**
     * Update the dimensions
     *
     * @param {number} elementWidth Width of the entry
     * @param {number} totalWidth Total width of the multi canvas renderer
     * @param {number} width The new width of the element
     * @param {number} height The new height of the element
     */
    updateDimensions(elementWidth, totalWidth, width, height) {
        // where the canvas starts and ends in the waveform, represented as a
        // decimal between 0 and 1
        this.start = this.wave.offsetLeft / totalWidth || 0;
        this.end = this.start + elementWidth / totalWidth;

        // set wave canvas dimensions
        let elementSize = { width: elementWidth + 'px' };

        /**
         * Style an element for width & height
         *
         * @param {HtmlElement} element Element to update
         */
        function updateStyle(element) {
            element.width = width;
            element.height = height;
            style(element, elementSize);
        }

        updateStyle(this.wave);

        if (this.hasProgressCanvas) {updateStyle(this.progress);}
        if (this.hasRestrictedCanvases) {
            updateStyle(this.restrictLeft);
            updateStyle(this.restrictRight);
        }
    }

    /**
     * Clear the wave and progress rendering contexts
     */
    clearWave() {
        // wave
        this.waveCtx.clearRect(
            0,
            0,
            this.waveCtx.canvas.width,
            this.waveCtx.canvas.height
        );

        // progress
        if (this.hasProgressCanvas) {
            this.progressCtx.clearRect(
                0,
                0,
                this.progressCtx.canvas.width,
                this.progressCtx.canvas.height
            );
        }
    }

    /**
     * Set the fill styles for wave and progress
     *
     * @param {string} waveColor Fill color for the wave canvas
     * @param {?string} progressColor Fill color for the progress canvas
     * @param {?string} restrictColor Fill color for the 'restricted portions' canvases
     */
    setFillStyles(waveColor, progressColor, restrictColor) {
        this.waveCtx.fillStyle = waveColor;

        if (this.hasProgressCanvas) {
            this.progressCtx.fillStyle = progressColor;
        }

        if (this.hasRestrictedCanvases) {
            this.restrictLeftCtx.fillStyle = restrictColor;
            this.restrictRightCtx.fillStyle = restrictColor;
        }
    }

    /**
     * Draw a rectangle for wave and progress
     *
     * @param {number} x X start position
     * @param {number} y Y start position
     * @param {number} width Width of the rectangle
     * @param {number} height Height of the rectangle
     * @param {number} radius Radius of the rectangle
     */
    fillRects(x, y, width, height, radius) {
        this.fillRectToContext(this.waveCtx, x, y, width, height, radius);

        if (this.hasProgressCanvas) {
            this.fillRectToContext(
                this.progressCtx,
                x,
                y,
                width,
                height,
                radius
            );
        }
    }

    /**
     * Draw the actual rectangle on a `canvas` element
     *
     * @param {CanvasRenderingContext2D} ctx Rendering context of target canvas
     * @param {number} x X start position
     * @param {number} y Y start position
     * @param {number} width Width of the rectangle
     * @param {number} height Height of the rectangle
     * @param {number} radius Radius of the rectangle
     */
    fillRectToContext(ctx, x, y, width, height, radius) {
        if (!ctx) {
            return;
        }

        if (radius) {
            this.drawRoundedRect(ctx, x, y, width, height, radius);
        } else {
            ctx.fillRect(x, y, width, height);
        }
    }

    /**
     * Draw a rounded rectangle on Canvas
     *
     * @param {CanvasRenderingContext2D} ctx Canvas context
     * @param {number} x X-position of the rectangle
     * @param {number} y Y-position of the rectangle
     * @param {number} width Width of the rectangle
     * @param {number} height Height of the rectangle
     * @param {number} radius Radius of the rectangle
     *
     * @return {void}
     * @example drawRoundedRect(ctx, 50, 50, 5, 10, 3)
     */
    drawRoundedRect(ctx, x, y, width, height, radius) {
        if (height === 0) {
            return;
        }
        // peaks are float values from -1 to 1. Use absolute height values in
        // order to correctly calculate rounded rectangle coordinates
        if (height < 0) {
            height *= -1;
            y -= height;
        }
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(
            x + width,
            y + height,
            x + width - radius,
            y + height
        );
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Render the actual wave and progress lines
     *
     * @param {number[]} peaks Array with peaks data
     * @param {number} absmax Maximum peak value (absolute)
     * @param {number} halfH Half the height of the waveform
     * @param {number} offsetY Offset to the top
     * @param {number} start The x-offset of the beginning of the area that
     * should be rendered
     * @param {number} end The x-offset of the end of the area that
     * should be rendered
     */
    drawLines(peaks, absmax, halfH, offsetY, start, end) {
        const self = this;

        /**
         * Update a context with the required lines
         *
         * @param {CanvasContext2D} c Context to draw lines to
         */
        function updateContext(c) {
            self.drawLineToContext(c, peaks, absmax, halfH, offsetY, start, end);
        }
        updateContext(this.waveCtx);
        if (this.hasProgressCanvas) { updateContext(this.progressCtx); }
        if (this.hasRestrictedCanvases) { updateContext(this.restrictLeftCtx); updateContext(this.restrictRightCtx); }
    }

    /**
     * Render the actual waveform line on a `canvas` element
     *
     * @param {CanvasRenderingContext2D} ctx Rendering context of target canvas
     * @param {number[]} peaks Array with peaks data
     * @param {number} absmax Maximum peak value (absolute)
     * @param {number} halfH Half the height of the waveform
     * @param {number} offsetY Offset to the top
     * @param {number} start The x-offset of the beginning of the area that
     * should be rendered
     * @param {number} end The x-offset of the end of the area that
     * should be rendered
     */
    drawLineToContext(ctx, peaks, absmax, halfH, offsetY, start, end) {
        // Note: 'start' and 'end' params are indices into 'peaks'.  They define the 'view'.
        //
        // 'this.start' and 'this.end' are in relative units (0--1).  They define the portion
        // of the view for which this canvas is responsible.
        if (!ctx) return;

        const view_length = (end - start);

        // 'first', 'last' are indices into peaks, for this canvas.
        const first = start + Math.round(view_length * this.start);

        // use one more peak value to make sure we join peaks at ends -- unless,
        // of course, this is the last canvas
        const last = start + Math.round(view_length * this.end) + 1;

        const canvas_span = (last - first); // how many indices in this canvas
        const scale = (ctx.canvas.width - 1) / canvas_span ;

        // optimization
        const halfOffset = halfH + offsetY;
        const absmaxHalf = absmax / halfH;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // debugging canvas extents / co-ords
        if (this.canvasDebugLine /* || 1*/) { // keep debug code (ESLint-friendly).
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
            ctx.closePath();
            ctx.stroke();
        }

        const first_peak_max = (peaks[0] || 0);
        const first_peak_min = (peaks[1] || 0);

        ctx.beginPath();
        ctx.moveTo(0, halfOffset);
        ctx.lineTo(0,
            halfOffset - Math.round(first_peak_max / absmaxHalf)
        );

        let i, peak_val, peak_height, canvas_x, canvas_y;
        for (i = first; i < last; i++) {
            peak_val = peaks[2 * i] || 0;
            peak_height = Math.round(peak_val / absmaxHalf);
            canvas_x = (i - first) * scale + this.halfPixel;
            canvas_y = halfOffset - peak_height;
            ctx.lineTo(canvas_x, canvas_y);
        }

        // draw the bottom edge going backwards, to make a single
        // closed hull to fill
        let j = last - 1;
        for (j; j >= first; j--) {
            peak_val = peaks[2 * j + 1] || 0;
            peak_height = Math.round(peak_val / absmaxHalf); // probably negative
            canvas_x = (j - first) * scale + this.halfPixel;
            canvas_y = halfOffset - peak_height;
            ctx.lineTo(canvas_x, canvas_y);
        }

        ctx.lineTo(0,
            halfOffset - Math.round(first_peak_min / absmaxHalf)
        );

        ctx.closePath();
        ctx.fill();
        // ctx.stroke();
    }

    /**
     * Destroys this entry
     */
    destroy() {
        this.waveCtx = null;
        this.wave = null;

        this.progressCtx = null;
        this.progress = null;
    }

    /**
     * Return image data of the wave `canvas` element
     *
     * When using a `type` of `'blob'`, this will return a `Promise` that
     * resolves with a `Blob` instance.
     *
     * @param {string} format='image/png' An optional value of a format type.
     * @param {number} quality=0.92 An optional value between 0 and 1.
     * @param {string} type='dataURL' Either 'dataURL' or 'blob'.
     * @return {string|Promise} When using the default `'dataURL'` `type` this
     * returns a data URL. When using the `'blob'` `type` this returns a
     * `Promise` that resolves with a `Blob` instance.
     */
    getImage(format, quality, type) {
        if (type === 'blob') {
            return new Promise(resolve => {
                this.wave.toBlob(resolve, format, quality);
            });
        } else if (type === 'dataURL') {
            return this.wave.toDataURL(format, quality);
        }
    }
}

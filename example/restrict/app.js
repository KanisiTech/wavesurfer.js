/* eslint-env jquery */
'use strict';

var wavesurfer;

// Init & load
document.addEventListener('DOMContentLoaded', function() {
    var options = {
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple',
        loaderColor: 'purple',
        cursorColor: 'navy',
        maxCanvasWidth: 4000, // good for debugging
        restrictOptions: { restrict: true, start: 5, end: 15, relativeTime: false, zoom: false, color: '#bbb' },
        plugins: [
            WaveSurfer.timeline.create({
                container: '#wave-timeline'
            })
        ]
    };

    if (location.search.match('scroll')) {
        options.minPxPerSec = 100;
        options.scrollParent = true;
    }

    if (location.search.match('narrow')) {
        options.restrictOptions.zoom = true;
    }


    if (location.search.match('normalize')) {
        options.normalize = true;
    }

    // Init wavesurfer
    wavesurfer = WaveSurfer.create(options);

    /* Progress bar */
    (function() {
        var progressDiv = document.querySelector('#progress-bar');
        var progressBar = progressDiv.querySelector('.progress-bar');

        var showProgress = function(percent) {
            progressDiv.style.display = 'block';
            progressBar.style.width = percent + '%';
        };

        var hideProgress = function() {
            progressDiv.style.display = 'none';
        };

        wavesurfer.on('loading', showProgress);
        wavesurfer.on('ready', hideProgress);
        wavesurfer.on('destroy', hideProgress);
        wavesurfer.on('error', hideProgress);
    })();

    wavesurfer.load('../media/demo.wav');

    $("[data-action=toggle-canvas-size]").click(function() {
        if (options.maxCanvasWidth > 1000) {
            options.maxCanvasWidth = 40;
        } else {
            options.maxCanvasWidth = 4000;
        }
        wavesurfer.setCanvasWidth(options.maxCanvasWidth);
    });

    $("[data-action=toggle-canvas-border]").click(function() {
        if (options.canvasBorder == 'dashed red') {
            options.canvasBorder = 'none';
        } else {
            options.canvasBorder = 'dashed red';
        }
        wavesurfer.setCanvasBorder(options.canvasBorder);
    });
});

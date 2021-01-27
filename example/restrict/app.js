/* eslint-env jquery */
"use strict";

var wavesurfer;

// Init & load
document.addEventListener("DOMContentLoaded", function() {
    var options = {
        container: "#waveform",
        waveColor: "violet",
        progressColor: "purple",
        loaderColor: "purple",
        cursorColor: "navy",
        barWidth: 10,
        maxCanvasWidth: 4000, // good for debugging
        restrictOptions: {
            restrict: true,
            start: 5,
            end: 15,
            relativeTime: false,
            narrow: false,
            color: "#bbb"
        },
        plugins: [
            WaveSurfer.timeline.create({
                container: "#wave-timeline"
            }),
            WaveSurfer.regions.create({
                regions: [],
                dragSelection: false
            })
        ]
    };

    if (location.search.match("scroll")) {
        options.minPxPerSec = 100;
        options.scrollParent = true;
    }

    if (location.search.match("narrow")) {
        options.restrictOptions.narrow = true;
    }

    if (location.search.match("normalize")) {
        options.normalize = true;
    }

    // Init wavesurfer
    wavesurfer = WaveSurfer.create(options);

    function initTrimRegionHandles({ start, end }) {
        wavesurfer.addRegion({
            id: "trim",
            start,
            end
        });
    }

    function removeTrimRegionHandles() {
        if (wavesurfer.regions.list.trim) {
            wavesurfer.regions.list.trim.remove();
        }
    }

    /* Progress bar */
    (function() {
        var progressDiv = document.querySelector("#progress-bar");
        var progressBar = progressDiv.querySelector(".progress-bar");

        var showProgress = function(percent) {
            progressDiv.style.display = "block";
            progressBar.style.width = percent + "%";
        };

        var hideProgress = function() {
            progressDiv.style.display = "none";
        };

        const handleReady = () => {
            hideProgress();
            if (
                !options.restrictOptions.narrow &&
                options.restrictOptions.restrict
            ) {
                initTrimRegionHandles({
                    start: options.restrictOptions.start,
                    end: options.restrictOptions.end
                });
            }
        };

        wavesurfer.on("loading", showProgress);
        wavesurfer.on("ready", handleReady);
        wavesurfer.on("destroy", hideProgress);
        wavesurfer.on("error", hideProgress);

        wavesurfer.on("region-updated", function({ start, end }) {
            options.restrictOptions.start = start;
            options.restrictOptions.end = end;
            wavesurfer.updateRestrictOptions(options.restrictOptions);
        });

        wavesurfer.on("region-update-end", ({ start, end }) => {
            wavesurfer.play(start, end);
        });

        wavesurfer.on("restriction-updated", ({ start, end }) => {
            console.log("Trim updated", { start, end });
        });
    })();

    wavesurfer.load("../media/demo.wav");

    $("[data-action=toggle-canvas-size]").click(function() {
        if (options.maxCanvasWidth > 1000) {
            options.maxCanvasWidth = 40;
        } else {
            options.maxCanvasWidth = 4000;
        }
        wavesurfer.setCanvasWidth(options.maxCanvasWidth);
    });

    $("[data-action=toggle-canvas-border]").click(function() {
        if (options.canvasBorder == "dashed red") {
            options.canvasBorder = "none";
        } else {
            options.canvasBorder = "dashed red";
        }
        wavesurfer.setCanvasBorder(options.canvasBorder);
    });

    $("[data-action=toggle-restrict]").click(function() {
        if (options.restrictOptions.restrict) {
            options.restrictOptions.restrict = false;
        } else {
            options.restrictOptions.restrict = true;
        }
        wavesurfer.updateRestrictOptions(options.restrictOptions);
    });

    $("[data-action=toggle-narrow]").click(function() {
        if (options.restrictOptions.narrow) {
            options.restrictOptions.narrow = false;
            initTrimRegionHandles({
                start: options.restrictOptions.start,
                end: options.restrictOptions.end
            });
        } else {
            options.restrictOptions.narrow = true;
            removeTrimRegionHandles();
        }
        wavesurfer.updateRestrictOptions(options.restrictOptions);
    });

    $("[data-action=toggle-relative]").click(function() {
        if (options.restrictOptions.relativeTime) {
            options.restrictOptions.relativeTime = false;
        } else {
            options.restrictOptions.relativeTime = true;
        }
        wavesurfer.updateRestrictOptions(options.restrictOptions);
    });

    $("[data-action=toggle-draw]").click(function() {
        if (options.barWidth) {
            options.barWidth = undefined;
        } else {
            options.barWidth = 10;
        }

        wavesurfer.updateParams(options);
    });
});

# Rotor private fork of [wavesurfer.js](https://wavesurfer-js.org)

See the [original README](README.orig.md).

This fork is for the purposes of adding a 'restricted view' feature:

 - define two display modes: 'trim' and 'trimmed'
 - 'trim':
   -- draggable handles, grayed-out start / end regions
 - 'trimmed':
   -- scrolling & zooming are restricted to the trimmed region
   -- tickmarks are reset so that 0 corresponds to trim start
 - API: set trim, get trim, set mode

## To pull changes from upstream
```
git remote add public git@github.com:katspaugh/wavesurfer.js.git
git pull public master # Creates a merge commit
git push origin master
```

## Hacking

```
npm install
npm start
```

then visit a local URL, e.g.  `http://localhost:8080/example/restrict/`

## Notes

Run `npm run build:plugins` to update plugins (not picked up by FS watcher).

The 'timeline' plugin has an 'offset' param which shifts the display, but
doesn't draw negative ticks.  That's why I added the 'timeOffset' param.

Many of the deps are marked deprecated
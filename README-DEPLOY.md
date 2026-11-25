# Electronics Repair Simulator: PWA + Firebase setup

Files: index.html (the game), manifest.webmanifest, sw.js, icons/, firebase-config.js, firebase-sync.js, firebase.json, firestore.rules, .firebaserc

## Run it
PWA install and offline mode need https or localhost (not file://). Test locally with `npx serve .`

## Turn on cloud save
1. Firebase console: create a project, add a Web app, copy its config into firebase-config.js.
2. Authentication > Sign-in method: enable Google.
3. Firestore Database: create one, then deploy firestore.rules.
4. Put your project id in .firebaserc, then run `firebase deploy`.
Players stay on local saves until they tap Upload in Settings > Cloud save.

## Updating
Change `VERSION` in sw.js (for example ers-v2) whenever you edit the game so installed copies refresh.


## Project structure (ERS Academy rebuild)

- `index.html`: minimal shell that loads the scripts below.
- `js/engine.js`: the original game engine, unchanged in behaviour (60 levels, circuit model, multimeter, bench supply, soldering thermodynamics, compatibility and consequence rules, scoring, save/import/export, cloud hooks). It contains no markup.
- `js/art.js`: the project's original vector art for devices, instrument faces and tool icons.
- `js/ui/core.js`: router, shell (sidebar and tab bar), icons, event handling.
- `js/ui/academy.js`: Home, Learn, lessons, labs, Library, Progress, Profile and settings, Safety, Result, Workshop hub, welcome tour.
- `js/ui/lessons.js` and `js/ui/widgets.js`: 12 lessons and 11 interactive labs.
- `js/ui/parts.js`: component illustrations, schematic symbols, the PCB layout and device renderers.
- `js/ui/workshop.js`: the repair bench (pan and zoom, tool rack, inspector, instruments, screws and tray).
- `assets/`: SVG scenes, props and device renders. `tools/` holds the Python scripts that generate them.
- `firebase-*.js`, `firestore.rules`, `sw.js`, `manifest.webmanifest`, `icons/`: unchanged apart from the service worker cache list.

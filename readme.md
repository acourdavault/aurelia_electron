# aurelia electron

## set up
This repository has been created with [aurelia-cli](https://github.com/aurelia/cli)
Settings where:
 - bundling with RequireJs (other choice could have been webpack)
 - Typescript
 - Tests set up
 - no style processor
 - no minification
 
Electron was added as in `dependancies` in the `package.json` with `npm install --save electron`

In order to let aurelia inject its require, this change was applied to the `index.html` file (see [doc](https://github.com/aurelia/cli)) to rename the require injected by electron.

```html
<script>
window.nodeRequire = require;
delete window.require;
delete window.exports;
delete window.module;
</script>
```

Also in the aurela project build tast `aurelia_project\tasks\build.ts` we had to make several changes:
```ts
var electron = require('gulp-electron');
var packageJson = require('../../package.json');
```

Adding 3 functions:
```ts

function copyScripts(){
  return gulp.src(["scripts/**/*.*"]).pipe(gulp.dest("./electron-build/src/scripts"));
}

function copyOthers(){
  return gulp.src(["./index.html", "./index.js", "./package.json", "./favicon.ico"]).pipe(gulp.dest("./electron-build/src"));
}

function buildElectron() {
return gulp.src("electron-build/src/*")
  .pipe(electron({
      src: './electron-build/src',
      packageJson: "./package.json",
      release: './electron-build/release',
      cache: './electron-build/cache',
      version: 'v1.6.15',
      packaging: true,
      platforms: ['win32-x64'],
      platformResources: {
          darwin: {
              CFBundleDisplayName: packageJson.name,
              CFBundleIdentifier: packageJson.name,
              CFBundleName: packageJson.name,
              CFBundleVersion: packageJson.version,
              icon: 'gulp-electron.icns'
          },
          win: {
              "version-string": packageJson.version,
              "file-version": packageJson.version,
              "product-version": packageJson.version,
              "icon": 'favicon.ico'
          }
      }
  }))
  .pipe(gulp.dest("electron-build/release"));;
}

```

We also add the tast build electron to the main build task except if  `--web` is specified.


**IMPORTANT** notice the name of the electron entry file: `electron_main.js`
This file must be created.
The code used is the one from a boiler plate electron project (which depending on the boiler plate is `main.js, or `index.js`)
The code of this file will be executed in the main thread to launch the application.

**IMPORTANT 2**
This build uses `gulp-electron` which on Windows at least depends on `7z` [gulp electron](https://www.npmjs.com/package/gulp-electron)
You must have it installed AND **in your path** (add `c:\Program Files\7-Zip\` to your path probably)
If you want to add platforms to the build you should go check there

**IMPORTANT 3**
You may have to update the version of Electron in the buildElectron function.
The error that may happen is that You cannot open the electron prebuild archive, which could mean a 0 Byte file.
If this is the case, it because the download failed without providing an error.
In this case check if the version of electron is recent or no by going to the [release page](https://github.com/electron/electron/releases)

## start things up
**do not forget to do `npm install`**

### short version
What you will do 90% of the time.
`npm run dev` runs the electron app produced by the build and keeps a watch

### details
build all `au build`

start electron app manually `electron electron_main.js`
start aurelia manually on a webpage by using `au run --watch`

Note that the build always keeps the electron app up to date.
IF you don't want it, you can specify `--web`
`au run --watch --web` or `au build --web` will not update the electron app.

This is just to save time when rebuilding (if you use watch).

When you want to run the "release" version of electron build,
Launch `./electron-build/release/<electron version>/<platform>/gulp-electron.exe`

## distribute
The application is available in `electron-build/release`
This project does not provide an installer (because i don't need one).

## Notes on language and tools
The Aurelia project uses Typescript.

The electron source uses Vanilla Javascript.
**it is important to note that the electron source does not receive any kind of "babel" processing in the build process**
If you d prefer to use Ts or ESNext in `index.js` for electron remember to add the proper preprocessing steps

## electron specific code
there is no background process set up by electron.
If you want one, you must call it with **nodeRequire** in the HTML.
**AND ADD IT TO THE BUILD**
If it is in `scripts` it will be imported automatically
Simply add if to the source pattern in `build.ts` `copyOthers()`.

**again the `script` folder is populated by the bundling of the front end code**, if you want to add backend code, you could for instance add another script folder that is processed with babel and then put in `scripts`.
You could use Rollup for instance to ensure that you did a good bundling of the backend.

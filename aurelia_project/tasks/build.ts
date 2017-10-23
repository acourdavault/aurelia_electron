import * as gulp from 'gulp';
import {CLIOptions, build as buildCLI} from 'aurelia-cli';
import transpile from './transpile';
import processMarkup from './process-markup';
import processCSS from './process-css';
import copyFiles from './copy-files';
import watch from './watch';
import * as project from '../aurelia.json';
var electron = require('gulp-electron');
var packageJson = require('../../package.json');

let build = gulp.series(
  readProjectConfiguration,
  gulp.parallel(
    transpile,
    processMarkup,
    processCSS,
    copyFiles
  ),
  writeBundles,
  gulp.parallel(
      copyScripts,
      copyOthers
  )
);

let main;

if (CLIOptions.taskName() === 'build' && CLIOptions.hasFlag('watch')) {
  main = gulp.series(
    build,
    (done) => { watch(); done(); }
  );
} else {
  main = build;
}

if (! CLIOptions.hasFlag('web')) {
  main = gulp.series(
    main, 
    buildElectron
  );
}

function readProjectConfiguration() {
  return buildCLI.src(project);
}

function writeBundles() {
  return buildCLI.dest();
}

function copyScripts(){
  return gulp.src(["scripts/**/*.*"]).pipe(gulp.dest("./electron-build/src/scripts"));
}

function copyOthers(){
  return gulp.src(["./index.html", "index.js", "./package.json", "./favicon.ico"]).pipe(gulp.dest("./electron-build/src"));
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

export { main as default };

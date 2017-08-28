const npsUtils = require('nps-utils');
const series = npsUtils.series;
const rimraf = npsUtils.rimraf;
const mkdirp = npsUtils.mkdirp;
const copy = npsUtils.copy;

module.exports = {
  scripts: {
    "default": "nodemon --watch src/server src/server --exec babel-node --presets es2015,stage-0",
    "lint": {
      default: "eslint src",
      fix: "eslint src --fix"
    },
    "compile-css": {
      default: series(
        rimraf('dist/css'),
        mkdirp('dist/css'),
        'lessc --relative-urls src/client/less/index.less dist/css/index.css'
      )
    },
    "application-build": {
      default: series(
        rimraf('rimraf dist/application'),
        mkdirp('dist/application'),
        'babel --copy-files --no-babelrc --presets es2015,stage-0 --plugins lodash --ignore *.spec.js src/server --out-dir dist/application/src/server',
        "cpx 'src/client/**' dist/application/src/client"
      )
    },
    "application-package": {
      default: series(
        'nps application-build',
        'mvn clean package'
      )
    },
    "application-deploy": {
      default: series(
        'nps application-build',
        'mvn clean deploy'
      )
    },
    "npm-build": {
      default: series(
        'nps compile-css',
        rimraf('rimraf dist/npm'),
        mkdirp('dist/npm'),
        // copy function does not really works for folders at the moment 2017.08.27
        "cpx 'src/client/**' dist/npm",
        copy("dist/css/index.css dist/npm")
      )
    },
    "npm-publish": {
      default: series(
        'nps npm-build',
        'npm-publish --release'
      )
    },
    "grails-plugin-package": {
      default: series(
        'nps compile-css',
        rimraf('rimraf dist/npm'),
        mkdirp('dist/npm'),
        copy("dist/css/index.css dist/grails"),
        "cpx 'src/client/**' dist/grails",
        "grails-plugin-package --release"
      )
    },
    "grails-plugin-deploy": {
      default: series(
        "nps grails-plugin-package",
        "grails-plugin-deploy --release"
      )
    },
    "build-release": {
      default: npsUtils.concurrent.nps('application-package', 'grails-plugin-package', 'npm-build')
    },
    "publish-release": {
      default: series('nps application-deploy', 'nps grails-plugin-deploy', 'nps npm-publish')
    }
  }
}

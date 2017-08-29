const path = require('path');
const process = require('process');
const express = require('express');
const os = require('os');
const fs = require('fs');
const rimraf = require('rimraf');
const directoryWatcher = require('./util/directoryWatching').directoryWatcher;

let config = {};
try {
  config = require('../../configuration.json');
} catch (e) {
  console.log('config file "configuration.json" is not found');
}
if (config.customizationAreaPath) {
  console.log(`Configuration area is located by path '${config.customizationAreaPath}'`);
} else {
  console.log(`Configuration area is not configured`);
}

const tmpDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'oc-ui'));
console.log(`temporary working directory '${tmpDirectory}' is created`);
const pathToCss = path.join(tmpDirectory, 'index.css');

let lessRecompilationContent = `@import "${path.join(__dirname, '../client/less/index.less')}";`;
if (config.customizationAreaPath) {
  console.log(`Configuration area is located by path '${config.customizationAreaPath}'`);
  lessRecompilationContent += `
@import (optional) "${path.join(config.customizationAreaPath, 'less/index.less')}";`;
}

const lessRecompile = function() {
  console.log(`recompiling less files into \n'${pathToCss}' file...`);

  // eslint-disable-next-line consistent-return
  require('less').render(lessRecompilationContent,
    {
      relativeUrls: false,
      rootpath: 'fake'
    },
    function(e, output) {
      if (e) {
        console.log(e);
        return;
      }
      fs.writeFile(pathToCss, output.css, function(err) {
        if (err) {
          console.log(`Error writing file '${err}'`);
          return;
        }
      });
    }
  );
};

let recompileLessTimer;
// Watcher for standard less files. Run less recompiling.???
// eslint-disable-next-line no-unused-vars
const lessDirectories = [
  path.join(__dirname, '../client/less/**/*.less')
];
if (config.customizationAreaPath) {
  lessDirectories.push(path.join(config.customizationAreaPath, '**/*.less'));
}
const lessDirectoriesWatcher = directoryWatcher(lessDirectories, (event, path) => {
  // console.log(`(event:${event}): ${path} is changed, recompiling less files`);
  // run less recompiling if less file was changed.
  clearTimeout(recompileLessTimer);
  recompileLessTimer = setTimeout(lessRecompile, 1000);
});

// configure application
const app = express();
// middlewares
app.use(require('cors')());
app.use(require('compression')());
// routes
app.get(`/index.css`, (req, res) => {
  res.sendFile(pathToCss, function(err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
  });
});
// if customization is available then we would add possibility to expose its content
if (config.customizationAreaPath) {
  // todo ignore less files
  app.use('/', express.static(config.customizationAreaPath));
}
// todo: ignore less files
app.use('/', express.static(path.join(__dirname, '../client')));

// run application (web server)
const port = process.env.PORT || 3042;
const host = process.env.HOST || 'localhost';
app.listen(port, host, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`Listening at http://${host}:${port}`);
});

// configure process exit
const exitHandler = (options = { exit: false, cleanup: false }) => {
  return (code) => {
    if (code) {
      console.log(`about to exit with code '${code}'`);
    }
    if (options.cleanup) {
      // stop watching less files
      if (lessDirectoriesWatcher) {
        lessDirectoriesWatcher.close();
      }
      // stop calling less recompiler
      clearTimeout(recompileLessTimer);
      // removing temporaty directory where compiled index.css is located
      rimraf.sync(tmpDirectory);
    }
    if (options.exit) {
      process.exit();
    }
  }
};
// the program will not close instantly
process.stdin.resume();
// do something when app is closing
process.on('exit', exitHandler({ cleanup: true }));
// catches ctrl+c event
process.on('SIGINT', exitHandler({ exit: true }));
// catches uncaught exceptions
process.on('uncaughtException', exitHandler({ exit: true }));

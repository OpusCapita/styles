const path = require('path');
const process = require('process');
const express = require('express');
const os = require('os');
const fs = require('fs');
const rimraf = require('rimraf');
import {
  directoryWatcher,
  direrctoryWatchHandler
} from './util/directoryWatching';

let config = {};
try {
  config = require('../../configuration.json');
} catch (e) {
  console.log('config file "configuration.json" is not found');
}

const tmpDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'oc-ui'));
console.log(`temporary working directory '${tmpDirectory}' is created`);

const pathToCss = path.join(tmpDirectory, 'index.css');

const tmpResourcesDirectory = path.join(tmpDirectory, 'resources');
const tmpCustomizationAreaDirectory = path.join(tmpDirectory, 'customization');

const lessRecompilationContent = `
@import "${tmpResourcesDirectory}/less/index.less";
@import (optional) "${tmpCustomizationAreaDirectory}/less/index.less";
`;

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

const originalResourcesDirectory = path.join(__dirname, '../client/resources');
// Watcher for original sources directory, ignores .dotfiles???
// eslint-disable-next-line no-unused-vars
const originalResourcesDirectoryWatcher = directoryWatcher(originalResourcesDirectory, (event, path) => {
  direrctoryWatchHandler(event, path, path.replace(originalResourcesDirectory, tmpResourcesDirectory));
});

// Watcher for custom directory, ignores .dotfiles???
let customizationAreaDirectoryWatcher = null;
if (config.customizationAreaPath) {
  console.log(`path to customization '${config.customizationAreaPath}'`);

  // eslint-disable-next-line no-unused-vars
  customizationAreaDirectoryWatcher = directoryWatcher(config.customizationAreaPath, (event, path) => {
    direrctoryWatchHandler(event, path, path.replace(config.customizationAreaPath, tmpCustomizationAreaDirectory));
  });
}

let recompileLessTimer;
// Watcher for standard less files. Run less recompiling.???
// eslint-disable-next-line no-unused-vars
const tmpDirectoryWatcher = directoryWatcher(path.join(tmpDirectory, '**/*.less'), (event, path) => {
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
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});
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
  app.use('/', express.static(tmpCustomizationAreaDirectory));
}
app.use('/', express.static(tmpResourcesDirectory));
app.use('/demo', express.static(path.join(__dirname, '../client/demo')));

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
      if (originalResourcesDirectoryWatcher) {
        originalResourcesDirectoryWatcher.stop();
      }
      if (customizationAreaDirectoryWatcher) {
        customizationAreaDirectoryWatcher.stop();
      }
      if (tmpDirectoryWatcher) {
        tmpDirectoryWatcher.close();
      }
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

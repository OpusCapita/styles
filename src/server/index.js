const path = require('path');
const process = require('process');
const os = require('os');
const express = require('express');
const cors = require('cors');
const chokidar = require('chokidar');
const fs = require('fs-extra');
const exec = require('child_process').exec;
const rimraf = require('rimraf');

let config = {};
try {
  config = require('../../config.json');
} catch (e) {
  console.log('config file "config.json" is not found');
}

const watchInterval = 1000;

const mainCssFile = 'main.css';
const mainLessFile = 'main.less';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oc-ui'));
console.log(`temporary working directory '${tmpDir}' is created`);

const pathToCss = path.join(tmpDir, mainCssFile);
const pathToLess = path.join(tmpDir, mainLessFile);

try {
  // create main.less file
  fs.outputFileSync(pathToLess, '@import "resources/less/main.less"; ' +
    '@import (optional) "customization/less/main.less"; ' +
    '@import (optional) "customization/less/custom.less";');
  console.log("The main.less was saved!");
} catch (err) {
  console.log(err);
}

const lessRecompile = function() {
  console.log(`start less file '${pathToLess}' recompiling into '${pathToCss}' file...`);

  let lesscExec = exec(`lessc --relative-urls ${pathToLess} ${pathToCss}`);

  lesscExec.stdout.on('data', (data) => {
    console.log(`stdout\n'${data}'`);
  });

  lesscExec.stderr.on('data', (data) => {
    console.log(`stderr\n'${data}'`);
  });

  lesscExec.on('close', (code) => {
    console.log(`'${pathToCss}' is recompiled`);
  });
};

const directoryWatcher = (directory, callback) => {
  chokidar.watch(directory, {
    usePolling: true,
    interval: watchInterval,
    binaryInterval: watchInterval,
    alwaysStat: true,
    awaitWriteFinish: true
  }).on('all', callback);
};

const direrctoryWatchHandler = function(event, path, tmpPath) {
  if (event === 'change' || event === 'add') {
    fs.copy(path, tmpPath, function(err) {
      if (err) {
        console.error(err)
      }
    });
  }

  if (event === 'unlink' || event === 'unlinkDir') {
    fs.remove(tmpPath, function(err) {
      if (err) {
        console.error(err);
      }
    });
  }

  if ('ready') {
    // console.log('READY');
  }
};

const originalResourcesDirectory = path.join(__dirname, '../client/resources');
const temporaryResourcesDirectory = path.join(tmpDir, 'resources');

// Watcher for custom directory, ignores .dotfiles???
// eslint-disable-next-line no-unused-vars
const originalResourcesDirectoryWatcher = directoryWatcher(originalResourcesDirectory, (event, path) => {
  direrctoryWatchHandler(event, path, path.replace(originalResourcesDirectory, temporaryResourcesDirectory));
});

// let recompileLessTimer;
// Watcher for standard less files. Run less recompiling.???
// eslint-disable-next-line no-unused-vars
// const temporaryResourcesDirectoryWatcher = directoryWatcher(temporaryResourcesDirectory, (event, path) => {
//   if (path.match(/\.less$/)) {
//     // run less recompiling if less file was changed.
//     clearTimeout(recompileLessTimer);
//     recompileLessTimer = setTimeout(lessRecompile, 1000);
//   }
// });

if (config.pathToCustomization) {
  console.log(`path to customization '${config.pathToCustomization}'`);

  const tmpCustomDir = path.join(tmpDir, 'customization');
  const customDir = path.join(config.pathToCustomization);

  // Watcher for custom directory, ignores .dotfiles
  // eslint-disable-next-line no-unused-vars
  const customDirWatcher = directoryWatcher(config.pathToCustomization, (event, path) => {
    direrctoryWatchHandler(event, path, path.replace(customDir, tmpCustomDir));
  });

  // Watcher for tmp directory with customization. Run less recompiling.
  // eslint-disable-next-line no-unused-vars
  // const tmpCustomDirWatcher = directoryWatcher(tmpCustomDir, (event, path) => {
  //   if (path.match(/\.less$/)) {
  //     // run less recompiling if less file was changed.
  //     clearTimeout(recompileLessTimer);
  //     recompileLessTimer = setTimeout(lessRecompile, 1000);
  //   }
  // });
}

let recompileLessTimer;
// Watcher for standard less files. Run less recompiling.???
// eslint-disable-next-line no-unused-vars
const temporaryResourcesDirectoryWatcher = directoryWatcher(path.join(tmpDir, '**/*.less'), (event, path) => {
  console.log(`(event:${event}): ${path} is changed, recompiling less files`);
  // run less recompiling if less file was changed.
  clearTimeout(recompileLessTimer);
  recompileLessTimer = setTimeout(lessRecompile, 1000);
});

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get(`/${mainCssFile}`, (req, res) => {
  res.sendFile(pathToCss, function(err) {
    if (err) {
      console.log(err);
      res.status(err.status).send(`'${pathToCss}' is not found`).end();
    }
  });
});

app.use('/', express.static(temporaryResourcesDirectory));
app.use('/demo', express.static(path.join(__dirname, '../client/demo')));

const port = 3000;
const host = 'localhost';
app.listen(port, host, (err) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(`Listening at http://${host}:${port}`);
});

const exitHandler = (options = { exit: false }) => {
  return (code) => {
    console.log(`about to exit with code '${code}'`);
    console.log(`... deleting temporary working directory '${tmpDir}'`);
    rimraf.sync(tmpDir);
    if (options.exit) {
      process.exit();
    }
  }
};

// the program will not close instantly
process.stdin.resume();
// do something when app is closing
process.on('exit', exitHandler());

// catches ctrl+c event
process.on('SIGINT', exitHandler({ exit: true }));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler({ exit: true }));

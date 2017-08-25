const chokidar = require('chokidar');
const fsExtra = require('fs-extra');
const rimraf = require('rimraf');

const directoryWatcher = (directory, callback, watchInterval = 2000) => {
  chokidar.watch(directory, {
    usePolling: true,
    interval: watchInterval,
    binaryInterval: watchInterval,
    alwaysStat: true,
    awaitWriteFinish: true
  }).on('all', callback);
};

const direrctoryWatchHandler = function(event, path, tmpPath) {
  if (event === 'change' || event === 'add' || event === 'addDir') {
    // console.log(`copying '${path}' to '${tmpPath}'`);
    fsExtra.copy(path, tmpPath, function(error) {
      if (error) {
        console.error(error);
      }
    });
  }

  if (event === 'unlink' || event === 'unlinkDir') {
    // console.log(`removing '${tmpPath}'`);
    rimraf(tmpPath, { glob: false }, function(error) {
      if (error) {
        console.error(error);
      }
    });
  }

  // if (event === 'ready') {
  //   console.log(`directory watcher is ready for action`);
  // }

  if (event === 'error') {
    // path is error
    console.log('watcher has thrown an error', path);
  }
};

export {
  directoryWatcher,
  direrctoryWatchHandler
}

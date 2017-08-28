const chokidar = require('chokidar');

const directoryWatcher = (directory, callback, watchInterval = 2000) => {
  chokidar.watch(directory, {
    usePolling: true,
    interval: watchInterval,
    binaryInterval: watchInterval,
    alwaysStat: true,
    awaitWriteFinish: true
  }).on('all', callback);
};

export {
  directoryWatcher
}

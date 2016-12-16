const path = require('path');
const express = require('express');
const cors = require('cors');
const chokidar = require('chokidar');
const fs = require('fs-extra');
const config = require('./config.json');

const exec = require('child_process').exec;

const app = express();

let recompileLessTimer;
const watchInterval = 1000;

const pathToCustomization = config.pathToCustomization || '';
const mainCssFile = config.mainCssFile || 'main.css';
const mainLessFile = 'main.less';
const port = config.port || 3000;

const pathToCss = path.join(__dirname, 'tmp', mainCssFile);
const pathToLess = path.join(__dirname, 'tmp',  mainLessFile);
const stdDir = path.join(__dirname, 'resources');
const tmpCustomDir = path.join(__dirname, 'tmp', 'custom');
const tmpStdDir = path.join(__dirname, 'tmp', 'std');


let customDir = '';
if (pathToCustomization) {
  customDir = path.join(pathToCustomization);
}

try {
  // remove old tmd dir
  fs.removeSync(path.join(__dirname, 'tmp'));
}catch (err) {
  console.log(err);
};

try {
  // create main.less file
  fs.outputFileSync(pathToLess, '@import "std/less/main.less"; ' +
    '@import (optional) "custom/less/main.less"; ' +
    '@import (optional) "custom/less/custom.less";');
  console.log("The main.less was saved!");
} catch (err) {
    console.log(err);
};

app.use(cors());


const lessRecompile = function() {
  console.log('Start less recompiling...');

  let cmd = 'lessc --relative-urls src/www/tmp/' + mainLessFile + ' src/www/tmp/' + mainCssFile;

  let lesscExec = exec(cmd);

  lesscExec.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  lesscExec.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  lesscExec.on('close', (code) => {
    console.log('Finish less recompiling -> ' + pathToCss);
  });

  /* less.render(contents,
   {
   paths: [path.join('src', 'www', 'resources', 'less')],
   /!*compress: true,*!/
   filename: 'jcatalog-bootstrap-bundle.less',
   relativeUrls: true,
   rootpath: '../../../'

   })
   .then(function (output) {
   //console.log(output.css);
   // output.css = string of css
   // output.map = string of sourcemap
   // output.imports = array of string filenames of the imports referenced
   fs.writeFileSync(path.join(cssDir, 'main.css'), output.css);
   console.log('Finish less recompiling -> ', path.join(cssDir, 'main.css'));
   },
   function (error) {
   console.log(error);
   });*/
};

const dirWatcher = function (event, path, tmpPath){
  if (event === 'change' || event === 'add') {
    fs.copy(path, tmpPath, function(err) {
      if (err) {
        console.log(1);
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

// Watcher for custom directory, ignores .dotfiles
const stdDirWatcher = chokidar.watch(stdDir, // eslint-disable-line no-unused-vars
    {
      ignored: /[\/\\]\./,
      usePolling: true,
      interval: watchInterval,
      binaryInterval: watchInterval,
      alwaysStat: true,
      awaitWriteFinish: true
    }).on('all', (event, path) => {
    // console.log(event, path);

    let tmpPath = path.replace(stdDir, tmpStdDir);
    dirWatcher(event, path, tmpPath);
});

// Watcher for standard less files. Run less recompiling.
const tmpStdDirWatcher = chokidar.watch(tmpStdDir, // eslint-disable-line no-unused-vars
  {
    ignored: /[\/\\]\./,
    usePolling: true,
    interval: watchInterval,
    binaryInterval: watchInterval,
    awaitWriteFinish: true
  }).on('all', function(event, path) {
    // console.log(path);
    if (path.match(/\.less$/)) {
      // run less recompiling if less file was changed.
      clearTimeout(recompileLessTimer);
      recompileLessTimer = setTimeout(lessRecompile, 1000);
    }
  });


if (customDir) {
  console.log('Path to customization: ', customDir);

  // Watcher for custom directory, ignores .dotfiles
  const customDirWatcher = chokidar.watch(customDir, // eslint-disable-line no-unused-vars
    {
      ignored: /[\/\\]\./,
      usePolling: true,
      interval: watchInterval,
      binaryInterval: watchInterval,
      alwaysStat: true,
      awaitWriteFinish: true
    }).on('all', (event, path) => {
      // console.log(event, path);
      let tmpPath = path.replace(customDir, tmpCustomDir);
      dirWatcher(event, path, tmpPath);
    });

// Watcher for tmp directory with customization. Run less recompiling.
  const tmpCustomDirWatcher = chokidar.watch(tmpCustomDir, // eslint-disable-line no-unused-vars
    {
      ignored: /[\/\\]\./,
      usePolling: true,
      interval: watchInterval,
      binaryInterval: watchInterval,
      awaitWriteFinish: true
    }).on('all', function(event, path) {
      // console.log(path);
      if (path.match(/\.less$/)) {
        // run less recompiling if less file was changed.
        clearTimeout(recompileLessTimer);
        recompileLessTimer = setTimeout(lessRecompile, 1000);
      }
    });
}


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/*.css', (req, res) => {
  let cssFile = req.originalUrl;
  let pathToCssFile;

  if (cssFile.indexOf('tmp') > 0) {
    pathToCssFile = path.join(__dirname, cssFile);
  } else { // for short url
    pathToCssFile = path.join(__dirname, 'tmp', cssFile);
  }

  res.sendFile(pathToCssFile, function(err) {
    if (err) {
      console.log(err);
      res.status(err.status).send(cssFile.substring(1) + ' has not found :(').end();
    }
  }
  );
});

app.use(express.static(__dirname));

app.listen(port, 'localhost', (err) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:' + port);
});

Node app that serves resources
------------------

Provides less, css, fonts, images.

Project structure
-----------------

build - destination folder for compiled/packaged files

```
build             -- destination build folder
src
  /www   	      -- server side sources
src
  /www/config.json-- config of app
package.json      -- project dependencies file
.eslintrc         -- lint options
.eslintignore     -- ignore files for lint tool
.esdoc.json       -- esdoc options
```

Development
-----------------

Workflow/goals:
```
*npm i*             -- install dependencies
*npm start          -- starts demo application
*npm run run-server -- run server
*npm run build-less -- run less-recompiler
*npm run watch-less -- run watcher for less changes
```

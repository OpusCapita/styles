## Node app that serves resources

Provides less, css, fonts, images.

### Development

#### Getting started
Download and install Node.js from the [Node.js download page] (https://nodejs.org/en/download/)
Read the [Getting started page](https://docs.npmjs.com/getting-started/installing-node) for information about installing Node.js more.

#### Goals

Install dependencies
```
npm i
```

Start server
```
npm start
```

Srver will be available by the following url [http://localhost:3042/] (http://localhost:3042/). It is automatically reloaded  when you make changes in sources.

If you want to change port run the following command(s) in console
- on Windows
```
set PORT=1234
npm start 
```
- on Linux
```
PORT=1234 npm start
```

### Source code info

#### Folder structure
 
 ```
 src/
  client/
    demo/
      resources/
      fonts/
      img/
      less/
      index.html
  server/
    index.js
 config.json.sample
 ```
 
 * `src/server/index.js` - Main server file that provide resources and demo pages, handle changes in `src/server/resources` and customization area, recompile less to css.
 * `src/client/index.html` - Start page of the application [http://localhost:3042/] (http://localhost:3042/)
 * `src/client/demo/` - Contain demo pages with examples and some additional resources for displaying it.
 * `src/client/resources/` - Contain fonts, images and standard less files with current UI styles.
 * `config.json.sample` - Sample of config to set path to customization area
 
 
#### What is the less
Less is a CSS pre-processor, meaning that it extends the CSS language, adding features that allow variables, mixins, functions and many other techniques that allow you to make CSS that is more maintainable, themeable and extendable.
Read more information about less on [the official documentation] (http://lesscss.org/features/#features-overview-feature). 

#### About less structure inside less folder
 
```
less/
  core/   
  jcatalog-bootstrap-extentions/
  jcatalog-ui/
  jqgrid/
  jquery-ui/
  opc/
  main.less
  variables.less
  mixins.less
```
where:
* `core` - Copy of less files form [http://getbootstrap.com/] (http://getbootstrap.com/) as it is.
* `jcatalog-bootstrap-extentions` - Additional UI components or extensions which we are using in our apps (datepecker, fileupload, font-awesome, etc.).
* `jcatalog-ui` - Overwrite (modify) some standard bootstrap components and states (for example use another fonts, hover states)
* `jqgrid` - jqgrid on bootstrap.
* `jquery-ui` - jQuery-ui on bootstrap.
* `opc` - Specific styles for OPC only 
* `main.less` - The main less file that import another
* `variables.less` - The main file with variables that are used inside other less files.  
* `mixins.less` - The main file with mixins that are used inside other less files.  

### How to customize

 For customization please do following steps:
 * Rename file `config.json.sample` to `config.json` in root app directory;
 * Set path to customization area as value for `pathToCustomization` key in `config.json`;
 * Customization area must contain `less` directory and `main.less` file in it;
 * Other resources should be imported in `main.less` file.


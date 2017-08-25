## Node app that serves resources

Provides less, css, fonts, images.

## Demo
Online demo available here: https://opuscapita.github.io/opuscapita-ui

### Development

#### Getting started
Download and install Node.js from the [Node.js download page](https://nodejs.org/en/download/)
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

Server will be available by the following url http://localhost:3042/. It is automatically reloaded when you make changes in sources.
Compiled styles can be found in [index.css](http://localhost:3042/index.css)

If you want to change port run the following command(s) in console
- on Windows
```
set PORT=1234
npm start
```
- on Linux
```
export PORT=1234
npm start
```

Lint sources
```bash
npm run lint
```

or run lint with fixing possible problems
```
npm run lint -- --fix
```

### Using as npm package
The easiest way to use compiled css+images+fonts+guide(html) is to install it from NPM and include it in your own React build process.

#### Add the dependency to your node application or module

```bash
# using yarn
yarn add @opuscapita/opuscapita-ui

# or with npm
npm install @opuscapita/opuscapita-ui --save
```

Let's say you have _index.html_ as entry point of your application then you add link to css file like this:
```html
<link rel="stylesheet" type="text/css" href="opuscapita-ui/index.css">
```

Then on server side, depending on mode that you use e.g. production (application) or demo start (app or module development mode) you can use OpusCapita UI differently (we use _express_ server as an example):
```javascript
if (<development/demo mode>) {
  // demo or development mode where locally installed library '@opuscapita/opuscapita-ui' files are used
  // '@opuscapita/opuscapita-ui' library holds all required the files in 'dist' folder
  app.use('/opuscapita-ui', express.static('node_modules/@opuscapita/opuscapita-ui/dist'));
} else {
  // production mode, here we redirect to externally started oc-ui service and its css exposed via http
  app.get('/opuscapita-ui/index.css', function(req, res) {
    res.redirect('http://[opuscapita-ui server url]/index.css');
  });
}
```

*Note:* In this case your you map local module resources (~= development mode) you will be able to access style guide also by url _http://[your app host and port]/opuscapita-ui/index.html_

### Using as grails plugin
add dependency in BuildConfig.groovy
```
runtime('com.jcatalog.grailsplugins:opuscapita-ui:1.0.2-beta.1')
```
add dependency for existing resources
```
dependsOn ('opuscapita-ui')
```
or include module in *.gsp files
```
<r:require modules="opuscapita-ui"/>
```

### Source code info

#### Applucation folder/file structure

 ```
 ├── configuration.json.sample          application configuration file sample
 └── src
     ├── client
     │   ├── demo                       static resources important only for rendering documentation (usage guide for developers)
     │   │   ├── css                     
     │   │   ├── favicon.ico
     │   │   ├── html
     │   │   └── js
     │   ├── index.html                 index page, with links to documentation (for developers)
     │   └── resources                  static resources that are used in productions (forts and images,
     │       │                          all less files are compiled into single css that is available via /index.css)
     │       ├── fonts
     │       ├── img
     │       └── less
     └── server
         └── index.js                   is used run web server (service)
 ```

#### What is the less
Less is a CSS pre-processor, meaning that it extends the CSS language, adding features that allow variables, mixins, functions and many other techniques that allow you to make CSS that is more maintainable, themeable and extendable.
Read more information about less on [the official documentation](http://lesscss.org/features/#features-overview-feature).

#### About less structure inside less folder

```
├── bootstrap
├── extensions
├── external
├── opuscapita-theme
├── index.less
├── mixins.less
└── variables.less
```
where:
* `bootstrap` - Copy of less files form [http://getbootstrap.com/](http://getbootstrap.com/) as it is.
* `extensions` - Additional UI components or extensions which we are using in our apps (datepecker, fileupload, font-awesome, etc.).
* `opuscapita-theme` - Overwrite (modify) some standard Bootstrap components and states (for example use another fonts, hover states)
* `external` - style modifications for external components
* `index.less` - The main less file that import another
* `variables.less` - The main file with variables that are used inside other less files.  
* `mixins.less` - The main file with mixins that are used inside other less files.  

### How to customize

 For customization please do following steps:
 * Rename file `configuration.json.sample` to `configuration.json` in root app directory;
 * Set path to customization area as value for `customizationAreaPath` key in `configuration.json`;
 * Customization area must contain `less` directory and `index.less` file in it;
 * Other resources should be imported in `index.less` file.

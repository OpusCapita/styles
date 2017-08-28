## OpusCapita UI

[![CircleCI Status](https://circleci.com/gh/OpusCapita/opuscapita-ui/tree/master.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/OpusCapita/opuscapita-ui)
![badge-npm-version](https://img.shields.io/npm/v/@opuscapita/opuscapita-ui.svg) 
![badge-license](https://img.shields.io/github/license/OpusCapita/opuscapita-ui.svg)
![NPM Downloads](https://img.shields.io/npm/dm/@opuscapita/opuscapita-ui.svg)

Idea behind this application creation is to have one service which:
- provides common look and feel for OpusCapita applications
- gives a consistent way of continuous development of this application (extending styles, adding new UIs)
- be able to set up different styles (customization) for specific installation

Technically speaking application works as CDN that serves static (non JS) resources like css, fonts, images.

Static application version is available online [here](https://opuscapita.github.io/opuscapita-ui)

### Development

#### Getting started
Download and install Node.js from the [Node.js download page](https://nodejs.org/en/download/)
Read the [Getting started page](https://docs.npmjs.com/getting-started/installing-node) for information about installing Node.js more.

#### Development HowTo

Install dependencies
```
npm i
```
or using **yarn**
```
yarn
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
npm star lint
```

or run lint with fixing possible problems
```
npm start lint.fix
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

Let's say you have ```index.html``` as entry point of your application then you add link to css file like this:
```html
<link rel="stylesheet" type="text/css" href="opuscapita-ui/index.css">
```

Then on server side, depending on mode that you use e.g. production (application) or demo start (app or module development mode) you can use OpusCapita UI differently (we use **express** server as an example):
```javascript
if (<development/demo mode>) {
  // demo or development mode where locally installed library '@opuscapita/opuscapita-ui' files are used
  // '@opuscapita/opuscapita-ui' library holds all required the files in 'dist' folder
  app.use('/opuscapita-ui', express.static(path.join(__dirname, '<relative path to node_modules>/@opuscapita/opuscapita-ui/dist/npm')));
} else {
  // production mode, here we redirect to externally started oc-ui service and its css exposed via http
  app.get('/opuscapita-ui/index.css', function(req, res) {
    res.redirect('http://<opuscapita-ui server url>/index.css');
  });
}
```

*Note:* In this case your you map local module resources (~= development mode) you will be able to access style guide also by url ```http://[your app host and port]/opuscapita-ui/index.html```

### Using as grails plugin
add dependency in BuildConfig.groovy
```
runtime('com.opuscapita.grailsplugins:opuscapita-ui:1.0.3-beta.1')
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

#### Application folder/file structure

 ```
 ├── configuration.json.sample          application configuration file sample
 └── src
     ├── client
     │   ├── demo                       static resources important only for rendering documentation (usage guide for developers)
     │   │   ├── css                     
     │   │   ├── favicon.ico
     │   │   ├── html
     │   │   └── js
     │   ├── fonts                      fonts
     │   ├── img                        images
     │   ├── less                       less files (are compiled into single css that is available via /index.css)
     │   └── index.html                 index page, with links to documentation (for developers)
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

 Configure customization area location (local FS directory):
 * Create `configuration.json` in root app directory, use file `configuration.json.sample` as an example
 * Set path to customization area as value for `customizationAreaPath` key in `configuration.json`

 If you would like to customize CSS you need to create ```less/index.less``` file at least and start add/override styles there. Additional less files should be imported via `index.less`.
 If you need to override standard file like image or font, you need place them in customization area folder by the same path as it is placed inside the sources folder ```src/client```. For example, you need to replace logo file (sources location ```src/client/img/opuscapita-logo.svg```), then you could place own logo file in customization area folder by path ```img/opuscapita-logo.svg```

Node app that serves resources
------------------

Provides less, css, fonts, images.

Development
-----------------

Workflow/goals:
```
*npm i*             -- install dependencies
*npm start          -- starts server


How to customize
-----------------

For customization please do following steps:

- Rename file config.json.sample to config.json in root app directory;
- Set path to customization area as value for pathToCustomization key in config.json;
- Customization area must contain less directory and main.less file in it;
- Other resources should be imported in main.less file.


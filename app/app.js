﻿/*
In NativeScript, the app.js file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/
const application = require("tns-core-modules/application");
const appSettings = require("application-settings");
//appSettings.clear();

// set server location
global.serverUrl = "https://cricket.kinross.co/";
global.refreshTime = 300000;    // half of ten minutes

application.run({ moduleName: "app-root" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/

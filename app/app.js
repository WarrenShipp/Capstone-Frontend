/*
In NativeScript, the app.js file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/
const application = require("tns-core-modules/application");
const appSettings = require("application-settings");
//appSettings.clear();

// set server location
global.serverUrl = "https://cricket.kinross.co/";
global.endpointUser = "user/";
global.endpointClub = "club/";
global.endpointCoach = "coach/";
global.endpointJoin = "join/";
global.endpointUser = "user/";
global.endpointPlayer = "player/";
global.endpointShot = "shot/";
global.endpointVideo = "video/";
global.endpointToken = "api/token/";

// other params
global.refreshTime = 300000;    // half of ten minutes
global.tokenRefresh = "tokenRefresh";
global.tokenAccess = "tokenAccess";
global.lastRefresh = "lastRefresh";

application.run({ moduleName: "app-root" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/

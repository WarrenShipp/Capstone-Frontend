/*
In NativeScript, the app.js file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/
const application = require("tns-core-modules/application");
const appSettings = require("application-settings");
const frame = require('ui/frame');
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

// set up back override
if (application.android) {
    application.android.on(
        application.AndroidApplication.activityBackPressedEvent,
        function (args) {
            var currentPage = frame.topmost().currentPage;
            if (currentPage && currentPage.exports && typeof currentPage.exports.backEvent === "function") {
                currentPage.exports.backEvent(args);
                // user must call `args.cancel = true;` to prevent going back.
            }
            // if no backEvent, then it uses normal functionality
        }
    );
}

application.run({ moduleName: "app-root" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/

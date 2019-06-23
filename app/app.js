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

// some user information that gets saved to reduce workload.
global.userIsCoach = "isCoach";
global.userIsPlayer = "isPlayer";
global.userCoachId = "coachId";
global.userPlayerId = "playerId";

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
// This may be a solution to the crashes when app resumes
// var navigationOptions = {
//     moduleName: 'home-page',
//     clearHistory: true,
// };
// application.on(application.resumeEvent, (context) => {
//     setTimeout(() => topmost().navigate(navigationOptions), 0);
// });

application.run({ moduleName: "app-root" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/

/*
 * CREDITS:
 * - Cricket Icon (https://www.flaticon.com/free-icon/cricket_1801165) made by https://www.flaticon.com/authors/dinosoftlabs from https://www.flaticon.com
 * - Recording Icon (https://www.flaticon.com/free-icon/recording_1801491) made by https://www.flaticon.com/authors/dinosoftlabs from https://www.flaticon.com
 * - Magnifying Glass Icon (https://www.flaticon.com/free-icon/magnifying-glass_1801236) made by https://www.flaticon.com/authors/dinosoftlabs from https://www.flaticon.com
 * - Profiles Icon (https://www.flaticon.com/free-icon/profiles_568050) made by https://www.flaticon.com/authors/dinosoftlabs from https://www.flaticon.com
 * - Folder Icon (https://www.flaticon.com/free-icon/folder_1804384) made by https://www.flaticon.com/authors/dinosoftlabs from https://www.flaticon.com
 * - Search Icon (https://www.flaticon.com/free-icon/edit_1159633) made by https://www.flaticon.com/authors/kiranshastry from https://www.flaticon.com
 * - Essential Set Icons (https://www.flaticon.com/packs/essential-set-2) made by https://www.flaticon.com/authors/smashicons from https://www.flaticon.com
 */

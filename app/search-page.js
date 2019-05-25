// Requirements
var frameModule = require("ui/frame");
var observable = require("data/observable");
var appSettings = require("application-settings");
var app = require("tns-core-modules/application");
var dropdown = require("nativescript-drop-down");

// Variables
var viewModel;
var searchSubmitType;
var dateStart="";
var dateEnd="";
var date_before = "";
var date_after = "";
var shot="";
var rating="";
var user;
var playerId = "";

const shotTypeListArray = [
    { display: "Straight Drive" },
    { display: "Cover Drive" },
    { display: "Square Cut" },
    { display: "Late Cut" },
    { display: "Leg Glance" },
    { display: "Hook" },
    { display: "Pull" },
    { display: "Drive through square leg" },
    { display: "On drive" },
    { display: "Off Drive" }
];
const ratingTypeListArray = [
    { display: "Perfect" },
    { display: "Good" },
    { display: "Off Balanced" },
    { display: "Off Position" },
    { display: "Played Late" },
    { display: "Played Early" }
];
const userTypeListArray = [
    { display: "Admin" },
    { display: "Coach" },
    { display: "Player" }
];
const searchType = [
    "Club",
    "Shot",
    "User"
];

// modal
const modalViewModule = "modal-select-player";

/**
 * Setting up form and dropdowns
 */
function onLoaded(args) {
    date_before = "";
    date_after = "";
    shot="";
    rating="";
    user;
    playerId = "";

    console.log("search page opened");
    var page = args.object;
    viewModel = new observable.Observable();

    // Adding arrays to dropdown
    shotType = new dropdown.ValueList(shotTypeListArray);
    ratingType = new dropdown.ValueList(ratingTypeListArray);
    userType = new dropdown.ValueList(userTypeListArray);

    // Initialise textfields club form
    viewModel.set("clubName", "");
    viewModel.set("leagueName", "");

    // Initialise textfields shot form
    viewModel.set("shotClub", "");
    viewModel.set("shotCoach", "");
    viewModel.set("shotPlayer", "");

    // Initialise textfields user form
    viewModel.set("userName", "");
    viewModel.set("userClub", "");

    // Hide All Forms and Elements Before Selection of Search Type
    viewModel.set("showClub", false);
    viewModel.set("showShot", false);
    viewModel.set("showUser", false);
    viewModel.set("showdateStart", false);
    viewModel.set("showdateEnd", false);
    viewModel.set("dateStart", "");
    viewModel.set("dateEnd", "");
    viewModel.set("showSubmit", false);

    // Initialise dropdown menus with array values
    viewModel.set("shotType", shotType);
    viewModel.set("ratingType", ratingType);
    viewModel.set("userType", userType);
    viewModel.set("searchTypes", searchType);

    // Blank default search type
    viewModel.set("typeIndex", null);

    // cacheShots();

    //set viewmodel
    page.bindingContext = viewModel;

};
exports.onLoaded = onLoaded;

/**
 * 
 * @param {any} args
 */
 function openPlayerModal(args) {
    console.log("Open");
    const button = args.object;
    const fullscreen = false;
    const context = { type: "players" };
    var callback = function (vals) {
        console.log(vals);
        if (!vals) {
            // do nothing
            return;
        }
        playerId = vals.id;
        firstname = vals.user;
        viewModel.set("playername", firstname);
    }
    button.showModal(modalViewModule, context, callback, fullscreen);
}
exports.openPlayerModal = openPlayerModal;

/**
 * Send search information entered to results page for data request depending on search Type
 */
exports.sendSearch = function () {
    var sendToken = appSettings.getString("token");
    console.log(sendToken);
    // Club Search
    if (searchSubmitType == 0) {
        var clubSearchName = viewModel.get("clubName");
        // var clubSearchLeague = viewModel.get("leagueName"); // not implemented yet
        var urlSearch = global.serverUrl + "club/?" + "name=" + clubSearchName;
    }
    // Shot Search
    else if (searchSubmitType == 1) {
        console.log("shot search");
        var clubName = viewModel.get("shotClub");
        var coachName = viewModel.get("shotCoach");
        //var playerName = viewModel.get("shotPlayer");
        date_before = viewModel.get("dateEnd");
        date_after = viewModel.get("dateStart");
        var urlSearch = global.serverUrl + "shot/?" + "club_name=" + clubName + "&coach_name=" + coachName + "&player=" + playerId +
        "&date_before=" + date_before + "&date_after=" + date_after + "&rating=" + rating + "&type=" + shot;
    }
    // User Search
    else if (searchSubmitType == 2) {
        var userName = viewModel.get("userName");
        var userClub = viewModel.get("userClub"); // filtering by club name broken on backend
        var urlSearch = global.serverUrl + "user/?" + "name=" + userName;
    }
    // Passing through the search type and search url to use to the results page
    var navigationOptions = {
        moduleName: 'results-page',
        context: {
            urlSearch: urlSearch,
            searchType: searchSubmitType,
            searchTime: (new Date()).getTime()
        }
    }
    console.log("url is:" + urlSearch);
    frameModule.topmost().navigate(navigationOptions);

}

/**
 * Side drawer functionality on tap
 */
function onDrawerButtonTap(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}
exports.onDrawerButtonTap = onDrawerButtonTap;

/**
 * Get index of shot type to search for
 */
function shotDropChange(args) {
    shot = viewModel.get("shotType").getDisplay(args.newIndex);
    console.log(shot);
}
exports.shotDropChange = shotDropChange;

/**
 * Get index of rating type to search for
 */
function shotRatingChange(args) {
    rating = viewModel.get("ratingType").getDisplay(args.newIndex);
    console.log(rating);
}
exports.shotRatingChange = shotRatingChange;

/**
 * Get index of user type to search for
 */
function userChange(args) {
    user = viewModel.get("userType").getDisplay(args.newIndex);
    console.log(user);
}
exports.userChange = userChange;

/**
 * Show Start Date Calendar for user selection
 */
function showDateStart(args) {
    viewModel.set("showdateStart", true);
}
exports.showDateStart = showDateStart;

/**
 * Show End Date Calendar for user selection
 */
function showDateEnd(args) {
    viewModel.set("showdateEnd", true);
}
exports.showDateEnd = showDateEnd;

/**
 * Get start date selected and close calendar
 */
function onStartSelected(args) {
    console.log("start date: " + args.date);
    viewModel.set("showdateStart", false);
    var offset = args.date.getTimezoneOffset(); 
    console.log(offset);
    yourDate = new Date(args.date.getTime() - (offset*60*1000)); 
    console.log(args.date.getTime());
    console.log(yourDate);
    console.log(yourDate.toISOString());
    yourDate = yourDate.toISOString().split('T')[0];
    viewModel.set("dateStart", yourDate);

}
exports.onStartSelected = onStartSelected;

/**
 * Get end date selected and close calendar
 */
function onEndSelected(args) {
    console.log("end date: " + args.date);
    viewModel.set("showdateEnd", false);
    var offset = args.date.getTimezoneOffset(); 
    console.log(offset);
    yourDate = new Date(args.date.getTime() - (offset*60*1000)); 
    console.log(args.date.getTime());
    console.log(yourDate);
    console.log(yourDate.toISOString());
    yourDate = yourDate.toISOString().split('T')[0];
    viewModel.set("dateEnd", yourDate);
}
exports.onEndSelected = onEndSelected;

/**
 * Change form depending on type of search chosen: Club, Shot or User search
 */
function dropDownSelectedIndexChanged(args) {
    console.log("dropDownSelectedIndexChanged");
    console.log(args.newIndex);
    viewModel.set("showSubmit", true);
    searchSubmitType = args.newIndex;
    if (searchSubmitType == 0) {
        console.log("club search");
        viewModel.set("showClub", true);
        viewModel.set("showShot", false);
        viewModel.set("showUser", false);
    }
    else if (searchSubmitType == 1) {
        console.log("shot search");
        viewModel.set("showShot", true);
        viewModel.set("showClub", false);
        viewModel.set("showUser", false);
    }
    else if (searchSubmitType == 2) {
        console.log("user search");
        viewModel.set("showUser", true);
        viewModel.set("showClub", false);
        viewModel.set("showShot", false);
    }
};
exports.dropDownSelectedIndexChanged = dropDownSelectedIndexChanged;
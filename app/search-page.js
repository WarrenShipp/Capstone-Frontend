// Requirements
var frameModule = require("ui/frame");
var observable = require("data/observable");
var appSettings = require("application-settings");
var app = require("tns-core-modules/application");
var dropdown = require("nativescript-drop-down");
var viewModel = new observable.Observable();
const ShotTypes = require("../app/helpers/type-list").ShotTypes;
const RatingTypes = require("../app/helpers/type-list").RatingTypes;

// modal
const modalPlayerSelectModule = "modal-select-player";
const modalCalendarModule = "modal-calendar";

// search types
const SEARCH_CLUB = 0;
const SEARCH_SHOT = 1;
const SEARCH_USER = 2;

// ### form vars

// basic
var searchType;
var searchTypeList;
var showShot;
var showClub;
var showUser;
var showSubmit;

// club
var clubName;

// shot
var playerId;
var playerName;
var shotTypeList;
var shotTypeIndex;
var ratingTypeList;
var ratingTypeIndex;
var shotCoach;          // not impl
var shotClub;           // not impl
var dateStart;
var dateStartName;
var dateEnd;
var dateEndName;

// user
var userName;
var userClub;
var userTypeList;
var userTypeIndex;

// control
var isEnabled;

// ### end form vars

// lists for dropdowns
const shotTypeListDisplay = ShotTypes.makeDropdownList();
const ratingTypeListDisplay = RatingTypes.makeDropdownList();
const userTypeListDisplay = [
    { display: "Admin" },
    { display: "Coach" },
    { display: "Player" }
];
const searchTypeListDisplay = [
    { display: "Club" },
    { display: "Shot" },
    { display: "User" }
];

/**
 * Setting up form and dropdowns
 */
function onNavigatingTo(args) {
    page = args.object;

    //set viewmodel
    page.bindingContext = viewModel;

    // if coming back, don't reset the page
    if (args.isBackNavigation) {
        return;
    }

    // get search type
    searchType = -1; // default
    if (args.context && args.context.searchType) {
        if (typeof args.context.searchType === 'string') {
            searchType = searchTypeListDisplay.findIndex(
                value => (value.display === args.context.searchType)
            );
        }
    }
    viewModel.set("searchType", searchType);

    // reset all page vars to initialise page
    _resetPage();

    // set page based upon searchType
    _setSearchType(searchType);

    // add relevant vars
    _setPage(args.navigationContext);
};
exports.onNavigatingTo = onNavigatingTo;

/**
 * Opens a modal for finding players.
 * @param {any} args
 */
 function openPlayerModal(args) {
    const button = args.object;
    const fullscreen = false;
    const context = { type: "players" };
    var callback = function (vals) {
        if (!vals) {
            // do nothing
            return;
        }
        playerId = vals.id;
        playerName = vals.user;
        viewModel.set("playerName", playerName);
    }
    button.showModal(modalPlayerSelectModule, context, callback, fullscreen);
}
exports.openPlayerModal = openPlayerModal;

/**
 * Send search information entered to results page for data request depending on search Type
 */
function sendSearch() {
    var urlSearch;

    // Club Search
    if (searchType == 0) {
        var clubSearchName = viewModel.get("clubName");
        urlSearch = global.serverUrl + global.endpointClub;

        // go through vars and append to search
        urlSearch = _appendVar("name", clubSearchName, urlSearch);
    }

    // Shot Search
    else if (searchType == 1) {
        var date_before = dateStart;
        var date_after = dateEnd;
        urlSearch = global.serverUrl + global.endpointShot;

        // go through vars and append to search
        urlSearch = _appendVar("player", playerId, urlSearch);
        urlSearch = _appendVar("rating", viewModel.get("ratingTypeIndex"), urlSearch, 1);
        urlSearch = _appendVar("type", viewModel.get("shotTypeIndex"), urlSearch, 1);
        urlSearch = _appendVar("date_after", dateStartName, urlSearch);
        urlSearch = _appendVar("date_before", dateEndName, urlSearch);
    }

    // User Search
    else if (searchType == 2) {
        var userName = viewModel.get("userName");
        var userClub = viewModel.get("userClub"); // filtering by club name broken on backend
        urlSearch = global.serverUrl + global.endpointUser;

        // go through vars and append to search
        urlSearch = _appendVar("name", userName, urlSearch);
    }

    // Passing through the search type and search url to use to the results page
    var navigationOptions = {
        moduleName: 'results-page',
        context: {
            urlSearch: urlSearch,
            searchType: searchType,
            searchTime: (new Date()).getTime()
        }
    }
    frameModule.topmost().navigate(navigationOptions);

}
exports.sendSearch = sendSearch;

/**
 * Appends a variable to the search url
 * @param {any} varName
 * @param {any} varVal
 * @param {any} appendTo
 * @param {any} minVal
 * @param {any} maxVal
 */
function _appendVar(varName, varVal, appendTo, minVal = null, maxVal = null) {

    var preAppend = appendTo.endsWith("/") ? "?" : "&";
    if (varVal) {
        // check within min bounds
        if (
            minVal &&
            typeof varVal === "number" &&
            typeof minVal === "number" &&
            varVal < minVal
        ) {
            return appendTo;
        }
        // check within max bounds
        if (
            maxVal &&
            typeof varVal === "number" &&
            typeof maxVal === "number" &&
            varVal > maxVal
        ) {
            return appendTo;
        }

        // add value
        appendTo = appendTo.concat(preAppend, varName, "=", varVal);
    }
    
    return appendTo;
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
 * Resets all vars on the page.
 */
function _resetPage() {

    // basics
    searchTypeList = new dropdown.ValueList(searchTypeListDisplay);
    searchTypeIndex = null;
    showCalendarStart = false;
    showCalendarEnd = false;
    viewModel.set("searchTypeList", searchTypeList);
    viewModel.set("searchTypeIndex", searchTypeIndex);
    viewModel.set("showCalendarStart", showCalendarStart);
    viewModel.set("showCalendarEnd", showCalendarEnd);

    // club
    clubName = null;
    viewModel.set("clubName", clubName);

    // shot
    playerId = null;
    playerName = null;
    shotTypeList = new dropdown.ValueList(shotTypeListDisplay);
    shotTypeIndex = null;
    ratingTypeList = new dropdown.ValueList(ratingTypeListDisplay);
    ratingTypeIndex = null;
    shotCoach = null;
    shotClub = null;
    dateStart = null;
    dateStartName = null;
    dateEnd = null;
    dateEndName = null;
    viewModel.set("playerName", playerName);
    viewModel.set("shotTypeList", shotTypeList);
    viewModel.set("shotTypeIndex", shotTypeIndex);
    viewModel.set("ratingTypeList", ratingTypeList);
    viewModel.set("ratingTypeIndex", ratingTypeIndex);
    viewModel.set("shotCoach", shotCoach);
    viewModel.set("shotClub", shotClub);
    viewModel.set("dateStartName", dateStart);
    viewModel.set("dateEndName", dateEnd);

    // user
    userName = null;
    userClub = null;
    userTypeList = new dropdown.ValueList(userTypeListDisplay);
    userTypeIndex = null;
    viewModel.set("userName", userName);
    viewModel.set("userClub", userClub);
    viewModel.set("userTypeList", userTypeList);
    viewModel.set("userTypeIndex", userTypeIndex);

}

/**
 * Updates the page whenever the search type is changed.
 * @param {any} args
 */
function searchTypeChanged(args) {
    _setSearchType(viewModel.get("searchTypeIndex"));
}
exports.searchTypeChanged = searchTypeChanged;

/**
 * Sets the search type to the given index.
 * @param {any} index
 */
function _setSearchType(index) {
    showClub = false;
    showShot = false;
    showUser = false;
    showSubmit = false;

    if (index == SEARCH_CLUB) {
        showClub = true;
        showSubmit = true;
    } else if (index == SEARCH_SHOT) {
        showShot = true;
        showSubmit = true;
    } else if (index == SEARCH_USER) {
        showUser = true;
        showSubmit = true;
    }
    
    viewModel.set("showClub", showClub);
    viewModel.set("showShot", showShot);
    viewModel.set("showUser", showUser);
    viewModel.set("showSubmit", showSubmit);
    searchType = index;
}

/**
 * Shows the start calendar.
 * @param {any} args
 */
function showDateStart(args) {
    const button = args.object;
    const fullscreen = false;

    // determine date params
    const context = {
        type: "start",
        typeName: "Start"
    };
    if (dateStart) {
        context.currentDate = dateStart;
    }
    if (dateEnd) {
        context.maxDate = dateEnd;
    }

    var callback = function (vals) {
        console.log(vals);
        if (!vals) {
            // do nothing
            return;
        }
        dateStart = vals.date;
        if (dateStart) {
            dateStartName = dateStart.toISOString().split('T')[0];
        } else {
            dateStartName = null;
        }
        viewModel.set("dateStartName", dateStartName);
    }
    button.showModal(modalCalendarModule, context, callback, fullscreen);
}
exports.showDateStart = showDateStart;

/**
 * Shows the end calendar.
 * @param {any} args
 */
function showDateEnd(args) {
    const button = args.object;
    const fullscreen = false;

    // determine date params
    const context = {
        type: "end",
        typeName: "End"
    };
    if (dateEnd) {
        context.currentDate = dateEnd;
    }
    if (dateStart) {
        context.minDate = dateStart;
    }

    var callback = function (vals) {
        if (!vals) {
            // do nothing
            return;
        }
        dateEnd = vals.date;
        if (dateEnd) {
            dateEndName = dateEnd.toISOString().split('T')[0];
        } else {
            dateEndName = null;
        }
        viewModel.set("dateEndName", dateEndName);
    }
    button.showModal(modalCalendarModule, context, callback, fullscreen);
}
exports.showDateEnd = showDateEnd;

/**
 * Sets the initial page values based upon the varibales given in the context.
 * @param {any} context
 */
function _setPage(context) {
    // TODO
}
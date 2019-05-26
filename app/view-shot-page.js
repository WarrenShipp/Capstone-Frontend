var observable = require("data/observable");
var viewModel = new observable.Observable();
const fileSystemModule = require("tns-core-modules/file-system");
var appSet = require("application-settings");
var frameModule = require("ui/frame");
var Sqlite = require("nativescript-sqlite");
var application = require("application");
var view = require("ui/core/view");
var VideoPlayer = require("nativescript-videoplayer");
var Slider = require("ui/slider");
const dialogs = require("tns-core-modules/ui/dialogs");
var LocalSave = require("../app/localsave/localsave.js");
var db = new LocalSave();
const appSettings = require("application-settings");
var http = require("http");
const ShotTypes = require("../app/helpers/type-list").ShotTypes;
const RatingTypes = require("../app/helpers/type-list").RatingTypes;
const HTTPRequestWrapper = require("../app/http/http-request.js");

// Edit Types
const EDIT_RECORD = "record_shot";
const EDIT_VIEW_LOCAL = "edit_local";
const EDIT_VIEW_SEARCH = "edit_online";

// View Types
const VIEW_LOCAL = "view_local";
const VIEW_ONLINE = "view_online";
var canEdit = false;

// nav vars
var sourcePage;
var type;
var editType;
var fromNav;

// page vars
var shotId;
var firstname;
var coachname;
var clubname;
var path;
var duration;
var date;
var time;
var dateTimeObj;
var shotTypeName;
var ratingTypeName;
var pageName;

// ui vars
var isLoading;
var noReset;
var videoLoading;
var hasVideo;

// helpers
var player;     // the big video player.

/**
 * Handles Hamburger Menu
 * @param {any} args
 */
function onDrawerButtonTap(args) {
    const sideDrawer = application.getRootView();
    sideDrawer.showDrawer();
}
exports.onDrawerButtonTap = onDrawerButtonTap;

/**
 * Set up basic Shot Editing parameters. This mostly deals with redirects and is
 * used to tell the page how to function / look / handle the given Shot data.
 * @param {any} args
 */
function onNavigatingTo(args) {
    page = args.object;

    /**
     * The page that, when we cancel, this edit page will go back to.
     */
    sourcePage = page.navigationContext.sourcePage ? page.navigationContext.sourcePage : "home-page";
    /**
     * The type of editing that will be performed. Either local, record (new) or from search.
     */
    type = page.navigationContext.type;
    /**
     * The extra parameters. We place them here rather than directly in the
     * navigationContext to keep things neat.
     */
    if (shotId && shotId == page.navigationContext.id) {
        noReset = true;
    }
    shotId = page.navigationContext.id;

    console.log("sourcePage: " + sourcePage);
    console.log("type: " + type);
    console.log("shotId: " + shotId);

    // set edit button params
    switch (type) {
        case VIEW_LOCAL:
        default:
            canEdit = true;
            editType = EDIT_VIEW_LOCAL;
            break;
        case VIEW_ONLINE:
            canEdit = false;
            editType = EDIT_VIEW_SEARCH;
            break;
    }

    // confirm that we came from nav, and that the app hasn't been resumed
    fromNav = true;

}
exports.onNavigatingTo = onNavigatingTo;

/**
 * Handles the bulk of the loading. Data passed to the editing page will be
 * added to the form. Otherwise, if this Shot is newly created, the form will
 * be set to default values.
 * @param {any} args
 */
function onLoad(args) {
    page = args.object;

    // set page name
    if (type == VIEW_LOCAL) {
        pageName = "View Local Shot";
    } else {
        pageName = "View Shot";
    }
    viewModel.set("pageName", pageName);

    // set duration
    player = page.getViewById("nativeVideoPlayer");
    player.on(VideoPlayer.Video.playbackReadyEvent, vals => {
        console.log("Ready to play video");
        duration = player.getDuration();
        // need to "kickstart" player, otherwise video won't show.
        if (duration == 0) {
            player.play();
            player.pause();
            player.seekToTime(0);
            duration = player.getDuration();
        }
        let durSeconds = duration / 1000;
        viewModel.set("duration", durSeconds.toString());
        console.log("duration: " + duration);
        hasVideo = true;
        viewModel.set("hasVideo", hasVideo);
        videoLoading = false;
        viewModel.set("videoLoading", videoLoading);
    });

    // set edit button params
    viewModel.set("canEdit", canEdit);

    // set params
    isLoading = true;
    viewModel.set("isLoading", isLoading);
    videoLoading = true;
    viewModel.set("videoLoading", videoLoading);
    hasVideo = false;
    viewModel.set("hasVideo", hasVideo);

    // set viewmodel
    page.bindingContext = viewModel;

    // load data
    _getShot();

}
exports.onLoad = onLoad;

/**
 * Goes back.
 * @param {any} args
 */
function cancel(args) {
    frameModule.topmost().goBack();
}
exports.cancel = cancel;

/**
 * Goes through to edit page.
 * TODO add security to ensure you can only do this for pages you can edit.
 * @param {any} args
 */
function edit(args) {
    // go to shot record page.
    let editTypeOptions = {
        id: shotId
    };
    var navigationOptions = {
        moduleName: 'edit-shot-page',
        context: {
            sourcePage: sourcePage,
            editType: editType,
            editTypeOptions: editTypeOptions
        },
        backstackVisible: true
    };
    frameModule.topmost().navigate(navigationOptions);
}
exports.edit = edit;

/**
 * Gets shot info and displays it.
 */
function _getShot() {
    if (!type) {
        return _throwNoContextError();
    }
    else if (noReset || !fromNav) {
        // don't get any data; it's already there!
        noReset = false;
        isLoading = false;
        viewModel.set("isLoading", isLoading);
    }
    else if (type == VIEW_LOCAL) {
        _setShotLocal();
    }
    else if (type == VIEW_ONLINE) {
        _setShotSearch();
    }

    // remove nav check to prevent loading icon error
    fromNav = false;
}

/**
 * Sets shot using local data.
 */
function _setShotLocal() {
    console.log("local");
    // shot id
    if (!shotId) {
        isLoading = false;
        viewModel.set("isLoading", isLoading);
        videoLoading = false;
        viewModel.set("videoLoading", videoLoading);
        console.error("No shot ID has been set. Cannot load local shot.");
        dialogs.alert({
            title: "Error getting Shot",
            message: "The Shot doesn't have an ID. It can't be loaded.",
            okButtonText: "Okay"
        }).then(function () {
            frameModule.topmost().goBack();
        });
        return;
    }

    // reset
    _resetPage();

    // get item
    var query = "SELECT * FROM " + LocalSave._tableName + " WHERE id=?";
    console.log(query);
    db.queryGet(
        query,
        [shotId],
        function (row) {
            /*
            { name: "id", type: "INTEGER PRIMARY KEY AUTOINCREMENT" },
            { name: "path", type: "TEXT" },
            { name: "playername", type: "TEXT" },
            { name: "coachname", type: "TEXT" },
            { name: "clubname", type: "TEXT" },
            { name: "thumbnail", type: "INTEGER" },
            { name: "date", type: "DATETIME" },
            { name: "shottype", type: "INTEGER" },
            { name: "ratingtype", type: "INTEGER" },
            { name: "duration", type: "INTEGER" }
            */
            console.log(row);

            // player name
            firstname = row[2] ? row[2] : null;
            viewModel.set("playername", firstname);

            // coach name
            coachname = row[3] ? row[3] : null;
            viewModel.set("coachname", coachname);

            // player name
            clubname = row[4] ? row[4] : null;
            viewModel.set("clubname", clubname);

            // set shot type
            var shotTypeIndex = row[7] ? row[7] : 0;
            if (shotTypeIndex != 0) {
                shotTypeName = ShotTypes.getNameFromValue(shotTypeIndex);
            }
            console.log("shottype = " + shotTypeIndex + " " + row[7]);
            viewModel.set("shotTypeName", shotTypeName);

            // set rating type
            var ratingTypeIndex = row[8] ? row[8] : 0;
            if (ratingTypeIndex != 0) {
                ratingTypeName = RatingTypes.getNameFromValue(ratingTypeIndex);
            }
            console.log("ratingtype = " + ratingTypeIndex + " " + row[8]);
            viewModel.set("ratingTypeName", ratingTypeName);

            // set date / time data
            dateTimeObj = row[6] ? (new Date(row[6])) : (new Date());
            date = dateTimeObj.toDateString();
            time = dateTimeObj.toLocaleTimeString("en-US");
            viewModel.set("date", date);
            viewModel.set("time", time);

            // set file path
            path = row[1] ? row[1] : null;
            viewModel.set("videoPath", path);

            // set duration
            duration = row[9] ? row[9] : 0;
            viewModel.set("duration", duration);

            // stop loading icon
            isLoading = false;
            viewModel.set("isLoading", isLoading);
        },
        function (error) {
            // stop loading icon
            isLoading = false;
            viewModel.set("isLoading", isLoading);
            videoLoading = false;
            viewModel.set("videoLoading", videoLoading);
            shotId = null;
            dialogs.alert({
                title: "Error getting Shot",
                message: error.message,
                okButtonText: "Okay"
            }).then(function () {
                frameModule.topmost().goBack();
            });
        }
    );

}

/**
 * Sets Shot using data from server. Needs to perform a HTML query to get data.
 * @param {any} editTypeOptions
 */
function _setShotSearch(editTypeOptions) {

    // check if the shot has been set
    if (!shotId) {
        isLoading = false;
        viewModel.set("isLoading", isLoading);
        videoLoading = false;
        viewModel.set("videoLoading", videoLoading);
        shotId = null;
        console.error("No shot ID has been set. Cannot download shot.");
        dialogs.alert({
            title: "Error getting Shot",
            message: "The Shot doesn't have an ID. It can't be loaded.",
            okButtonText: "Okay"
        }).then(function () {
            frameModule.topmost().goBack();
        });
        return;
    }

    // reset
    _resetPage();

    console.log("online");
    var sendToken = appSettings.getString(global.tokenAccess);
    var shotUrl = global.serverUrl + global.endpointShot + shotId;

    // do request
    var request = new HTTPRequestWrapper(
        shotUrl,
        "GET",
        "application/json",
        sendToken
    );
    request.send(
        function (result) {
            // console.log(JSON.stringify(result));
            var obj = JSON.stringify(result);
            obj = JSON.parse(obj);
            var info = obj.content;

            // set values
            playername = info.player_name ? info.player_name : null;
            coachname = info.coach_name ? info.coach_name : null;
            clubname = info.club_name ? info.club_name : null;
            type = info.type ? info.type : null;
            rating = info.rating ? info.rating : null;
            dateTimeObj = info.date_recorded;
            //date = dateTimeObj.toDateString();                // not used
            //time = dateTimeObj.toLocaleTimeString("en-US");   // not used
            path = info.video_set ? info.video_set[0].file : null;
            duration = 0;
            thumbnail = 0;

            // set page
            viewModel.set("playername", playername);
            viewModel.set("coachname", coachname);
            viewModel.set("clubname", clubname);
            viewModel.set("shotTypeName", ShotTypes.getNameFromValue(type));
            viewModel.set("ratingTypeName", RatingTypes.getNameFromValue(rating));
            // viewModel.set("date", date);
            // viewModel.set("time", time);
            viewModel.set("videoPath", path);
            viewModel.set("duration", duration);

            // stop loading icon
            isLoading = false;
            viewModel.set("isLoading", isLoading);
        },
        function (error) {
            // stop loading icon
            isLoading = false;
            viewModel.set("isLoading", isLoading);
            videoLoading = false;
            viewModel.set("videoLoading", videoLoading);
            shotId = null;
            dialogs.alert({
                title: "Error getting Shot",
                message: error.message,
                okButtonText: "Okay"
            }).then(function () {
                frameModule.topmost().goBack();
            });
        }
    );

}

function _throwNoContextError() {
    console.error("Cannot view a Shot without knowing the context.");
    return new Error("Cannot view a Shot without knowing the context.");
}

/**
 * Resets all page vars.
 */
function _resetPage() {

    // set loading status
    isLoading = true;

    // player name
    firstname = null;
    viewModel.set("playername", firstname);

    // coach name
    coachname = null;
    viewModel.set("coachname", coachname);

    // player name
    clubname = null;
    viewModel.set("clubname", clubname);

    // set shot type
    shotTypeName = null;
    viewModel.set("shotTypeName", shotTypeName);

    // set rating type
    ratingTypeName = null;
    viewModel.set("ratingTypeName", ratingTypeName);

    // set date / time data
    dateTimeObj = (new Date());
    date = dateTimeObj.toDateString();
    time = dateTimeObj.toLocaleTimeString("en-US");
    viewModel.set("date", date);
    viewModel.set("time", time);

    // set file path
    path = null;
    viewModel.set("videoPath", path);

    // set duration
    duration = 0;
    viewModel.set("duration", duration);
}
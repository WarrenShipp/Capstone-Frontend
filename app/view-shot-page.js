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

// helpers
var player;     // the big video player.
var shotTypeList;
var ratingTypeList;
const shotTypeListArray = [
    { display: "Not Set" },
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
    { display: "Not Set" },
    { display: "Perfect" },
    { display: "Good" },
    { display: "Off Balanced" },
    { display: "Off Position" },
    { display: "Played Late" },
    { display: "Played Early" }
];

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
            canEdit = true;
            editType = EDIT_VIEW_SEARCH;
            break;
    }

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

    // set duration and slider max
    player = page.getViewById("nativeVideoPlayer");
    player.on(VideoPlayer.Video.playbackReadyEvent, args => {
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
        viewModel.set("duration", durSeconds);
        console.log("duration: " + duration);
    });

    // set edit button params
    viewModel.set("canEdit", canEdit);

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

function _getShot() {
    if (!type) {
        return _throwNoContextError();
    }
    else if (type == VIEW_LOCAL) {
        _setShotLocal();
    }
    else if (type == VIEW_ONLINE) {
        _setShotSearch();
    }
}

function _setShotLocal() {
    console.log("local");
    // shot id
    if (!shotId) {
        console.error("No shot ID has been set. Cannot load local shot.");
        dialogs.alert({
            title: "No ID set",
            message: "The Shot doesn't have an ID. It can't be loaded.",
            okButtonText: "Okay"
        }).then(function () {
            frameModule.topmost().goBack();
        });
        return;
    }

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

    // get item
    var query = "SELECT * FROM " + LocalSave._tableName + " WHERE id=?";
    console.log(query);
    db.queryGet(query, [shotId], function (row) {
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
            shotTypeName = shotTypeListArray[shotTypeIndex].display;
        }
        console.log("shottype = " + shotTypeIndex + " " + row[7]);
        viewModel.set("shotTypeName", shotTypeName);

        // set rating type
        var ratingTypeIndex = row[8] ? row[8] : 0;
        if (ratingTypeIndex != 0) {
            ratingTypeName = ratingTypeListArray[ratingTypeIndex].display;
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
    });

}

function _setShotSearch(editTypeOptions) {
    var playername;
    var coachname;
    var clubname;
    var date;
    var time;

    // no shot id. Added by DBs
    console.log("online get");
    console.log(shotId);
    var sendToken = appSettings.getString(global.tokenAccess);
    var shotUrl = global.serverUrl + global.endpointShot + shotId;
    http.request({
        url: shotUrl,
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + sendToken }
    }).then(function (result) {
        console.log(JSON.stringify(result));
        var obj = JSON.stringify(result);
        obj = JSON.parse(obj);
        var info = obj.content;
        playername = info.player_name ? info.player_name : null;
        coachname = info.coach_name ? info.coach_name : null;
        clubname = info.club_name ? info.club_name : null;
        type = info.type ? info.type : null;
        rating = info.rating ? info.rating : null; 
        dateTimeObj = info.date_recorded;
        console.log(dateTimeObj);
        //date = dateTimeObj.toDateString(); // date broken?
        //time = dateTimeObj.toLocaleTimeString("en-US");
        //path = info.video_set ? info.video_set[0].file : null; // videosetbroken
        console.log(playername);
        viewModel.set("playername", playername);
        viewModel.set("coachname", coachname);
        viewModel.set("clubname", clubname);
        viewModel.set("shotTypeName", shotTypeListArray[type].display);
        viewModel.set("ratingTypeName", ratingTypeListArray[rating].display);
        viewModel.set("date", date);
        viewModel.set("time", time);
        //viewModel.set("videoPath", path); //videoset broken
        duration = 0;
        viewModel.set("duration", duration);
        thumbnail = 0;
        viewModel.set("sliderValue", thumbnail);

    }, function (error) {
        console.error(JSON.stringify(error));
    });


    // // set shot type
    // shotTypeList = new dropdown.ValueList(shotTypeListArray);
    // let shotType = page.getViewById("shotType");
    // viewModel.set("shotTypeItems", shotTypeList);
    // shotTypeIndex = 0;
    // viewModel.set("shotTypeIndex", shotTypeIndex);

    // // set rating type
    // ratingTypeList = new dropdown.ValueList(ratingTypeListArray);
    // let ratingType = page.getViewById("ratingType");
    // viewModel.set("ratingTypeItems", ratingTypeList);
    // ratingTypeIndex = 0;
    // viewModel.set("ratingTypeIndex", ratingTypeIndex);

    // // set date / time data
    // dateTimeObj = editTypeOptions.datetime ? editTypeOptions.datetime.toDateString() : (new Date());
    // date = dateTimeObj.toDateString();
    // time = dateTimeObj.toLocaleTimeString("en-US");
    // viewModel.set("date", date);
    // viewModel.set("time", time);
    // console.log("the date " + date);
    // console.log("the time " + time);

    // // set file path
    // if (!editTypeOptions.filePath) {
    //     return new Error("Recorded shot did not pass a file path.");
    // } else {
    //     path = editTypeOptions.filePath;
    // }
    // viewModel.set("videoPath", path);
    // console.log("file path " + path);

    // // set duration
    // duration = 0;
    // viewModel.set("duration", duration);

    // // set thumbnail
    // thumbnail = 0;
    // viewModel.set("sliderValue", thumbnail);

}

function _throwNoContextError() {
    console.error("Cannot view a Shot without knowing the context.");
    return new Error("Cannot view a Shot without knowing the context.");
}
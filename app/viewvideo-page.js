var observable = require("data/observable");
var viewModel = new observable.Observable();
const fileSystemModule = require("tns-core-modules/file-system");
var appSet = require("application-settings");
var frameModule = require("ui/frame");
var Sqlite = require("nativescript-sqlite");
var application = require("application");
var view = require("ui/core/view");
var dropdown = require("nativescript-drop-down");
var VideoPlayer = require("nativescript-videoplayer");
var Slider = require("ui/slider");

// Edit Types
const EDIT_RECORD = "record_shot";
const EDIT_VIEW_LOCAL = "edit_local";
const EDIT_VIEW_SEARCH = "edit_online";
var canCancel = false;
var localOnly = false;

// nav vars
var sourcePage;
var editTypeOptions;
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
var shotTypeIndex;
var ratingTypeIndex;
var shotTypeName;
var ratingTypeName;
var thumbnail;
var pageName;

// helpers
var player;     // the big video player.
var shotTypeList;
var ratingTypeList;
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
     * The page that, when we discard, this edit page will go back to.
     */
    sourcePage = page.navigationContext.sourcePage ? page.navigationContext.sourcePage : "home-page";
    /**
     * If true, the page will go back when cancelled instead of to the sourcePage.
     */
    backOnCancel = page.navigationContext.backOnCancel ? page.navigationContext.backOnCancel : false;
    /**
     * The type of editing that will be performed. Either local, record (new) or from search.
     */
    editType = page.navigationContext.editType;
    /**
     * The extra parameters. We place them here rather than directly in the
     * navigationContext to keep things neat.
     */
    editTypeOptions = page.navigationContext.editTypeOptions;

    console.log("sourcePage: " + sourcePage);
    console.log("editType: " + editType);
    console.log("editTypeOptions: " + editTypeOptions);

    // set edit button params
    switch (editType) {
        case EDIT_RECORD:
        default:
            canCancel = false;
            localOnly = true;
            break;
        case EDIT_VIEW_LOCAL:
            canCancel = true;
            localOnly = true;
            break;
        case EDIT_VIEW_SEARCH:
            canCancel = true;
            localOnly = false;
            break;
    }

}
exports.onNavigatingTo = onNavigatingTo;

function onLoad(args) {
    page = args.object;

    // set up local database if needed.
    (new Sqlite("my.db")).then(db => {
        db.execSQL("CREATE TABLE IF NOT EXISTS testb (id INTEGER PRIMARY KEY, path TEXT, name TEXT, coach TEXT, club TEXT, shottype TEXT, ratingtype TEXT, date TEXT, thumbnail INTEGER)").then(id => {
            console.log("table created");

        }, error => {
            console.log("CREATE TABLE ERROR", error);
        });
    }, error => {
        console.log("OPEN DB ERROR", error);
    });

    // set page name
    if (editType == EDIT_RECORD) {
        pageName = "Record Shot";
    } else {
        pageName = "Edit Shot";
    }
    viewModel.set("pageName", pageName);

    // set id
    shotId = _getShotId(editType, editTypeOptions);

    // set player name

    // set coach

    // set club

    // set shot type
    shotTypeList = new dropdown.ValueList(shotTypeListArray);
    let shotType = page.getViewById("shotType");
    viewModel.set("shotTypeItems", shotTypeList);
    shotTypeIndex = _getShotType(editType, editTypeOptions);
    viewModel.set("shotTypeIndex", shotTypeIndex);

    // set rating type
    ratingTypeList = new dropdown.ValueList(ratingTypeListArray);
    let ratingType = page.getViewById("ratingType");
    viewModel.set("ratingTypeItems", ratingTypeList);
    ratingTypeIndex = _getRatingType(editType, editTypeOptions);
    viewModel.set("ratingTypeIndex", ratingTypeIndex);

    // set date / time data
    dateTimeObj = _getDateTimeObj(editType, editTypeOptions);
    dateTimeObj = !dateTimeObj ? (new Date()) : dateTimeObj;
    date = _getDate(editType, editTypeOptions);
    date = !date ? dateTimeObj.toDateString() : date;
    time = _getTime(editType, editTypeOptions);
    time = !time ? dateTimeObj.toLocaleTimeString("en-US") : time;
    viewModel.set("date", date);
    viewModel.set("time", time);
    console.log("the date " + date);
    console.log("the time " + time);
    
    // set file path
    path = _getVideoPath(editType, editTypeOptions);
    viewModel.set("videoPath", path);
    console.log("file path " + path);

    // set duration and slider max
    player = page.getViewById("nativeVideoPlayer");
    viewModel.set("duration", 0);
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
        viewModel.set("sliderMax", duration);
        setThumbnail();
        console.log("duration: " + duration);
    });

    // set slider
    thumbnail = _getThumbnail(editType, editTypeOptions);
    viewModel.set("sliderValue", thumbnail);
    var slider = page.getViewById("thumbnailSlider");
    slider.on("valueChange", args => {
        setThumbnail();
    });

    // set edit button params
    viewModel.set("canCancel", canCancel);
    viewModel.set("localOnly", localOnly);

    // set viewmodel
    page.bindingContext = viewModel;

}
exports.onLoad = onLoad;

function saveLocally(args) {
    page = args.object;
    // console.log("argstest " + args.newIndex);
    // console.log("pathway" + path);
    firstname = viewModel.get("playername");
    // console.log("dd value: " + shotTypeName);
    var dbdate = new Date();    // TODO mash date and time together in datetime string, conver to UTC
    (new Sqlite("my.db")).then(db => {
        db.execSQL(
            "INSERT INTO testb (id, path, name, coach, club, shottype, ratingtype, date, thumbnail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [shotId, path, firstname, coachname, clubname, shotTypeName, ratingTypeName, dbdate, thumbnail]
        ).then(id => {
            console.log("INSERT RESULT", id);
        }, error => {
            console.log("INSERT ERROR", error);
        });
    });
    if(page.android) {
        var Toast = android.widget.Toast;
        Toast.makeText(application.android.context, "Video Saved", Toast.LENGTH_SHORT).show();
    }
    var navigationOptions={
        moduleName:'videocamera-page',
        backstackVisible: false
    }

    frameModule.topmost().navigate(navigationOptions);

}
exports.saveLocally = saveLocally;

/**
 * Discards the current shot.
 * @param {any} args
 */
function discard(args) {

    // discard from database
    (new Sqlite("my.db")).then(db => {
        db.execSQL(
            "DELETE FROM testb WHERE id=?",
            [shotId]
        ).then(id => {
            console.log("Shot with id " + shotId + " deleted.", id);
        }, error => {
            console.error("Error deleting shot with id " + shotId, error);
        });
    });

    // discard video
    var filepath = path.split("/");
    console.log(filepath);
    file = filepath[6];
    console.log(file);
    fileString = file.toString();
    console.log(fileString);
    myFolder = fileSystemModule.knownFolders.temp();
    myFile = myFolder.getFile(fileString);
    myFile.remove();
    var navigationOptions={
        moduleName: sourcePage
    }

    frameModule.topmost().navigate(navigationOptions);

}
exports.discard = discard;

/**
 * Cancels the current shot.
 * @param {any} args
 */
function cancel(args) {
    if (backOnCancel) {
        frameModule.topmost().back();
    } else {
        var navigationOptions = {
            moduleName: sourcePage
        }
        frameModule.topmost().navigate(navigationOptions);
    }
}
exports.cancel = cancel;

function shotTypeDropdownChanged(args) {
    let dropdownShot = page.getViewById("shotType");
    shotTypeIndex = dropdownShot.selectedIndex;
    shotTypeName = shotTypeListArray[dropdownShot.selectedIndex].display;
    console.log(shotTypeIndex + " " + shotTypeName);
}
exports.shotTypeDropdownChanged = shotTypeDropdownChanged;

function ratingTypeDropdownChanged(args) {
    let dropdownRating = page.getViewById("ratingType");
    ratingTypeIndex = dropdownRating.selectedIndex;
    ratingTypeName = ratingTypeListArray[dropdownRating.selectedIndex].display;
    console.log(ratingTypeIndex + " " + ratingTypeName);
}
exports.ratingTypeDropdownChanged = ratingTypeDropdownChanged;

// TODO set name, club, and coach to update

/**
 * Sets a new thumbnail. Used to update the thumbnail video playback.
 */
function setThumbnail() {
    let slider = page.getViewById("thumbnailSlider");
    thumbnail = slider.value;
    console.log("Updating thumbnail to " + thumbnail);
    let thumbnailVideo = page.getViewById("thumbnailVideo");
    thumbnailVideo.seekToTime(thumbnail);
}
exports.setThumbnail = setThumbnail;

function _getShotId(editType, editTypeOptions) {
    if (!editType) {
        return _throwNoContextError();
    }
    else if (editType == EDIT_RECORD) {
        let newId = -1;
        let check = -1;
        do {
            check = -1;
            newId = Math.floor(Math.random() * 2147483647);     // max int32
            (new Sqlite("my.db")).then(db => {
                db.get("SELECT id FROM testb WHERE id=?", [newId]).then(row => {
                    check = row.id;
                }, error => {
                    console.error("Problem selecting id when creating new shot.", error);
                });
            });
        } while (check === newId);
        return newId;
    }
    return null;
}

function _getPlayerName(editType, editTypeOptions) {
    if (!editType) {
        return _throwNoContextError();
    }
    else if (editType == EDIT_RECORD) {
        return null;
    }
    return null;
}

function _getCoachName(editType, editTypeOptions) {
    if (!editType) {
        return _throwNoContextError();
    }
    else if (editType == EDIT_RECORD) {
        return null;
    }
    return null;
}

function _getClubName(editType, editTypeOptions) {
    if (!editType) {
        return _throwNoContextError();
    }
    else if (editType == EDIT_RECORD) {
        return null;
    }
    return null;
}

function _getVideoPath(editType, editTypeOptions) {
    if (!editType) {
        return _throwNoContextError();
    }
    else if (editType == EDIT_RECORD) {
        if (!editTypeOptions.filePath) {
            console.error("Recorded shot did not pass a file path.");
            return new Error("Recorded shot did not pass a file path.");
        } else {
            return editTypeOptions.filePath;
        }
    }
    return null;
}

function _getShotType(editType, editTypeOptions) {
    if (!editType) {
        return _throwNoContextError();
    }
    else if (editType == EDIT_RECORD) {
        return null;
    }
    return null;
}

function _getRatingType(editType, editTypeOptions) {
    if (!editType) {
        return _throwNoContextError();
    }
    else if (editType == EDIT_RECORD) {
        return null;
    }
    return null;
}

function _getThumbnail(editType, editTypeOptions) {
    if (!editType) {
        return _throwNoContextError();
    }
    else if (editType == EDIT_RECORD) {
        return 0;   // always reset to 0.
    }
    return null;
}

/**
 * Gets datetime. This has three options based upon the type of loaded:
 *   - from Recording: 
 */
function _getDate(editType, editTypeOptions) {
    if (!editType) {
        return _throwNoContextError();
    }
    else if (editType == EDIT_RECORD) {
        if (!editTypeOptions.datetime) {
            return null;    // can create new date.
        } else {
            return editTypeOptions.datetime.toDateString();
        }
    }
    return null;
}

function _getTime(editType, editTypeOptions) {
    if (!editType) {
        return _throwNoContextError();
    }
    else if (editType == EDIT_RECORD) {
        if (!editTypeOptions.datetime) {
            return null;    // can create new date.
        } else {
            return editTypeOptions.datetime.toLocaleTimeString("en-US");
        }
    }
    return null;
}

function _getDateTimeObj(editType, editTypeOptions) {
    if (!editType) {
        return _throwNoContextError();
    }
    else if (editType == EDIT_RECORD) {
        if (!editTypeOptions.datetime) {
            return null;    // can create new date.
        } else {
            return editTypeOptions.datetime;
        }
    }
    return null;
}

function _throwNoContextError() {
    console.error("Cannot edit a Shot without knowing the context.");
    return new Error("Cannot edit a Shot without knowing the context.");
}
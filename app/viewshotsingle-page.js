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

// View Params
const VIEW_LOCAL = "view_local";
const VIEW_SEARCH = "view_online";
const EDIT_RECORD = "record_shot";
const EDIT_VIEW_LOCAL = "edit_local";
const EDIT_VIEW_SEARCH = "edit_online";
var canEdit = false;
var canUpload = false;

// nav vars
var sourcePage;
var viewTypeOptions;
var viewType;

// page vars
var shotId;
var firstname;
var coachname;
var clubname;
var path;
var duration;
var date;
var shotType;
var ratingType;
var thumbnail;

// helpers
var player;     // the big video player.
var cachedShot; // store shot data from DB in here.

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
    viewType = page.navigationContext.viewType;
    /**
     * The extra parameters. We place them here rather than directly in the
     * navigationContext to keep things neat.
     */
    viewTypeOptions = page.navigationContext.viewTypeOptions;

    console.log("sourcePage: " + sourcePage);
    console.log("viewType: " + viewType);
    console.log("viewTypeOptions: " + viewTypeOptions);

    // set edit button params
    switch (viewType) {
        case VIEW_LOCAL:
        default:
            canUpload = true;
            canEdit = true;
            break;
        case VIEW_SEARCH:
            canUpload = true;
            canEdit = true;
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

    // set id
    shotId = _getShotId(viewType, viewTypeOptions);

    // set name
    firstname = _getPlayerName(viewType, viewTypeOptions);
    viewModel.set("playername", firstname);

    // set coach
    coachname = _getCoachName(viewType, viewTypeOptions);
    viewModel.set("coachname", coachname);

    // set club
    clubname = _getClubName(viewType, viewTypeOptions);
    viewModel.set("clubname", clubname);

    // set shot type
    shotType = _getShotType(viewType, viewTypeOptions);
    viewModel.set("shotType", shotType);

    // set rating type
    ratingType = _getRatingType(viewType, viewTypeOptions);
    viewModel.set("ratingType", ratingType);

    // set date / time data
    date = _getDateTimeObj(viewType, viewTypeOptions);
    viewModel.set("date", date);
    
    // set file path
    path = _getVideoPath(viewType, viewTypeOptions);
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
        console.log("duration: " + duration);
    });

    // set thumbnail (behind only)
    thumbnail = _getThumbnail(viewType, viewTypeOptions);

    // set edit button params
    viewModel.set("canEdit", canEdit);
    viewModel.set("canUpload", canUpload);

    // set viewmodel
    page.bindingContext = viewModel;

}
exports.onLoad = onLoad;

function edit(args) {
    if (viewType == VIEW_LOCAL) {
        if (!cachedShot) {
            _getData(viewType, viewTypeOptions);
        }
        let editType = EDIT_VIEW_LOCAL;
        let editTypeOptions = {
            shotId: shotId,
            path: path,
            name: firstname,
            coach: coachname,
            club: clubname,
            shottype: shotType,
            ratingtype: ratingType,
            date: date,
            thumbnail: thumbnail
        };
        let sourcePage = "viewshots-page";
        var navigationOptions = {
            moduleName: 'viewvideo-page',
            context: {
                sourcePage: sourcePage,
                backOnCancel: true,
                editType: editType,
                editTypeOptions: editTypeOptions
            }
        }
        frameModule.topmost().navigate(navigationOptions);
    }
}
exports.edit = edit;

function upload(args) {

    // TODO go back if on VIEW_LOCAL only!
}
exports.upload = upload;

/**
 * Returns to the previous page. 
 * @param {any} args
 */
function cancel(args) {
    frameModule.topmost().goBack();
}
exports.cancel = cancel;

function _getShotId(viewType, viewTypeOptions) {
    if (!cachedShot) {
        _getData(viewType, viewTypeOptions);
    }
    if (viewType == VIEW_LOCAL) {
        return cachedShot.id;
    }
    return null;
}

function _getPlayerName(viewType, viewTypeOptions) {
    if (!cachedShot) {
        _getData(viewType, viewTypeOptions);
    }
    if (viewType == VIEW_LOCAL) {
        return cachedShot.name;
    }
    return null;
}

function _getCoachName(viewType, viewTypeOptions) {
    if (!cachedShot) {
        _getData(viewType, viewTypeOptions);
    }
    if (viewType == VIEW_LOCAL) {
        return cachedShot.coach;
    }
    return null;
}

function _getClubName(viewType, viewTypeOptions) {
    if (!cachedShot) {
        _getData(viewType, viewTypeOptions);
    }
    if (viewType == VIEW_LOCAL) {
        return cachedShot.club;
    }
    return null;
}

function _getVideoPath(viewType, viewTypeOptions) {
    if (!cachedShot) {
        _getData(viewType, viewTypeOptions);
    }
    if (viewType == VIEW_LOCAL) {
        return cachedShot.path;
    }
    return null;
}

function _getShotType(viewType, viewTypeOptions) {
    if (!cachedShot) {
        _getData(viewType, viewTypeOptions);
    }
    if (viewType == VIEW_LOCAL) {
        return cachedShot.shottype;
    }
    return null;
}

function _getRatingType(viewType, viewTypeOptions) {
    if (!cachedShot) {
        _getData(viewType, viewTypeOptions);
    }
    if (viewType == VIEW_LOCAL) {
        return cachedShot.ratingtype;
    }
    return null;
}

function _getThumbnail(viewType, viewTypeOptions) {
    if (!cachedShot) {
        _getData(viewType, viewTypeOptions);
    }
    if (viewType == VIEW_LOCAL) {
        return cachedShot.thumbnail;
    }
    return null;
}

function _getDate(viewType, viewTypeOptions) {
    return null;
}

function _getTime(viewType, viewTypeOptions) {
    return null;
}

function _getDateTimeObj(viewType, viewTypeOptions) {
    if (!cachedShot) {
        _getData(viewType, viewTypeOptions);
    }
    if (viewType == VIEW_LOCAL) {
        return cachedShot.date;
    }
    return null;
}

function _getThumbnail(editType, editTypeOptions) {
    if (!cachedShot) {
        _getData(viewType, viewTypeOptions);
    }
    else if (viewType == VIEW_LOCAL) {
        return cachedShot.thumbnail;
    }
    return null;
}

function _getData(viewType, viewTypeOptions) {
    if (!viewType) {
        _throwNoContextError();
    }
    else if (viewType == VIEW_LOCAL) {
        if (!viewTypeOptions.shotId) {
            throw new Error("Cannot view a local shot without knowing its ID.");
        }
        
        (new Sqlite("my.db")).then(db => {
            db.get("SELECT * FROM testb WHERE id=?", [viewTypeOptions.shotId]).then(row => {
                console.log(row);
                cachedShot = {
                    id: row[0],
                    path: row[1],
                    name: row[2],
                    coach: row[3],
                    club: row[4],
                    shottype: row[5],
                    ratingtype: row[6],
                    date: row[7],
                    thumbnail: row[8]
                };
            }, error => {
                console.log("Error getting local Shot.", error);
            });
        }, error => {
            console.log("OPEN DB ERROR", error);
        });

    }

    // test return
    /*
    if (!cachedShot) {
        cachedShot = {
            shotId: 100,
            path: null,
            name: "Luke is Amazing!",
            coach: "Luke is Amazing!",
            club: "Luke's Funkytown!",
            duration: 5000,
            date: "1999-12-31 23:59:59",
            shottype: "Cover Drive",
            ratingtype: "Perfect",
            thumbnail: 1000
        };
    }
    */
}

function _throwNoContextError() {
    console.error("Cannot edit a Shot without knowing the context.");
    throw new Error("Cannot edit a Shot without knowing the context.");
}
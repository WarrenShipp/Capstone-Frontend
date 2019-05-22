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
const dialogs = require("tns-core-modules/ui/dialogs");
const LocalSave = require("../app/localsave/localsave.js");
const HTTPRequestWrapper = require("../app/http/http-request.js");
var db = new LocalSave();

var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");

// Edit Types
const EDIT_RECORD = "record_shot";
const EDIT_VIEW_LOCAL = "edit_local";
const EDIT_VIEW_SEARCH = "edit_online";
var canCancel = false;
var canDiscard = false;
var canSave = false;
var canUpload = false;
var canFindUser = false;
var lockUserActions = false;

var lockMutex = false;

// nav vars
var sourcePage;
var editTypeOptions;
var editType;
var fromNav;

// page vars
var shotId;
var playerId;
var firstname;
var coachId;
var coachname;
var clubId;
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

// ui vars
var isLoading;
var videoLoading;
var hasVideo;

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

// modal
const modalViewModule = "modal-select-player";

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
            canSave = true;
            canDiscard = true;
            break;
        case EDIT_VIEW_LOCAL:
            canCancel = true;
            canSave = true;
            canDiscard = true;
            break;
        case EDIT_VIEW_SEARCH:
            canCancel = true;
            canSave = false;
            canDiscard = false; // TODO change this based upon permissions
            break;
    }

    // can upload?
    // TODO need to make sure you have permissions. This should be passed by the server.
    canUpload = appSet.getString(global.tokenAccess) ? true : false;
    canFindUser = appSet.getString(global.tokenAccess) ? true : false;

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
    if (editType == EDIT_RECORD) {
        pageName = "Record Shot";
    } else {
        pageName = "Edit Shot";
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
        viewModel.set("sliderMax", duration);
        setThumbnail();
        console.log("duration: " + duration);
        hasVideo = true;
        viewModel.set("hasVideo", hasVideo);
        videoLoading = false;
        viewModel.set("videoLoading", videoLoading);
    });

    // set slider
    var slider = page.getViewById("thumbnailSlider");
    slider.on("valueChange", args => {
        setThumbnail();
    });

    // set edit button params
    viewModel.set("canCancel", canCancel);
    viewModel.set("canSave", canSave);
    viewModel.set("canUpload", canUpload);
    viewModel.set("canDiscard", canDiscard);
    viewModel.set("canFindUser", canFindUser);
    _unlockFunctionality();     // always start with unlocked features

    // set loading params
    isLoading = true;
    viewModel.set("isLoading", isLoading);
    videoLoading = true;
    viewModel.set("videoLoading", videoLoading);
    hasVideo = false;
    viewModel.set("hasVideo", hasVideo);

    // set viewmodel
    page.bindingContext = viewModel;

    // load data
    _getShot(editType, editTypeOptions);

}
exports.onLoad = onLoad;

/**
 * Uploads data to the server. If the shot is only being edited (not new), it
 * only add the changed data rather than upload.
 *
 * TODO upload is sending dummy data for now. Change to form data!
 * @param {any} args
 */
function upload(args) {
    var id;
    var sendToken = appSet.getString(global.tokenAccess);
    const documentsFolder = fileSystemModule.knownFolders.currentApp();
    console.log(path);
    console.log(sendToken);

    // set uploading data
    var toUpload = {};
    var uploadType;
    var uploadVideo;
    var videoDuration;
    var thumbnailVal;

    // if editing an uploaded shot, we need a PATCH request.
    if (editType == EDIT_VIEW_SEARCH) {
        // TODO no PATCH option available on server.
    }
    // if editing a local shot, we post
    else if (editType == EDIT_VIEW_LOCAL || editType == EDIT_RECORD) {
        uploadType = "POST";
        toUpload["player"] = playerId;
        // toUpload["club"] = "2182e986-3390-4b11-be8d-271a7751210f";

        // get data
        if (viewModel.get("shotTypeIndex")) {
            toUpload["type"] = viewModel.get("shotTypeIndex");
        }
        if (viewModel.get("ratingTypeIndex")) {
            toUpload["rating"] = viewModel.get("ratingTypeIndex");
        }
        var dateStr = dateTimeObj.toISOString();
        if (dateStr) {
            toUpload["date_recorded"] = dateStr;
        }

        // video data
        if (viewModel.get("videoPath")) {
            uploadVideo = true;
            videoDuration = duration;
            if (!videoDuration) {
                videoDuration = "0";
            } else {
                videoDuration = videoDuration.toString();
            }
        }

        // get thumbnail
        if (viewModel.get("sliderValue")) {
            thumbnailVal = viewModel.get("sliderValue");
            thumbnailVal = thumbnailVal.toString();
        } else {
            thumbnailVal = "0";
        }
    }

    console.log(toUpload);
    // do upload request
    var request = new HTTPRequestWrapper(
        global.serverUrl + global.endpointShot,
        uploadType,
        HTTPRequestWrapper.defaultContentType,
        sendToken
    );
    request.setContent(toUpload);
    request.send(function (result) {
        // console.log(result);
        var obj = JSON.stringify(result);
        obj = JSON.parse(obj);
        console.log(obj.content.id);
        id = obj.content.id;

        // set up video uploading
        var file = path;
        console.log("filepath: " + file);
        var name = file.substr(file.lastIndexOf("/") + 1);
        console.log("id is: " + id);

        // do video upload request.
        if (uploadVideo) {
            var request = {
                url: global.serverUrl + global.endpointVideo,
                method: "POST",
                headers: {
                    "Content-Type": "application/octet-stream", "Authorization": "Bearer " + sendToken
                },
                description: "Uploading " + name
            };
            var params = [
                { name: "shot", value: id },
                { name: "file", filename: file, mimeType: "video/mp4" },
                { name: "length", value: videoDuration },
                { name: "thumbnail_time", value: thumbnailVal }
            ];

            // multiupload
            var task = session.multipartUpload(params, request);
            task.on("complete", completeHandler);
            task.on("error", errorHandler);
            task.on("responded", respondedHandler);

            // Currently the responded task isn't working. Just force an exit!
            if (page.android) {
                var Toast = android.widget.Toast;
                Toast.makeText(application.android.context, "Video is Uploading", Toast.LENGTH_SHORT).show();
            };
            // navigate out once the server has received the request
            if (editType == EDIT_RECORD) {
                var navigationOptions = {
                    moduleName: "record-shot-page",
                    backstackVisible: false
                };
                frameModule.topmost().navigate(navigationOptions);
            } else {
                frameModule.topmost().goBack();
            }
        }
        // if no video to upload (usually due to edit request) nav out
        else {
            if (editType == EDIT_RECORD) {
                var navigationOptions = {
                    moduleName: "record-shot-page",
                    backstackVisible: false
                };
                frameModule.topmost().navigate(navigationOptions);
            } else {
                frameModule.topmost().goBack();
            }
        }

    });

    /**
     * Throws an error. No leaving the page once done.
     * @param {any} e
     */
    function errorHandler(e) {
        // The error handler is being called on completion.
        // For now just suppress the error.
        // TODO fix this bug!
        if (!e.response) {
            return;
        }
        console.error(e.response);
        console.error(e);
        console.error(e.response.getBodyAsString());
        dialogs.alert({
            title: "Error uploading video",
            message: e.response.getBodyAsString(),
            okButtonText: "Okay"
        }).then(function () { });
    }

    // event arguments:
    // task: Task
    // responseCode: number
    // data: string
    function respondedHandler(e) {
        /* Disabled since this function does not seem to work.
        console.log("Video being uploaded with responseCode: " + e.responseCode);
        if (page.android) {
            var Toast = android.widget.Toast;
            Toast.makeText(application.android.context, "Video is Uploading", Toast.LENGTH_SHORT).show();
        };
        // navigate out once the server has received the request
        if (editType == EDIT_RECORD) {
            var navigationOptions = {
                moduleName: "record-shot-page",
                backstackVisible: false
            };
            frameModule.topmost().navigate(navigationOptions);
        } else {
            frameModule.topmost().goBack();
        }
        */
    }

    // event arguments:
    // task: Task
    // responseCode: number
    // response: net.gotev.uploadservice.ServerResponse (Android) / NSHTTPURLResponse (iOS)
    function completeHandler(e) {
        console.log("Video uploaded with responseCode: " + e.responseCode);
        if (page.android) {
            var Toast = android.widget.Toast;
            Toast.makeText(application.android.context, "Video Finished Uploading", Toast.LENGTH_SHORT).show();
        };
    }

    // event arguments:
    // task: Task
    function cancelledHandler(e) {
        alert("upload cancelled");
    }

}
exports.upload = upload;

/**
 * Saves the file locally.
 * @param {any} args
 */
function saveLocally(args) {
    page = args.object;

    // lock functionality while saving
    _lockFunctionality();
    
    // shot is already locally saved. Update.
    if (editType == EDIT_VIEW_LOCAL) {
        _saveLocalEdit();
    }
    // shot is new. Insert.
    else {
        _saveLocalRecord();
    }

}
exports.saveLocally = saveLocally;

function _saveLocalEdit() {
    console.log("Saving during View Edit");

    // get changed vars
    var columnList = [];
    columnList.push({ column: "playername", value: firstname });
    columnList.push({ column: "coachname", value: coachname });
    columnList.push({ column: "clubname", value: clubname });
    if (path != viewModel.get("videoPath")) {
        columnList.push({ column: "path", value: viewModel.get("videoPath") });
    }
    columnList.push({ column: "thumbnail", value: thumbnail });
    if (shotTypeIndex != viewModel.get("shotTypeIndex")) {
        columnList.push({ column: "shottype", value: viewModel.get("shotTypeIndex") });
    }
    if (ratingTypeIndex != viewModel.get("ratingTypeIndex")) {
        columnList.push({ column: "ratingtype", value: viewModel.get("ratingTypeIndex") });
    }
    columnList.push({ column: "playerid", value: playerId });
    columnList.push({ column: "coachid", value: coachId });
    columnList.push({ column: "clubid", value: clubId });
    var dateCheck = viewModel.get("date");
    var timeCheck = viewModel.get("time");
    var dateTimeCheck = dateCheck + " " + timeCheck;
    var curDateTime = dateTimeObj.toDateString() + " " + dateTimeObj.toLocaleTimeString("en-US");
    if (curDateTime != dateTimeCheck) {
        columnList.push({ column: "date", value: new Date(dateCheck + " " + timeCheck) });
    }

    // build query
    var query = "UPDATE " + LocalSave._tableName + " SET ";
    var first = true;
    var valList = [];
    for (var i = 0; i < columnList.length; i++) {
        var item = columnList[i];
        if (!first) {
            query += ", ";
        }
        query += item.column + "=?";
        valList.push(item.value);
        first = false;
    }
    query += " WHERE id=?;";
    valList.push(shotId);
    console.log(query);

    // run query.
    var complete = new Promise(function (resolve, reject) {
        db.queryExec(query, valList,
            function (id) {
                console.log("Edited shot with id " + id);
                resolve(id);
            },
            function (err) {
                reject(err);
            });
    });

    // handle query after it has completed
    complete.then(
        function (val) {
            if (page.android) {
                var Toast = android.widget.Toast;
                Toast.makeText(application.android.context, "Shot Saved", Toast.LENGTH_SHORT).show();
            }
            // leave page
            frameModule.topmost().goBack();
        },
        function (err) {
            _unlockFunctionality();
        });
}

function _saveLocalRecord() {
    console.log("Insert");

    // get all vars (don't worry if they've been changed).
    var columnList = [];
    columnList.push({ column: "playername", value: firstname });
    columnList.push({ column: "coachname", value: coachname });
    columnList.push({ column: "clubname", value: clubname });
    columnList.push({ column: "path", value: path });
    columnList.push({ column: "thumbnail", value: thumbnail });
    columnList.push({ column: "shottype", value: viewModel.get("shotTypeIndex") });
    columnList.push({ column: "ratingtype", value: viewModel.get("ratingTypeIndex") });
    columnList.push({ column: "playerid", value: playerId });
    columnList.push({ column: "coachid", value: coachId });
    columnList.push({ column: "clubid", value: clubId });
    // columnList.push({ column: "duration", value: viewModel.get("duration") });
    var dateCheck = viewModel.get("date");
    var timeCheck = viewModel.get("time");
    columnList.push({ column: "date", value: new Date(dateCheck + " " + timeCheck) });

    console.log("list made");
    // build query
    var query = "INSERT INTO " + LocalSave._tableName + " (";
    var first = true;
    for (var i = 0; i < columnList.length; i++) {
        var item = columnList[i];
        if (!first) {
            query += ", ";
        }
        query += item.column;
        first = false;
    }
    query += ") VALUES (";
    first = true;
    var valList = [];
    for (var i = 0; i < columnList.length; i++) {
        var item = columnList[i];
        if (!first) {
            query += ", ";
        }
        query += "?";
        first = false;
        valList.push(item.value);
    }
    query += ");";
    console.log(query);

    // run query.
    var complete = new Promise(function (resolve, reject) {
        db.queryExec(query, valList,
            function (id) {
                console.log("Saved new shot with id " + id);
                resolve(id);
            },
            function (err) {
                reject(err);
            });
    });

    // handle query after it has completed
    complete.then(
        function (val) {
            if (page.android) {
                var Toast = android.widget.Toast;
                Toast.makeText(application.android.context, "New Shot Saved", Toast.LENGTH_SHORT).show();
            }
            // leave page
            var navigationOptions = {
                moduleName: "record-shot-page",
                backstackVisible: false
            };
            frameModule.topmost().navigate(navigationOptions);
        },
        function (err) {
            _unlockFunctionality();
        });
}

/**
 * Discards the current shot.
 * @param {any} args
 */
function discard(args) {

    // lock to prevent weird user interactions
    _lockFunctionality();

    // discard from database
    if (shotId) {

        var query = "DELETE FROM " + LocalSave._tableName + " WHERE id=?";
        valList = [shotId];
        console.log(query);

        // run query.
        var complete = new Promise(function (resolve, reject) {
            db.queryExec(query, valList,
                function (id) {
                    console.log("Deleted shot with id " + id);
                    resolve(id);
                },
                function (err) {
                    reject(err);
                });
        });

        // handle query after it has completed
        complete.then(
            function (val) {
                if (page.android) {
                    var Toast = android.widget.Toast;
                    Toast.makeText(application.android.context, "Shot Deleted", Toast.LENGTH_SHORT).show();
                }

                // discard video
                _discardVideo();

                // go to source page.
                var navigationOptions = {
                    moduleName: sourcePage,
                    backstackVisible: true
                }
                frameModule.topmost().navigate(navigationOptions);
            },
            function (err) {
                _unlockFunctionality();
            });
        
    }
    // if the shot is new, there is nothing saved locally.
    else {
        _discardVideo();

        // go to record page since we are recording.
        var navigationOptions = {
            moduleName: "record-shot-page",
            backstackVisible: true
        }
        frameModule.topmost().navigate(navigationOptions);
    }

}
exports.discard = discard;

/**
 * Discards a locally saved video.
 */
function _discardVideo() {
    var filepath = path.split("/");
    console.log(filepath);
    file = filepath[6];
    console.log(file);
    fileString = file.toString();
    console.log(fileString);
    myFolder = fileSystemModule.knownFolders.temp();
    myFile = myFolder.getFile(fileString);
    myFile.remove();
}

/**
 * Called to change Shot Type dropdown value.
 *
 * TODO change to collect data from viewmodel vars
 * @param {any} args
 */
function shotTypeDropdownChanged(args) {
    let dropdownShot = page.getViewById("shotType");
    // shotTypeIndex = dropdownShot.selectedIndex;
    shotTypeName = shotTypeListArray[dropdownShot.selectedIndex].display;
    console.log(dropdownShot.selectedIndex + " " + shotTypeName);
}
exports.shotTypeDropdownChanged = shotTypeDropdownChanged;

/**
 * Called to change Rating Type dropdown value.
 *
 * TODO change to collect data from viewmodel vars
 * @param {any} args
 */
function ratingTypeDropdownChanged(args) {
    let dropdownRating = page.getViewById("ratingType");
    // ratingTypeIndex = dropdownRating.selectedIndex;
    ratingTypeName = ratingTypeListArray[dropdownRating.selectedIndex].display;
    console.log(dropdownRating.selectedIndex + " " + ratingTypeName);
}
exports.ratingTypeDropdownChanged = ratingTypeDropdownChanged;

/**
 * Sets a new thumbnail. Used to update the thumbnail video playback.
 */
function setThumbnail(args) {
    let slider = page.getViewById("thumbnailSlider");
    // thumbnail = slider.value;
    thumbnail = viewModel.get("sliderValue");
    console.log("Updating thumbnail to " + thumbnail);
    let thumbnailVideo = page.getViewById("thumbnailVideo");
    thumbnailVideo.seekToTime(thumbnail);
}
exports.setThumbnail = setThumbnail;

/**
 * Passes shot data collection / display off to appropriate method.
 * @param {any} editType
 * @param {any} editTypeOptions
 */
function _getShot(editType, editTypeOptions) {
    if (!editType) {
        return _throwNoContextError();
    }
    else if (!fromNav) {
        // don't get any data; it's already there!
        isLoading = false;
        viewModel.set("isLoading", isLoading);
    }
    else if (editType == EDIT_RECORD) {
        _setShotRecord(editTypeOptions);
    }
    else if (editType == EDIT_VIEW_LOCAL) {
        _setShotLocal(editTypeOptions);
    }
    else if (editType == EDIT_VIEW_SEARCH) {
        _setShotSearch(editTypeOptions);
    }

    // remove nav check to prevent loading icon error
    fromNav = false;
}

/**
 * Set shot data that comes from the Record Page.
 * @param {any} editTypeOptions
 */
function _setShotRecord(editTypeOptions) {

    // no shot id. Added by DBs

    // player name
    firstname = null;
    playerId = null;
    viewModel.set("playername", firstname);

    // coach name
    coachname = null;
    coachId = null;
    viewModel.set("coachname", coachname);

    // player name
    clubname = null;
    clubId = null;
    viewModel.set("clubname", clubname);

    // set shot type
    shotTypeList = new dropdown.ValueList(shotTypeListArray);
    let shotType = page.getViewById("shotType");
    viewModel.set("shotTypeItems", shotTypeList);
    shotTypeIndex = 0;
    viewModel.set("shotTypeIndex", shotTypeIndex);

    // set rating type
    ratingTypeList = new dropdown.ValueList(ratingTypeListArray);
    let ratingType = page.getViewById("ratingType");
    viewModel.set("ratingTypeItems", ratingTypeList);
    ratingTypeIndex = 0;
    viewModel.set("ratingTypeIndex", ratingTypeIndex);

    // set date / time data
    dateTimeObj = editTypeOptions.datetime ? editTypeOptions.datetime : (new Date());
    date = dateTimeObj.toDateString();
    time = dateTimeObj.toLocaleTimeString("en-US");
    viewModel.set("date", date);
    viewModel.set("time", time);
    console.log("the date " + date);
    console.log("the time " + time);

    // set file path
    if (!editTypeOptions.filePath) {
        return new Error("Recorded shot did not pass a file path.");
    } else {
        path = editTypeOptions.filePath;
    }
    viewModel.set("videoPath", path);
    console.log("file path " + path);

    // set duration
    duration = 0;
    viewModel.set("duration", duration);

    // set thumbnail
    thumbnail = 0;
    viewModel.set("sliderValue", thumbnail);

    // loading completed
    isLoading = false;
    viewModel.set("isLoading", isLoading);

}

/**
 * Set shot data that comes from the local DB.
 * @param {any} editTypeOptions
 */
function _setShotLocal(editTypeOptions) {

    // lock while loading from DB
    _lockFunctionality();

    // shot id
    shotId = editTypeOptions.id;
    if (!shotId) {
        isLoading = false;
        viewModel.set("isLoading", isLoading);
        videoLoading = false;
        viewModel.set("videoLoading", videoLoading);
        shotId = null;
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
    playerId = null
    viewModel.set("playername", firstname);

    // coach name
    coachname = null;
    coachId = null;
    viewModel.set("coachname", coachname);

    // player name
    clubname = null;
    clubId = null;
    viewModel.set("clubname", clubname);

    // set shot type
    shotTypeList = new dropdown.ValueList(shotTypeListArray);
    let shotType = page.getViewById("shotType");
    viewModel.set("shotTypeItems", shotTypeList);
    shotTypeIndex = 0;
    viewModel.set("shotTypeIndex", shotTypeIndex);

    // set rating type
    ratingTypeList = new dropdown.ValueList(ratingTypeListArray);
    let ratingType = page.getViewById("ratingType");
    viewModel.set("ratingTypeItems", ratingTypeList);
    ratingTypeIndex = 0;
    viewModel.set("ratingTypeIndex", ratingTypeIndex);

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

    // set thumbnail
    thumbnail = 0;
    viewModel.set("sliderValue", thumbnail);

    // get item
    var query = "SELECT * FROM " + LocalSave._tableName + " WHERE id=?";
    db.queryGet(query, [shotId],
        function (row) {
            /*
            0: { name: "id", type: "INTEGER PRIMARY KEY AUTOINCREMENT" },
            1: { name: "path", type: "TEXT" },
            2: { name: "playername", type: "TEXT" },
            3: { name: "coachname", type: "TEXT" },
            4: { name: "clubname", type: "TEXT" },
            5: { name: "thumbnail", type: "INTEGER" },
            6: { name: "date", type: "DATETIME" },
            7: { name: "shottype", type: "INTEGER" },
            8: { name: "ratingtype", type: "INTEGER" },
            9: { name: "duration", type: "INTEGER" },
            10: { name: "playerid", type: "TEXT" },
            11: { name: "coachid", type: "TEXT" },
            12: { name: "clubid", type: "TEXT" }
            */

            // player name
            firstname = row[2] ? row[2] : null;
            viewModel.set("playername", firstname);

            // coach name
            coachname = row[3] ? row[3] : null;
            viewModel.set("coachname", coachname);

            // club name
            clubname = row[4] ? row[4] : null;
            viewModel.set("clubname", clubname);

            // player id
            playerId = row[10] ? row[10] : null;
            viewModel.set("playerId", playerId);

            // coach id
            coachId = row[11] ? row[11] : null;
            viewModel.set("coachId", coachId);

            // club id
            clubId = row[12] ? row[12] : null;
            viewModel.set("clubId", clubId);

            // set shot type
            shotTypeIndex = row[7] ? row[7] : 0;
            viewModel.set("shotTypeIndex", shotTypeIndex);

            // set rating type
            ratingTypeIndex = row[8] ? row[8] : 0;
            viewModel.set("ratingTypeIndex", ratingTypeIndex);

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

            // set thumbnail
            thumbnail = row[5] ? row[5] : 0;
            viewModel.set("sliderValue", thumbnail);

            // loading complete
            isLoading = false;
            viewModel.set("isLoading", isLoading);

            // unlock once completed
            _unlockFunctionality();
        },
        function (err) {
            // stop loading icon
            isLoading = false;
            viewModel.set("isLoading", isLoading);
            videoLoading = false;
            viewModel.set("videoLoading", videoLoading);
            shotId = null;
            dialogs.alert({
                title: "Error getting Shot",
                message: err.message,
                okButtonText: "Okay"
            }).then(function () {
                frameModule.topmost().goBack();
            });
        });

}

/**
 * Set shot data that comes from the server.
 * TODO not implemented!
 * @param {any} editTypeOptions
 */
function _setShotSearch(editTypeOptions) {

    // shot id
    shotId = editTypeOptions.id;
    if (!shotId) {
        isLoading = false;
        viewModel.set("isLoading", isLoading);
        videoLoading = false;
        viewModel.set("videoLoading", videoLoading);
        shotId = null;
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

    // set shot type
    shotTypeList = new dropdown.ValueList(shotTypeListArray);
    let shotType = page.getViewById("shotType");
    viewModel.set("shotTypeItems", shotTypeList);
    shotTypeIndex = 0;
    viewModel.set("shotTypeIndex", shotTypeIndex);

    // set rating type
    ratingTypeList = new dropdown.ValueList(ratingTypeListArray);
    let ratingType = page.getViewById("ratingType");
    viewModel.set("ratingTypeItems", ratingTypeList);
    ratingTypeIndex = 0;
    viewModel.set("ratingTypeIndex", ratingTypeIndex);

    // set date / time data
    dateTimeObj = editTypeOptions.datetime ? editTypeOptions.datetime.toDateString() : (new Date());
    date = dateTimeObj.toDateString();
    time = dateTimeObj.toLocaleTimeString("en-US");
    viewModel.set("date", date);
    viewModel.set("time", time);
    console.log("the date " + date);
    console.log("the time " + time);

    // set file path
    if (!editTypeOptions.filePath) {
        return new Error("Recorded shot did not pass a file path.");
    } else {
        path = editTypeOptions.filePath;
    }
    viewModel.set("videoPath", path);
    console.log("file path " + path);

    // set duration
    duration = 0;
    viewModel.set("duration", duration);

    // set thumbnail
    thumbnail = 0;
    viewModel.set("sliderValue", thumbnail);

}

/**
 * Prevents user from interacting with the page.
 */
function _lockFunctionality() {
    lockUserActions = true;
    viewModel.set("lockUserActions", lockUserActions);
}

/**
 * Allows the user to interact with the page.
 */
function _unlockFunctionality() {
    lockUserActions = false;
    viewModel.set("lockUserActions", lockUserActions);
}

function _throwNoContextError() {
    console.error("Cannot edit a Shot without knowing the context.");
    return new Error("Cannot edit a Shot without knowing the context.");
}

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
 * Goes back.
 * @param {any} args
 */
function cancel(args) {
    frameModule.topmost().goBack();
}
exports.cancel = cancel;
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
var LocalSave = require("../app/localsave/localsave.js");
var db = new LocalSave();

var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");

// Edit Types
const EDIT_RECORD = "record_shot";
const EDIT_VIEW_LOCAL = "edit_local";
const EDIT_VIEW_SEARCH = "edit_online";
var canCancel = false;
var localOnly = false;
var canUpload = false;

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
        case EDIT_VIEW_LOCAL:
        default:
            canCancel = false;
            localOnly = true;
            break;
        case EDIT_VIEW_SEARCH:
            canCancel = true;
            localOnly = false;
            break;
    }

    // can upload?
    // TODO need to make sure you have permissions. This should be passed by the server.
    canUpload = appSet.getString(global.tokenAccess) ? true : false;

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
    });

    // set slider
    var slider = page.getViewById("thumbnailSlider");
    slider.on("valueChange", args => {
        setThumbnail();
    });

    // set edit button params
    viewModel.set("canCancel", canCancel);
    viewModel.set("localOnly", localOnly);
    viewModel.set("canUpload", canUpload);

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
 * TODO upload does not distinguish between new shot and edited.
 * TODO video sending is not complete. Sends a bunch of fake data / not taken from form.
 * TODO video is being sent after upload request has been received. This needs to change.
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

    // if editing an uploaded shot, we need a PATCH request.
    if (editType == EDIT_VIEW_SEARCH) {
        // TODO no PATCH option available on server.
    }
    // if editing a local shot, we post
    else if (editType == EDIT_VIEW_LOCAL || editType == EDIT_RECORD) {
        uploadType = "POST";
        toUpload["player"] = "5df86c6e-6396-42e4-bcf0-da8d12dbe5b6";
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
            // toUpload["date_recorded"] = dateStr;
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
    }

    console.log(toUpload);
    // do upload request
    http.request({
        url: global.serverUrl + global.endpointShot,
        method: uploadType,
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + sendToken },
        content: JSON.stringify(toUpload)
    }).then(function (result) {
        if (result.statusCode) {
            console.log(result.statusCode);
        }
        try {
            console.log(result);
            var obj = JSON.stringify(result);
            obj = JSON.parse(obj);
            console.log(obj.content.id);
            id = obj.content.id;

            // set up video uploading
            var file = path;
            console.log("filepath: " + file);
            var url = global.serverUrl + global.endpointVideo;
            var name = file.substr(file.lastIndexOf("/") + 1);
            console.log("id is: " + id);

            // only upload video if asked to.
            if (uploadVideo) {
                var request = {
                    url: url,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/octet-stream", "Authorization": "Bearer " + sendToken
                    },
                    description: "Uploading " + name
                };

                var params = [
                    { name: "shot", value: id },
                    { name: "file", filename: file, mimeType: "video/mp4" },
                    { name: "length", value: videoDuration }
                ];
                //var task = session.uploadFile(file, request);
                var task = session.multipartUpload(params, request);
                task.on("complete", completeHandler);
                task.on("error", errorHandler);
            } else {
                // TODO navigate out once done.
            }
        } catch (err) {
            console.error(err);
        }
        
    }, function (error) {
        console.error(JSON.stringify(error));
    });

    //task.on("progress", progressHandler);
    // task.on("error", errorHandler);
    // task.on("responded", respondedHandler);
    // task.on("complete", completeHandler);

    // event arguments:
    // task: Task
    // currentBytes: number
    // totalBytes: number
    function progressHandler(e) {
        alert("uploaded " + e.currentBytes + " / " + e.totalBytes);
    }

    // event arguments:
    // task: Task
    // responseCode: number
    // error: java.lang.Exception (Android) / NSError (iOS)
    // response: net.gotev.uploadservice.ServerResponse (Android) / NSHTTPURLResponse (iOS)
    function errorHandler(e) {
        alert("received " + e.responseCode + " code.");
        var serverResponse = e.response;
        console.log(serverResponse);
        console.log(e);
        console.log(e.response.getBodyAsString());
    }


    // event arguments:
    // task: Task
    // responseCode: number
    // data: string
    function respondedHandler(e) {
        //alert("received " + e.responseCode + " code. Server sent: " + e.data);
        alert("File has been uploaded to the server");
    }

    // event arguments:
    // task: Task
    // responseCode: number
    // response: net.gotev.uploadservice.ServerResponse (Android) / NSHTTPURLResponse (iOS)
    function completeHandler(e) {
        alert("received " + e.responseCode + " code");
        var serverResponse = e.response;
        // TODO navigate out once done.
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
    console.log("Start save");
    
    // shot is already locally saved. Update.
    if (shotId) {
        console.log("Edit");

        // get changed vars
        var columnList = [];
        if (firstname != viewModel.get("playername")) {
            columnList.push({ column: "playername", value: viewModel.get("playername") });
        }
        if (coachname != viewModel.get("coachname")) {
            columnList.push({ column: "coachname", value: viewModel.get("coachname") });
        }
        if (clubname != viewModel.get("clubname")) {
            columnList.push({ column: "clubname", value: viewModel.get("clubname") });
        }
        if (path != viewModel.get("videoPath")) {
            columnList.push({ column: "path", value: viewModel.get("videoPath") });
        }
        if (thumbnail != viewModel.get("thumbnail")) {
            columnList.push({ column: "thumbnail", value: viewModel.get("thumbnail") });
        }
        if (shotTypeIndex != viewModel.get("shotTypeIndex")) {
            columnList.push({ column: "shottype", value: viewModel.get("shotTypeIndex") });
        }
        if (ratingTypeIndex != viewModel.get("ratingTypeIndex")) {
            columnList.push({ column: "ratingtype", value: viewModel.get("ratingTypeIndex") });
        }
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
        var complete = false
        db.queryExec(query, valList, function (id) {
            complete = true;
            console.log("Edited shot with id " + id);
            if (page.android) {
                var Toast = android.widget.Toast;
                Toast.makeText(application.android.context, "Video Saved", Toast.LENGTH_SHORT).show();
            };
        });

        // leave
        var startTimer = (new Date()).getTime();
        while (!complete) {
            if ((new Date()).getTime() - startTimer >= 10000) {
                console.error("Local saving timeout.");
                return;
            }
        }
        frameModule.topmost().goBack();
    }
    // shot is new. Insert.
    else {
        console.log("Insert");

        // get all vars (don't worry if they've been changed).
        var columnList = [];
        columnList.push({ column: "playername", value: viewModel.get("playername") });
        columnList.push({ column: "coachname", value: viewModel.get("coachname") });
        columnList.push({ column: "clubname", value: viewModel.get("clubname") });
        columnList.push({ column: "path", value: viewModel.get("videoPath") });
        columnList.push({ column: "thumbnail", value: viewModel.get("sliderValue") });
        columnList.push({ column: "shottype", value: viewModel.get("shotTypeIndex") + 1 });
        columnList.push({ column: "ratingtype", value: viewModel.get("ratingTypeIndex") + 1 });
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
        var complete = false;
        db.queryExec(query, valList, function (id) {
            complete = true;
            console.log("Saved new shot with id " + id);
            if (page.android) {
                var Toast = android.widget.Toast;
                Toast.makeText(application.android.context, "Video Saved", Toast.LENGTH_SHORT).show();
            }
        });

        // leave
        var startTimer = (new Date()).getTime();
        while (!complete) {
            if ((new Date()).getTime() - startTimer >= 5000) {
                console.error("Local saving timeout.");
                return;
            }
        }
        var navigationOptions = {
            moduleName: "record-shot-page",
            backstackVisible: false
        };
        frameModule.topmost().navigate(navigationOptions);
    }

}
exports.saveLocally = saveLocally;

/**
 * Discards the current shot.
 * @param {any} args
 */
function discard(args) {

    // discard from database
    if (shotId) {
        db.queryExec(
            "DELETE FROM testb WHERE id=?",
            [shotId],
            function (err, id) {
                if (err) {
                    console.error("Error deleting shot with id " + shotId, error);
                    dialogs.alert({
                        title: "Can't delete shot",
                        message: "Error deleting shot with id " + shotId + "\n" + error,
                        okButtonText: "Okay"
                    }).then(function () { });
                    return;
                }
                console.log("Shot with id " + shotId + " deleted.", id);

                // discard video
                _discardVideo();

                // go to source page.
                var navigationOptions = {
                    moduleName: sourcePage,
                    backstackVisible: true
                }
                frameModule.topmost().navigate(navigationOptions);
            });
    } else {
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
function setThumbnail() {
    let slider = page.getViewById("thumbnailSlider");
    thumbnail = slider.value;
    console.log("Updating thumbnail to " + thumbnail);
    let thumbnailVideo = page.getViewById("thumbnailVideo");
    thumbnailVideo.seekToTime(thumbnail);
}
exports.setThumbnail = setThumbnail;

function _getShot(editType, editTypeOptions) {
    if (!editType) {
        return _throwNoContextError();
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
}

function _setShotRecord(editTypeOptions) {

    // no shot id. Added by DBs

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

}

function _setShotLocal(editTypeOptions) {

    // shot id
    shotId = editTypeOptions.id;
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
    });

}

function _setShotSearch(editTypeOptions) {

    // no shot id. Added by DBs

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

function _throwNoContextError() {
    console.error("Cannot edit a Shot without knowing the context.");
    return new Error("Cannot edit a Shot without knowing the context.");
}
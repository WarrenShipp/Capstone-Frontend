var vr = require('nativescript-videorecorder/advanced');
var pages = require("ui/page");
var observable = require("data/observable");
var frameModule = require("ui/frame");
const fileSystemModule = require("tns-core-modules/file-system");
const platformModule = require("tns-core-modules/platform");
var application = require("tns-core-modules/application");

var file;
var viewModel = new observable.Observable();
var cameraView;
var timeout;
var recording;
var disabled;
var timeRecordedMillis;
var timeRecorded = "0:00";  // full text to be shown on front
var messageInterval;
const TIME_MAX = 20000;     // 20 seconds.
const MESSAGE_UPDATE_FREQ = 100;

/**
 * Sets up the recorder.
 * @param {any} args
 */
function loaded(args) {
    viewModel = new observable.Observable();
    page = args.object;
    page.bindingContext = viewModel;

    // need to request permissions for camera to work.
    vr.AdvancedVideoView.requestPermissions();

    // save to var. Easier control and access.
    cameraView = page.getViewById('camera');

    // create a timer object on recording start. This will automatically stop
    // and save recording when the timer is complete.
    cameraView.on('started', args => {
        timeout = setTimeout(_stopRecord, TIME_MAX);
        messageInterval = setInterval(_messageUpdate, MESSAGE_UPDATE_FREQ);
        console.log("timer started");
    });

    // get file so we can pass to shot page.
    cameraView.on('finished', args => {
        console.log("we recorded something" + args.object.get('file'));
        // page.bindingContext.set('selectedVideo', args.object.get('file'));
        file = args.object.get('file');
    });

    // set initial variables
    recording = false;
    disabled = false;
    viewModel.set("recording", recording);
    viewModel.set("disabled", disabled);
    viewModel.set("timeRecorded", timeRecorded);

}
exports.loaded = loaded;

/**
 * Interacts with the button.
 * @param {any} args
 */
function recordVideo(args) {
    if (disabled) {
        return;
    }
    if (!recording) {
        _startRecord();
    }
    else {
        _stopRecord();
    }
    
}
exports.recordVideo = recordVideo;

/**
 * Calls camera=>startRecording().
 */
function _startRecord() {
    recording = true;
    viewModel.set("recording", recording);
    cameraView.startRecording();
    console.log("Recording started.");
}

/**
 * Stops recording, stops timers, gets video and passes it to edit-shot-page.
 */
function _stopRecord() {

    // prevent further action if already disabled
    if (disabled) {
        return;
    }

    // disable button so that it can't be reused.
    disabled = true;
    viewModel.set("disabled", disabled);

    // timer has to be turned off here. Important when stopping manually.
    if (timeout) {
        clearTimeout(timeout);
        console.log("timer stopped");
    }

    // if checking interval, stop
    if (messageInterval) {
        clearInterval(messageInterval);
        console.log("Message stopped");
    }

    // stop video and get file
    cameraView.stopRecording();

    // pass file to shot record page.
    let editType = "record_shot";
    let editTypeOptions = {
        filePath: file,
        datetime: new Date()
    };
    var navigationOptions = {
        moduleName: 'edit-shot-page',
        context: {
            editType: editType,
            editTypeOptions: editTypeOptions
        },
        backstackVisible: false
    };
    frameModule.topmost().navigate(navigationOptions);
}

/**
 * Cancels the recording. Deletes view.
 * @param {any} args
 */
function cancel(args) {

    // prevent further action if already disabled
    if (disabled) {
        return;
    }

    // disable button so that it can't be reused.
    disabled = true;
    viewModel.set("disabled", disabled);

    // timer has to be turned off here. Important when stopping manually.
    if (timeout) {
        clearTimeout(timeout);
        console.log("timer stopped");
    }

    // if checking interval, stop
    if (messageInterval) {
        clearInterval(messageInterval);
        console.log("Message stopped");
    }

    // stop camera and discard, but only if recording
    if (recording) {
        cameraView.stopRecording();

        // we don't keep the video
        _discardVideo();
    }

    // go to home page
    var navigationOptions = {
        moduleName: 'home-page',
        clearHistory: true,
    };
    frameModule.topmost().navigate(navigationOptions);
}
exports.cancel = cancel;

/**
 * Discards a locally saved video.
 */
function _discardVideo() {
    var filepath = file.split("/");
    // console.log(filepath);
    var fileEnd = filepath[6];
    // console.log(fileEnd);
    var fileString = fileEnd.toString();
    // console.log(fileString);
    var myFolder = fileSystemModule.knownFolders.temp();
    myFile = myFolder.getFile(fileString);
    if (myFile) {
        myFile.remove();
        console.log("Removed " + fileString);
    } else {
        console.log("Couldn't remove " + fileString + " because the file does not exist.");
    }
}

/**
 * Updates the time recorded message. Only happens when recording has started.
 */
function _messageUpdate() {
    timeRecordedMillis = cameraView.duration;
    var timeSec = Math.floor(timeRecordedMillis);
    var timeMin = Math.floor(timeSec / 60);
    timeSec -= timeMin * 60;
    var timeStr = timeMin.toString() + ":" +
        (timeSec < 10 ? "0" + timeSec.toString() : timeSec.toString());
    var maxSec = Math.floor(TIME_MAX / 1000);
    var maxMin = Math.floor(maxSec / 60);
    maxSec -= maxMin * 60;
    var maxStr = maxMin.toString() + ":" +
        (maxSec < 10 ? "0" + maxSec.toString() : maxSec.toString());
    timeRecorded = timeStr + "/" + maxStr;
    viewModel.set("timeRecorded", timeRecorded);
    // console.log("check recording!");
}

/**
 * Call cancel functionality.
 * @param {any} args
 */
function backEvent(args) {
    cancel(args);
}
exports.backEvent = backEvent;
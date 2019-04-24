var vr = require('nativescript-videorecorder/advanced');
var pages = require("ui/page");
var observable = require("data/observable");
var frameModule = require("ui/frame");
var file;
var viewModel = new observable.Observable();
var cameraView;
var timeout;
const TIME_MAX = 5000;

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
        console.log("timer started");
    });

    // get file so we can pass to shot page.
    cameraView.on('finished', args => {
        console.log("we recorded something" + args.object.get('file'));
        page.bindingContext.set('selectedVideo', args.object.get('file'));
        file = args.object.get('file');
    });

}
exports.loaded = loaded;

/**
 * Interacts with the button.
 * @param {any} args
 */
function recordVideo(args) {
    if (viewModel.get("disabled")) {
        return;
    }
    if (viewModel.get("recording")) {
        _startRecord();
    }
    else {
        _stopRecord();
    }
    
}
exports.recordVideo = recordVideo;

function _startRecord() {
    viewModel.set("recording", !viewModel.get("recording"));
    cameraView.startRecording();
    console.log("Recording started.");
}

function _stopRecord() {

    // disable button so that it can't be reused.
    viewModel.set("disabled", true);

    // timer has to be turned off here. Important when stopping manually.
    if (timeout) {
        clearTimeout(timeout);
        console.log("timer stopped");
    }

    cameraView.stopRecording();
    console.log("file passing " + file);

    // pass file to shot record page.
    var navigationOptions = {
        moduleName: 'viewvideo-page',
        context: {
            param1: file
        },
        backstackVisible: false
    };
    frameModule.topmost().navigate(navigationOptions);
}
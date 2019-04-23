var vr = require('nativescript-videorecorder');
var pages = require("ui/page");
var observable = require("data/observable");
var frameModule =require("ui/frame");
var file;
var viewModel = new observable.Observable();

var vr = require('nativescript-videorecorder');

var options = {
    saveToGallery: true,
    duration: 20,
    format: 'mp4',
    size: 10,
    hd: true,
    explanation: 'Why do i need this permission'
}

var videorecorder = new vr.VideoRecorder(options);

exports.loaded = function(args){
    viewModel = new observable.Observable();

    viewModel.set("showDetails", true);
    page = args.object;


    page.bindingContext = viewModel;
}

exports.toggle = function() {
	viewModel.set("showDetails", !viewModel.get("showDetails"));
}

function recordVideo() {
    if(viewModel.get("showDetails")){
        viewModel.set("showDetails", !viewModel.get("showDetails"));
    var cameraView = page.getViewById('camera');
    cameraView.startRecording();
    cameraView.on('finished', function (args) {
        console.log("we recorded something" + args.object.get('file'));
        page.bindingContext.set('selectedVideo', args.object.get('file'));
        file = args.object.get('file');
    });

    console.log("hihi");
    
}
else{
    var camera = page.getViewById('camera');
    camera.stopRecording();
    console.log("byebye");
    console.log("file passing " + file);
    var navigationOptions={
        moduleName:'viewvideo-page',
        context:{param1: file
                },
                backstackVisible: false
    }

    frameModule.topmost().navigate(navigationOptions);
}
    
}
exports.recordVideo = recordVideo;

// function stopRecord() {
//     var camera = page.getViewById('camera');
//     camera.stopRecording();
//     console.log("byebye");

//     var navigationOptions={
//         moduleName:'viewvideo-page',
//         context:{param1: file
//                 }
//     }
    
//     frameModule.topmost().navigate(navigationOptions);

// }
// exports.stopRecord = stopRecord;

var observable = require("data/observable");
var viewModel = new observable.Observable();
const fileSystemModule = require("tns-core-modules/file-system");
var appSet = require("application-settings");
var frameModule =require("ui/frame");
var Sqlite = require("nativescript-sqlite");
var application = require("application");

//var createViewModel = require("./viewvideo-view-model").createViewModel;
var Observable = require("data/observable").Observable;
var viewModel = new Observable();
var view = require("ui/core/view");
var dropdown = require("nativescript-drop-down");
var firstname;
var shot;
var path;
var shotIndex;
var shotType;
var rating;
//var dd = new dropdown.DropDown();

function onNavigatingTo(args) {
    page = args.object;
    
    shotType = new dropdown.ValueList({display: "Straight Drive"}, {display: "Cover Drive"}, {display: "Square Cut"},
    {display: "Late Cut"}, {display: "Leg Glance"}, {display: "Hook"}, {display: "Pull"}, {display: "Drive through square leg"},
    {display: "On drive"}, {display: "Off Drive"});

    ratingType = new dropdown.ValueList({display: "Perfect"}, {display: "Good"}, {display: "Off Balanced"},
    {display: "Off Position"}, {display: "Played Late"}, {display: "Played Early"});

    dd = page.getViewById("dd");
    aa = page.getViewById("aa");

    
    viewModel.set("selectedIndex1", null);
    viewModel.set("ratingType", ratingType);

    viewModel.set("selectedIndex", null);
    viewModel.set("shotType", shotType);
    
    var gotData=page.navigationContext;
    console.log("this is it" + gotData.path);
    path = gotData.path;
    id = gotData.id;
    // shottype = gotData.shottype;
    // rating = gotData.rating;
    // date = gotData.date;
    viewModel.set('selectedVideo', path);
    viewModel.set("name", id);
    // viewModel.set("shottype", shottype);
    // viewModel.set("rating", rating);
    // viewModel.set("date", date);

    page.bindingContext = viewModel;

}
exports.onNavigatingTo = onNavigatingTo;

exports.discard = function() {
    //path.remove();
    //need to figure out how to discard from local storage
    var filepath = path.split("/");
    file = filepath[6];
    fileString = filename.toString();
    console.log(fileString);
    myFolder = fileSystemModule.knownFolders.temp();
    myFile = myFolder.getFile(fileString);
    myFile.remove();
    var navigationOptions={
        moduleName:'home-page'
    }

    frameModule.topmost().navigate(navigationOptions);

}

function dropDownSelectedIndexChanged(args) {
    console.log("Drop Down selected index changed from " + args.oldIndex + " to " + args.newIndex + ". New value is '" + viewModel.get("shotType").getDisplay(args.newIndex) + "'");
    shot = viewModel.get("shotType").getDisplay(args.newIndex);
    console.log(shot);
}
exports.dropDownSelectedIndexChanged = dropDownSelectedIndexChanged;

function second(args) {
    console.log("Drop Down selected index changed from " + args.oldIndex + " to " + args.newIndex + ". New value is '" + viewModel.get("ratingType").getDisplay(args.newIndex) + "'");
    rating = viewModel.get("ratingType").getDisplay(args.newIndex);
    console.log(rating);
}
exports.second = second;

// function saveVideo(){
// console.log(path);
// const folderName = "Local";
// const fileName = "localfiles.txt";

// const fileTextContent = path;

// let documents = fileSystemModule.knownFolders.temp();
// const folder = documents.getFolder(folderName);
// const file = folder.getFile(fileName);

// file.readText()
//     .then((res) => {
//         console.log("hello:");
//         console.log(res);
//         file.writeText(res + " " + fileTextContent);
//     }).catch((err) => {
//         console.log(err.stack);
//     });

// appSet.setString("files", appSet.getString("files") + " " + path);
// console.log(appSet.getString("files"));



// }
// exports.saveVideo = saveVideo;

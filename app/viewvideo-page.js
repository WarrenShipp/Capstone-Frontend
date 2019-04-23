var observable = require("data/observable");
var viewModel = new observable.Observable();
const fileSystemModule = require("tns-core-modules/file-system");
var appSet = require("application-settings");

var Sqlite = require("nativescript-sqlite");

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

    //viewModel.set("shotType", shotType);
    viewModel.set("selectedIndex", null);
    viewModel.set("shotType", shotType);
    dd.items = shotType;
    var date = new Date();
    var readableDate = date.toDateString();
    viewModel.set("date", readableDate)
    console.log("the date" + readableDate);
    
    // shotType = [
    //     "Straight Drive",
    //     "Cover Drive",
    //     "Square Cut",
    //     "Late Cut",
    //     "Leg Glance",
    //     "Hook",
    //     "Pull",
    //     "Drive through square leg",
    //     "On drive",
    //     "Off drive"
    //     ];   

    
    //dd = page.getViewById("dd");
    var gotData=page.navigationContext;
    console.log("this is it" + gotData.param1);
    path = gotData.param1;
    viewModel.set('selectedVideo', path);
    // viewModel.set("shotTypes", shotType);

    (new Sqlite("my.db")).then(db => {
        db.execSQL("CREATE TABLE IF NOT EXISTS testa (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT, name TEXT, shottype TEXT, ratingtype TEXT, date TEXT)").then(id => {
            console.log("table created");
            
        }, error => {
            console.log("CREATE TABLE ERROR", error);
        });
    }, error => {
        console.log("OPEN DB ERROR", error);
    });
    page.bindingContext = viewModel;

}
exports.onNavigatingTo = onNavigatingTo;

exports.insert = function(args) {
    page = args.object;
    console.log("argstest " + args.newIndex);
    console.log("pathway" + path);
    firstname = viewModel.get("playername");
    console.log("dd value: "+ shot);
    var dbdate = new Date();
    (new Sqlite("my.db")).then(db => {
    db.execSQL("INSERT INTO testa (path, name, shottype, ratingtype, date) VALUES (?, ?, ?, ?, ?)", [path, firstname, shot, rating, dbdate]).then(id => {
        console.log("INSERT RESULT", id);
    }, error => {
        console.log("INSERT ERROR", error);
    });
});
}

exports.select = function(args) {
    var selectedValue = shotType.getValue(dd.selectedIndex);
    console.log(selectedValue);
    (new Sqlite("my.db")).then(db => {
    db.all("SELECT * FROM testa").then(rows => {
        for(var row in rows) {
            console.log("RESULT", rows[row]);
        }
    }, error => {
        console.log("SELECT ERROR", error);
    });
});
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

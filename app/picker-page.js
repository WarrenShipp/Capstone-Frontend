var imagepicker = require("nativescript-imagepicker");
var observable = require("data/observable");


 // use "multiple" for multiple selection

exports.pageLoaded = function(args) {
    viewModel = new observable.Observable();
    page = args.object;
    page.bindingContext = viewModel;

}

exports.Request = function(){
    console.log("test");
    var context = imagepicker.create({ mode: "single" });
    context
    .authorize()
    .then(function() {
        return context.present();
    })
    .then(function(selection) {
        selection.forEach(function(selected) {
            // process the selected image
            console.log("Selection done: " + JSON.stringify(selection));
        });
        list.items = selection;
    }).catch(function (e) {
        // process error
    });
}
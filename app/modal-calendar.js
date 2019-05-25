var observable = require("data/observable").Observable;
var viewModel = new observable();

var type;
var typeName;
var maxDate;
var minDate;
var currentDate;

/**
 * Sets up binding context
 * @param {any} args
 */
function onShownModally(args) {
    var temppage = args.object;
    temppage.bindingContext = viewModel;

    // set vars
    type = args.context.type;
    typeName = args.context.typeName;
    maxDate = args.context.maxDate ? args.context.maxDate : (new Date()).toISOString();
    minDate = args.context.minDate ? args.context.minDate : null;
    currentDate = args.context.currentDate ? args.context.currentDate : null;
    viewModel.set("typeName", typeName);
    viewModel.set("maxDate", maxDate);
    viewModel.set("minDate", minDate);
    viewModel.set("currentDate", currentDate);

}
exports.onShownModally = onShownModally;

/**
 * Selects a date and closes the modal.
 * @param {any} args
 */
function onDateSelected(args) {
    console.log("date: " + args.date);
    var offset = args.date.getTimezoneOffset();
    console.log(offset);
    var yourDate = new Date(args.date.getTime() - (offset * 60 * 1000));
    // console.log(yourDate.toISOString());
    // yourDate = yourDate.toISOString().split('T')[0];

    // compare dates with max and min to ensure that we are within the correct
    // bounds
    if (maxDate && yourDate > maxDate) {
        return;
    }
    if (minDate && yourDate < minDate) {
        return;
    }

    // send 
    var context = {
        type: type,
        date: yourDate
    };
    args.object.closeModal(context);
}
exports.onDateSelected = onDateSelected;

/**
 * Employs the deselect button.
 * @param {any} args
 */
function deselect(args) {
    // send 
    var context = {
        type: type,
        date: null
    };
    args.object.closeModal(context);

}
exports.deselect = deselect;

/**
 * Deselects a date. Same functionality as the deselect button.
 * @param {any} args
 */
function onDateDeselected(args) {
    console.log(args);
}
exports.onDateDeselected = onDateDeselected;
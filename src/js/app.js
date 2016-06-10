define([
    "jquery",
    "./cats"
], function ($, cats) {

    require("css/style.css");
    require("module_simple/js/start");
    require("module_handlebars/js/start");
    require("module_i18n/js/start");
    require("module_json/js/start");

    $('<h1>Cats</h1>').appendTo('body');
    var ul = $('<ul></ul>').appendTo('body');

    for (var i = 0; i < cats.length; i++) {
        $('<li></li>').text(cats[i]).appendTo(ul);
    }

    $('<p>Environment: ' + ENVIRONMENT + '</p>').appendTo('body');
    $('<p>Version: ' + VERSION + '</p>').appendTo('body');
    $('<p>Language: ' + LANG+ '</p>').appendTo('body');

});

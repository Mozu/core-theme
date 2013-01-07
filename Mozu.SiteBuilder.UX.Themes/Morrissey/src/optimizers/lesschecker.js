var fs = require('fs'),
    Q = require('q'),
    Lyrically = require('../lyrically');

module.exports = function () {
    var self = this,
        deferred = Q.defer();

    Lyrically.whine("Less error not yet implemented.");

    // first make a copy in inheritedTheme of the stylesheet dir
    // then grab theme settings.
    // for each stylesheet
    //  settings is array of settingsregex matches on stylesheet text
    //  for each setting
    //     if settingdefault
    //       then replace setting in stylesheet text with that default
    //     else if settingname in themesettings and settingname has default
    //       then replace setting in stylesheet text with that default
    //     else
    //       replace setting in stylesheet text with nothing
    // run less against all stylesheets in root

    deferred.resolve();

    return deferred.promise;

};

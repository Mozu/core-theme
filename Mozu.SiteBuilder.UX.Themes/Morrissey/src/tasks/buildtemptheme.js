var grunt = require('grunt'),
    async = require('async'),
    FSUtils = require('../fsutils'),
    path = require('path'),
    Theme = require('../theme'),
    Lyrically = require('../lyrically');

var THEME_CONFIG_FILENAME = "theme.xml";

module.exports = function () {
    var self = require('../optimizer').current,
        failed = function (e) {
            Lyrically.lament(e.message, false);
            Lyrically.lament("Building temporary theme failed.")
        },
        tmpThemeName = self.theme.name + "TMP" + new Date().getTime(),
        tmpDirPath = path.resolve(path.join(self.program.themesDir, tmpThemeName));
    if (!self.program.inheritance || !self.theme.getBaseTheme()) {
        Lyrically.note("No inheritance, no temp theme necessary.");
        return true;
    }
    if (self.program.verbose) Lyrically.note("Building temporary theme.");
    try {
        self.theme.getAncestry().forEach(function (ancestor) {
            grunt.file.recurse(ancestor.baseDir, function (abspath, rootdir, subdir, filename) {
                grunt.file.copy(abspath, path.resolve(tmpDirPath, subdir || "", filename));
            });
        });
        self.tempTheme = new Theme(tmpThemeName, self.program);
        if (self.program.verbose) Lyrically.admit("Temporary theme built.");
        return true;
    } catch (e) {
        failed(e);
        return false;
    }
};
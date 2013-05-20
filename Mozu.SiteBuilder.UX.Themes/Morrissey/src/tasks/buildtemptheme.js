var grunt = require('grunt'),
    Q = require('q'),
    FSUtils = require('../fsutils'),
    path = require('path'),
    Lyrically = require('../lyrically');

var THEME_CONFIG_FILENAME = "theme.xml";

var copyRecursive = Q.nfbind(FSUtils.copyRecursive);

module.exports = function () {
    var self = require('../optimizer').current,
        done = this.async(),
        failed = function (e) {
            Lyrically.lament(e.message, false);
            Lyrically.lament("Building temporary theme failed.")
            done(false);
        },
        tmpThemeName = self.theme.name + "TMP" + new Date().getTime(),
        tmpDirPath = path.resolve(path.join(self.program.themesDir, tmpThemeName));
    if (!self.program.inheritance || !self.theme.getBaseTheme()) {
        Lyrically.note("No inheritance, no temp theme necessary.");
        done(true);
        return;
    }
    if (self.program.verbose) Lyrically.note("Building temporary theme.");
    try {
        self.theme.getAncestry().reduce(function (soFar, ancestor) {
            return soFar.then(function () {
                var c = copyRecursive(ancestor.baseDir, tmpDirPath);
                c.catch(function (e) {
                    failed(e);
                });
                return c;
            });
        }, Q.resolve(true)).done(function () {
            self.tempTheme = new Theme(tmpThemeName, self.program);
            if (self.program.verbose) Lyrically.admit("Temporary theme built.");
            done(true);
        });

    } catch (e) {
        failed(e);
    }
};
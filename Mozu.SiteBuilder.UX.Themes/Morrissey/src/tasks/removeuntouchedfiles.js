var grunt = require('grunt'),
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    walk = require("walk").walk,
    Lyrically = require('../lyrically');

var TEMPLATE_EXTENSION = ".vol",
    TEMPLATE_ROOT_PREFIX = "_";

module.exports = function () {

    var done = this.async(),
        self = require('../optimizer').current,
        theme = self.theme,
        baseTheme = theme.getBaseTheme();

    if (!baseTheme || !self.program.inheritance) {
        Lyrically.lament("This theme has no base theme or --no-inheritance was specified, therefore there are no inherited files to remove.");
        done(false);
    } else {

        var walker = walk(theme.baseDir, { followLinks: false });
        walker.on("file", function (root, stat, next) {
            var prefixedFilePath = false;
            var filePath = path.relative(theme.baseDir, path.join(root, stat.name)),
                fullPath = path.resolve(theme.baseDir, filePath);
            if (fullPath == theme.getPath("settings") || fullPath == theme.getPath("themeConfig")) return next();
            if (path.extname(filePath) === TEMPLATE_EXTENSION) prefixedFilePath = path.relative(theme.baseDir, path.join(root, TEMPLATE_ROOT_PREFIX + stat.name));
            var thisFileContents = theme.getInheritedFileContentsSync(filePath),
                baseFileContents = baseTheme.getInheritedFileContentsSync(filePath);
            if ((thisFileContents === baseFileContents) || (!baseFileContents && prefixedFilePath && thisFileContents === baseTheme.getInheritedFileContentsSync(prefixedFilePath))) {
                fs.unlinkSync(fullPath);
                if (self.program.verbose) console.log("deleting " + fullPath);
            }
            next();
        });
       
        walker.on('end', function () {

            var secondWalker = walk(theme.baseDir, { followLinks: false });
            secondWalker.on('directory', function (root, stat, next) {
                var dirPath = path.resolve(root, stat.name);
                if (fs.readdirSync(dirPath).length === 0) {
                    fs.rmdirSync(dirPath);
                }
                next();
            });

            secondWalker.on('end', function () {
Lyrically.admit("All files unchanged from the base theme '" + baseTheme.name + "' have been removed from " + theme.name + ".");
            done(true);
            });
        });
        walker.on("errors", function (root, nodeStatsArray, next) {
            grunt.log.subhead("File removal errors:");
            nodeStatsArray.forEach(function (err) {
                grunt.log.errorlns([err.error.message])
            });
            done(false);
        });
    }
};
var fs = require('fs'),
    grunt = require('grunt'),
	requirejs = require('requirejs'),
	Lyrically = require('../lyrically');


requirejs.define('node/print', [], function () {
    return function print(msg) {
        if (msg.substring(0, 5) === 'Error') {
            grunt.log.errorlns(msg);
            grunt.fail.warn('RequireJS failed.');
        } else {
            grunt.log.oklns(msg);
        }
    };
});

require('../plugins/text');
require('../plugins/shim');
require('../plugins/i18n');


module.exports = function() {
    var self = require('../optimizer').current,
        done = this.async(),
        workingTheme = self.tempTheme || self.theme;

    Lyrically.note("Building JavaScript with r.js.");

    var buildConfig = workingTheme.getBuildConfig();

    buildConfig.baseUrl = workingTheme.getPath('scripts');
    buildConfig.dir = self.theme.getPath('builtScripts');
    buildConfig.logLevel = self.program.verbose ? 0 : 2;

    try {
        requirejs.optimize(buildConfig, function () {
            done(true);
        });
    } catch (e) {
        Lyrically.lament(e);
        Lyrically.lament("JavaScript compilation failed!");
        done(false);
    }
};
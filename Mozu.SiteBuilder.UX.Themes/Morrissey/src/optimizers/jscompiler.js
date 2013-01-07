var fs = require('fs'),
	requirejs = require('requirejs'),
	Q = require('q'),
	Lyrically = require('../lyrically');


module.exports = function() {
    var self = this,
        deferred = Q.defer();
    
    Lyrically.note("Building JavaScript with r.js.");

    var buildConfig = this.inheritedTheme.getBuildConfig();

    buildConfig.baseUrl = this.inheritedTheme.getPath('scripts');
    buildConfig.dir = this.theme.getPath('builtScripts');
    buildConfig.logLevel = this.program.verbose ? 0 : 2;

    try {
        requirejs.optimize(buildConfig, function () {
            deferred.resolve();
        });
    } catch (e) {
        Lyrically.lament("JavaScript compilation failed!");
        deferred.reject(e);
    }

    return deferred.promise;
};
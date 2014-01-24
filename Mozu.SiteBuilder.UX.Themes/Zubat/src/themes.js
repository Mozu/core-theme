var fs = require('fs'),
    path = require('path'),
    constants = require('./constants');

var Theme = function (conf) {
    for (var i in conf) {
        if (conf.hasOwnProperty(i)) {
            this[i] = conf[i];
        }
    }
};
Theme.prototype.getBaseDir = function () {
    return this.baseDir;
};
Theme.prototype.getScriptsDir = function () {
    return path.resolve(this.getBaseDir(), "scripts");
};
Theme.prototype.getCompiledScriptsDir = function () {
    return path.resolve(this.getBaseDir(), "compiled/scripts");
};
Theme.prototype.getBuildConfig = function (cb) {
    var self = this;
    if (this.buildConfig) {
        process.nextTick(function() {
            cb(this.buildConfig);
        });
    }
    this.program.log(2, constants.LOG_SEV_INFO, "Getting build config for " + this.name);
    var self = this;
    fs.readFile(path.resolve(this.getBaseDir(), "build.js"), { encoding: 'utf-8' }, function (err, data) {
        if (err) {
            this.program.log(1, constants.LOG_SEV_ERROR, "Error getting build.js from " + self.name);
            return cb(err);
        }
        try {
            self.buildConfig = eval(data);
        } catch (e) {
            this.program.log(1, constants.LOG_SEV_ERROR, "Error parsing build.js from " + self.name);
            return cb(e);
        }
        cb(null, self.buildConfig);
    });
};

module.exports = {
    // requires absolute path
    getThemeFromPath: function (dir, program, cb) {
        var configPath = path.resolve(dir, "theme.json");
        program.log(2, constants.LOG_SEV_INFO, "Attempting to read " + configPath);
        fs.readFile(configPath, { encoding: 'utf-8' }, function (err, data) {
            if (err) {
                program.log(1, constants.LOG_SEV_ERROR, "Error reading " + configPath);
                return cb(err);
            }
            var config;
            try {
                config = eval('('+data+')');
            } catch (e) {
                program.log(1, constants.LOG_SEV_ERROR, "Error parsing " + configPath + ".");
                program.log(2, constants.LOG_SEV_ERROR, "\n\n" + data);
                return cb(e);
            }
            var themeConf = config.about;
            if (!themeConf) {
                var errorStr = "No about section found in " + configPath;
                program.log(1, constants.LOG_SEV_ERROR, errorStr);
                return cb(new Error(errorStr));
            }
            themeConf.baseDir = dir;
            themeConf.program = program;
            cb(null, new Theme(themeConf));
        });
    },
    getThemeFromId: function(id, program, cb) {
        program.log(0, constants.LOG_SEV_ERROR, "Theme inheritance without manual ancestry is not yet supported. Please specify manual ancestry at the command line using -m.");
        process.exit(1);
    }
}
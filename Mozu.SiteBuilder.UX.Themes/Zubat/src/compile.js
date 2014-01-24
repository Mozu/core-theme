var requirejs = require('mozu-require-compiler'),
    constants = require('./constants');



module.exports = function (theme, program, cb) {

    requirejs.define('node/print', [], function () {
        return function (msg) {
            if (msg.substring(0, 5) === 'Error') {
                program.log(1, constants.LOG_SEV_ERROR, msg);
            } else {
                program.log(2, constants.LOG_SEV_INFO, msg);
            }
        };
    });
    theme.getBuildConfig(function (err, buildConfig) {
        if (err) return cb(err);
        buildConfig.baseUrl = buildConfig.baseUrl || theme.getScriptsDir();
        buildConfig.dir = program.dest;
        buildConfig.logLevel = program.logLevel === 2 ? 0 : 1;
        program.log(1, constants.LOG_SEV_INFO, "Compiling JS resources using optimizer.");
        try {
            requirejs.optimize(buildConfig, function() {
                program.log(1, constants.LOG_SEV_SUCCESS, "JS compilation complete!");
                cb(null, true);
            }, function (err) {
                program.log(1, constants.LOG_SEV_ERROR, "Error compiling JS resources.");
                cb(err);
            });
        } catch (e) {
            program.log(1, constants.LOG_SEV_ERROR, "Error compiling JS resources.");
            cb(e);
        }
    });
}
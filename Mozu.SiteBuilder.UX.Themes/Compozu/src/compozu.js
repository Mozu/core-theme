var path = require('path'),
    events = require('events'),
    async = require('async'),
    ncp = require('ncp').ncp,
    constants = require('./constants'),
    themes = require('./themes'),
    compile = require('./compile');

ncp.limit = 16;

function createTempInheritedTheme(theme, program, finalCb) {
    var tmpThemeName = theme.name + "_tmp" + new Date().getTime(),
        tmpDirPath = path.resolve(path.join(program.workingDir, tmpThemeName)),
        ancestry = [];

    if (program.manualAncestry) {
        async.map(program.manualAncestry, function (themePath, continuation) {
            themes.getThemeFromPath(path.resolve(themePath), program, continuation);
        }, function (err, results) {
            if (err) {
                program.log(1, constants.LOG_SEV_ERROR, "Error occurred while building manual ancestry tree.");
                throw err;
            }
            ancestry = results.reverse();
            createFromAncestry();
        });
    } else {
        traverseThemeTree(null, theme);
    }

    function traverseThemeTree(err, theme) {
        if (err) {
            program.log(1, constants.LOG_SEV_ERROR, "Error traversing theme tree.");
            throw err;
        }
        program.log(2, constants.LOG_SEV_INFO, "Added " + theme.name + " to ancestry stack.");
        ancestry.unshift(theme);
        if (!theme.extends) {
            program.log(2, constants.LOG_SEV_SUCCESS, "Successfully created theme ancestry stack of length " + ancestry.length + ".");
            return createFromAncestry();
        }
        themes.getThemeFromId(theme.extends, program, traverseThemeTree);
    }

    function createFromAncestry() {
        async.eachSeries(ancestry, function (ancestor, continuation) {
            var sourceDir = ancestor.getBaseDir();
            program.log(2, constants.LOG_SEV_INFO, "Beginning recursive copy of " + sourceDir + " to " + tmpDirPath + ".");
            ncp(sourceDir, tmpDirPath, continuation);
        }, function(err) {
            if (err) {
                program.log(1, constants.LOG_SEV_ERROR, "Error occurred while copying files.");
                throw err;
            }
            themes.getThemeFromPath(tmpDirPath, program, finalCb);
        });
    }
}


function createLogger(prog) {
    prog.logEventBus = prog.logEventBus || new events.EventEmitter();
    prog.log = prog.log || function (level, sev, str) {
        if (prog.logLevel >= level) {
            prog.logEventBus.emit('log', str, sev, level);
        }
    }
}

module.exports = function (themePath, program, cb) {
    program = program || {
        logLevel: 1
    };
    createLogger(program);
    process.nextTick(function () {
        program.log(1, constants.LOG_SEV_INFO, "Beginning compilation of " + themePath);
        program.workingDir = path.resolve(themePath, '..');
        themes.getThemeFromPath(path.resolve(themePath), program, function (err, thisTheme) {
            if (err) {
                program.log(1, constants.LOG_SEV_ERROR, "Error getting theme " + themePath);
                throw err;
            }
            program.dest = program.dest || thisTheme.getCompiledScriptsDir();
            if (thisTheme.extends) {
                program.log(2, constants.LOG_SEV_INFO, "Theme " + thisTheme.name + " extends " + thisTheme.extends + ". Creating inherited theme.");
                createTempInheritedTheme(thisTheme, program, function (err, inheritedTheme) {
                    if (err) {
                        program.log(1, constants.LOG_SEV_ERROR, "Error creating temp inherited theme.");
                        throw err;
                    }
                    compile(inheritedTheme, program, cb);
                });
            } else {
                compile(thisTheme, program, cb);
            }
        });
    });
    return program.logEventBus;
};
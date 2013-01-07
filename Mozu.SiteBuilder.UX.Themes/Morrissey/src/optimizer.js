var util = require('util'),
    fs = require('fs'),
    path = require('path'),
    events = require('events'),
    Q = require("q"),
    FSUtils = require('./fsutils'),
    Theme = require('./theme'),
    Lyrically = require('./lyrically'),

    optimizers = {
        buildJs: require('./optimizers/jscompiler'),
        autogenerateThemeSettings: require('./optimizers/themesettingsgenerator'),
        checkLessErrors: require('./optimizers/lesschecker')
    };

var Optimizer = function (theme, program) {

    events.EventEmitter.call(this);

    this.theme = theme;
    this.program = program;
    this.buildTasks = [];
    this.prepTasks = [];
    this.taskDict = {};

    // marshal resources, since buildJs and others need this

    if (program.inheritance) {
        this.prepTasks.push(this.buildInheritedTheme());
    } else {
        this.inheritedTheme = this.theme;
    }

    if (program.removeUntouchedFiles) {
        this.prepTasks.push(this.removeUntouchedFiles());
    }
};

util.inherits(Optimizer, events.EventEmitter);

Optimizer.prototype.removeUntouchedFiles = function() {
    var self = this,
        deferred = Q.defer();

    if (!this.theme.baseTheme || !this.program.inheritance) {
        deferred.reject("This theme has no base theme or --no-inheritance was specified, therefore there are no inherited files to remove.");
    } else {
        var walker = FSUtils.walkDir(self.theme.baseDir, { followLinks: false });
        walker.on("file", function (root, stat, next) {
            var filePath = path.relative(self.theme.baseDir, path.join(root, stat.name)),
                fullPath = path.resolve(self.theme.baseDir, filePath);
            if (fullPath == self.theme.getPath("settings") || fullPath == self.theme.getPath("themeConfig")) return next();
            if (self.theme.getInheritedFileContentsSync(filePath) === self.theme.baseTheme.getInheritedFileContentsSync(filePath)) {
                fs.unlinkSync(fullPath);
                if (self.program.verbose) console.log("deleting " + fullPath);
            }
            next();
        });
        walker.on('end', function () {
            deferred.resolve("All files unchanged from the base theme '" + self.theme.baseTheme.name + "' have been removed from " + self.theme.name + ".");
        });
    }
    return deferred.promise;

};

Optimizer.prototype.buildInheritedTheme = function() {
    var deferred = Q.defer(),
        self = this;
    Lyrically.note("Building inherited theme.");
    var tmpThemeName = this.theme.name + "TMP" + new Date().getTime(),
        tmpDirPath = path.resolve(path.join(this.program.themesDir, tmpThemeName));
    try {
        var copyRecursive = Q.nfbind(FSUtils.copyRecursive);

        this.theme.getAncestry().reduce(function (soFar, ancestor) {
            return soFar.then(function () {
                return copyRecursive(ancestor.baseDir, tmpDirPath)
            });
        }, Q.resolve(true)).then(function () {
            self.inheritedTheme = new Theme(tmpThemeName, self.program);
            self.inheritedThemeBuilt = true;
            deferred.resolve();
        })
        .done();

    } catch (e) {
        deferred.reject(e);
    }
    return deferred.promise;
};

Optimizer.prototype.run = function () {
    var self = this;
    return Q.spread(this.prepTasks, function () {
        // arguments is the resolved promises, for future reference
        
        Array.prototype.slice.call(arguments).forEach(function(arg){
            if (typeof arg === "string") Lyrically.admit(arg);
        });
            
        //now fill build tasks
        for (var opt in optimizers) {
            if (self.program[opt]) {
                self.taskDict[opt] = optimizers[opt].apply(self);
                self.buildTasks.push(self.taskDict[opt]);
            }
        }
        
        Q.all(self.buildTasks).then(function () {
            self.cleanup().then(function () {
                self.emit('success');
            }, function () {
                Lyrically.whine("The theme built successfully, but cleanup failed. You may have to manually delete a temporary theme directory.");
                self.emit('success', "Warning: The theme built successfully, but cleanup failed.");
            });
        }, function (e) {
            self.cleanup().then(function () {
                self.emit('failure', e);
            });
        });


    }).fail(function (failedTask) {
        self.cleanup().fail(function () {
            Lyrically.whine("Build cleanup failed. You may have to manually delete a temporary theme directory.");
        });
        self.emit('failure', failedTask);
    });
};

Optimizer.prototype.cleanup = function () {
    var self = this,
        deferred = Q.defer();
    
    if (this.program.verbose) Lyrically.note('Deleting temporary files.');
    if (this.inheritedThemeBuilt) {
        FSUtils.removeRecursive(this.inheritedTheme.baseDir, function (errors) {
            if (errors) {
                deferred.reject(errors);
            } else {
                deferred.resolve();
            }
        });
    } else {
        deferred.resolve();
    }

    return deferred.promise;
};

module.exports = Optimizer;
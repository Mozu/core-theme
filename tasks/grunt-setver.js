'use strict';
module.exports = function (grunt) {
    grunt.registerMultiTask('setver', 'Update all version information.', function () {
        var childProcess = require('child_process'),
            fs = require('fs'),
            path = require('path'),
            async = require('async'),
            done = this.async(),
            self = this,

            applyVersion = function (newver) {
                var next = function (cb) {
                    process.nextTick(function () {
                        cb(null, true);
                    });
                },
                tasks = {
                    packagejson: function (cb) {
                        var pkg = grunt.file.readJSON('package.json');
                        pkg.version = newver;
                        grunt.file.write('package.json', JSON.stringify(pkg, null, 2));
                        grunt.log.ok('Updated package.json version to ' + newver);
                        next(cb);
                    },
                    themejson: function (cb) {
                        var themejson = grunt.file.readJSON('theme.json');
                        themejson.about.version = newver;
                        grunt.file.write('theme.json', JSON.stringify(themejson, null, 2));
                        grunt.log.ok('Updated theme.json version to ' + newver);
                        next(cb);
                    },
                    readmemd: function (cb) {
                        var readmetxt = grunt.file.read('README.md');
                        grunt.file.write('README.md', readmetxt.replace(/\nVersion:.*\n/, "\nVersion: " + newver + "\n"));
                        grunt.log.ok('Updated readme.md version to ' + newver);
                        next(cb);
                    },
                    thumbnail: function (cb) {
                        var child = childProcess.spawn('convert', [
                                  self.data.thumbnail.src,
                                  '-gravity', self.data.thumbnail.gravity || 'southeast',
                                  //'-font',self.data.thumbnail.font || 'AvantGarde-Demi',
                                  '-pointsize', self.data.thumbnail.pointsize || 18,
                                  '-fill', self.data.thumbnail.color || 'black',
                                  '-annotate', '0x0+10+10',
                                  newver, self.data.thumbnail.dest]);
                        child.stderr.on('data', function (data) {
                            grunt.log.error(data);
                            cb(data);
                        });

                        child.on('close', function (code) {
                            if (code) {
                                grunt.log.error('Thumbnail update failed.');
                                cb(code);
                            } else {
                                grunt.log.ok('Updated thumbnail version to ' + newver);
                                cb(null, true);
                            }
                        });
                    },
                    filenames: function (cb) {
                        if (!Array.isArray(self.data.filenames)) {
                            var err = 'Please supply an array of filenames to rename with the version, instead of "' + filenames + '".';
                            grunt.log.error(err);
                            return cb(err);
                        }
                        var suffix = '-' + newver;
                        self.data.filenames.forEach(function (filename) {
                            var ext = path.extname(filename),
                              newName = path.basename(filename, ext) + suffix + ext;
                            console.log(newName);
                            fs.renameSync(filename, newName);
                            grunt.log.ok('Updated ' + filename + ' to ' + newName);
                        });
                        next(cb);
                    }
                };

                var toRun = {};
                for (var task in tasks) {
                    if (self.data[task]) {
                        toRun[task] = tasks[task];
                    }
                }

                grunt.log.writeln('Updating everything to version ' + newver);
                async.parallel(toRun, function (err, allDone) {
                    if (err) {
                        grunt.fail.fatal(err);
                    } else {
                        done(true);
                    }
                });
            };

        var manualVer = grunt.option('to');

        if (manualVer) {
            applyVersion(manualVer);
            done(true);
        } else {
            childProcess.exec(this.data.cmd || 'git describe --tags --always', function (err, stdout, stderr) {
                if (err || stderr) {
                    return grunt.fail.fatal(err || stderr);
                }
                applyVersion(stdout.trim());
            });
        }
    });
};

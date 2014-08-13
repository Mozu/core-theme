'use strict';
module.exports = function (grunt) {
    grunt.registerMultiTask('tfscheckout', 'Using Team Foundation Server, checks out the files that will be modified, so TFS is aware that changes were made.', function () {
        var done = this.async(),
            spawn = require('child_process').spawn,
            fs = require('fs'),
            child,
            self = this;

        var workingConf;
        [
            /* Visual Studio 2013 */
            {
                path: "C:\\Program Files\ (x86)\\Microsoft\ Visual\ Studio\ 12.0\\Common7\\IDE\\TF.exe",
                args: ["checkout", this.data.dir, "/recursive"]
            },
            /* Visual Studio 2012 */
            {
                path: "C:\\Program Files\ (x86)\\Microsoft\ Visual\ Studio\ 11.0\\Common7\\IDE\\TF.exe",
                args: ["checkout", this.data.dir + "\\*"]
            }
        ].some(function (conf) {
            if (fs.existsSync(conf.path)) {
                workingConf = conf;
                return true;
            }
        })

        grunt.log.writeln('Checking directory \'' + this.data.dir + '\' out from tfs');

        if (process.platform !== "win32" || !workingConf) {
            grunt.log.warn("No TFS present.")
            return done(true);
        }

        child = spawn(workingConf.path, workingConf.args);

        child.stderr.on('data', function (data) {
            grunt.log.error(data);
        });

        child.on('close', function (code) {
            if (code !== 0) {
                grunt.log.error("Could not check files out of TFS.") && grunt.fatal("TFS checkout failed.");
                done(false);
            } else {
                grunt.log.ok("Checked out contents of " + self.data.dir);
                done(true);
            }
        });
    });
};
'use strict';
module.exports = function (grunt) {
    var tfsloc = "C:\\Program Files\ (x86)\\Microsoft\ Visual\ Studio\ 12.0\\Common7\\IDE\\TF.exe";
    grunt.registerMultiTask('tfscheckout', 'Using Team Foundation Server, checks out the files that will be modified, so TFS is aware that changes were made.', function () {
        var done = this.async(),
            spawn = require('child_process').spawn,
            child,
            self = this;

        grunt.log.writeln('Checking directory \'' + this.data.dir + '\' out from tfs');

        if (process.platform !== "win32" || !require('fs').existsSync(tfsloc)) {
            grunt.log.warn("No TFS present.")
            done(true);
        }

        child = spawn(tfsloc, ["checkout", this.data.dir, "/recursive"]);

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
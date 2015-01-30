'use strict';

module.exports = function (grunt) {
    grunt.registerMultiTask('zubat', 'Compile theme JS files using Zubat.', function () {
        var done = this.async(),
        zubat = require('zubat');

        if (!this.data.logLevel) this.data.logLevel = 2;

        var job = zubat(this.data.dir, this.data, function () {
            grunt.log.ok('All tasks complete!');
            done(true);
        });

        job.on('log', function (str, sev) {
            switch (sev) {
                case "success":
                    grunt.log.ok("zubat: " + str);
                    break;
                case "error":
                    grunt.log.error("zubat: " + str);
                    job.cleanup(function () {
                        done(false);
                        grunt.fatal("Zubat fainted.");
                    });
                    break;
                case "warning":
                    grunt.warn("zubat: " + str);
                    job.cleanup(function () {
                        done(false);
                    });
                    break;
                default:
                    grunt.verbose.writeln("zubat: " + str);
            }
        });
    });
}
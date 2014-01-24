// Mozu-Require Gruntfile
'use strict';

var fs = require('fs');

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        releasetemp: '<%= pkg.name %>.tmp',

        banner: grunt.file.read("src/banner.tpl"),

        clean: {
            dist: {
                src: ['dist']
            },
            tmp: {
                src: ['<%= releasetemp %>']
            }
        },
        concat: {
            options: {
                banner: '<%= banner %>',
            },
            min: {
                src: ['src/wrap_header.tpl', 'lib/json2.js', 'src/vars-min.js', 'src/mozu-require.js', 'src/plugins/shim-browser.js', 'src/wrap_footer.tpl'],
                dest: "<%= releasetemp %>"
            },
            debug: {
                src: ['src/wrap_header.tpl', 'lib/json2.js', 'src/vars-debug.js', 'src/mozu-require.js', 'src/plugins/shim-browser.js', 'src/wrap_footer.tpl'],
                dest: './dist/<%= pkg.name %>.debug.js'
            },
            compiler: {
                src: ['src/wrap_header.tpl', 'src/vars-min.js', 'src/mozu-require.js', 'src/wrap_footer.tpl'],
                dest: './dist/<%= pkg.name %>.compiler.js'
            }
        },
        uglify: {
            dist: {
                options: {
                    banner: '<%= banner %>'
                },
                src: '<%= concat.min.dest %>',
                dest: './dist/<%= pkg.name %>.min.js'
            }
        },
        tfscheckout: {
            dist: {
                dir: 'dist'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    var tfsloc = "C:\\Program Files\ (x86)\\Microsoft\ Visual\ Studio\ 11.0\\Common7\\IDE\\TF.exe";
    grunt.registerMultiTask('tfscheckout', 'Using Team Foundation Server, checks out the files that will be modified, so TFS is aware that changes were made.', function () {
        var done = this.async(),
            spawn = require('child_process').spawn,
            child,
            self = this;

        grunt.log.writeln('Checking directory \'' + this.data.dir + '\' out from tfs');

        if (process.platform !== "win32" || !fs.existsSync(tfsloc)) {
            grunt.log.warn("No TFS present.")
            done(true);
        }

        child = spawn(tfsloc, ["checkout", this.data.dir + "\\*"]);

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

    var order = ['clean:dist', 'concat', 'uglify', 'clean:tmp', 'tfscheckout'];

    grunt.registerTask('default', order);

};
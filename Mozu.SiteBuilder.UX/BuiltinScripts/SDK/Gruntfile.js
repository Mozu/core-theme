'use strict';

var allScripts = ['lib/when/when.js', 'lib/uritemplate/bin/uritemplate.js', 'lib/microevent/microevent.js', 'src/utils.js', 'src/postprocessors.js', 'src/reference.js', 'src/object.js', 'src/collection.js', 'src/interface.js', 'src/context.js', 'src/init.js'];

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        toExport: 'Mozu',
        exportAs: 'Mozu',

        releasetemp: '<%= pkg.name %>.tmp',
        
        bower: {
            install: {
                cleanup: true
            }
        },
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
                banner: grunt.file.read('wrap_header.tpl'),
                footer: grunt.file.read('wrap_footer.tpl')
            },
            dist: {
                src: allScripts,
                dest: '<%= releasetemp %>'
            },
            debug: {
                src: allScripts.concat('init_debug.js'),
                dest: '<%= pkg.main %>.debug.js'
            }
        },
        uglify: {
            dist: {
                options: {
                    banner: '<%= banner %>'
                },
                src: '<%= concat.dist.dest %>',
                dest: '<%= pkg.main %>.min.js'
            },
            beautify: {
                options: {
                    beautify: true,
                    comments: true,
                    indent_level: 2,
                    compress: false,
                    mangle: false
                },
                src: '<%= concat.dist.dest %>',
                dest: '<%= pkg.main %>.js'
            }
        },
        tfscheckout: {
            dist: {
                dir: 'dist'
            }
        },
        jasmine: {
            all: {
                src: '<%= concat.debug.dest %>',
                options: {
                    errorReporting: true,
                    specs: 'tests/**/*.js'
                }
            }
        },
        browser: {
            test: {
                url: "http://127.0.0.1:8080/_SpecRunner.html"
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerMultiTask('browser', 'Opens a browser to view a specrunner', function () {
        var fserv = new (require('node-static')).Server();
        var done = this.async();
        var server = require('http').createServer(function (req, res) {
            req.addListener('end', function () {
                fserv.serve(req, res);
            });
        }).listen(8080);

        require('keypress')(process.stdin);
        grunt.log.writeln('Opening ' + this.data.url);
        require('open')(this.data.url);
        grunt.log.ok();
        grunt.log.writeln('Running static HTTP server. Press ESC in this window to continue...');
        process.stdin.on('keypress', function (ch, key) {
            if (key && key.name === "escape") {
                server.close();
                done();
            }
        });
        process.stdin.setRawMode(true);
        process.stdin.resume();
    });

    grunt.registerMultiTask('tfscheckout', 'Using Team Foundation Server, checks out the files that will be modified, so TFS is aware that changes were made.', function () {
        var done = this.async(),
            spawn = require('child_process').spawn,
            child,
            self = this;

        grunt.log.writeln('Checking directory \'' + this.data.dir + '\' out from tfs');

        child = spawn("C:\\Program Files\ (x86)\\Microsoft\ Visual\ Studio\ 11.0\\Common7\\IDE\\TF.exe", ["checkout", this.data.dir + "\\*"]);

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

    var order = ['bower', 'clean:dist', 'concat', 'uglify', 'clean:tmp', 'tfscheckout', 'jasmine:all'];

    grunt.registerTask('default', order); // TODO: figure out real debug channel
    grunt.registerTask('test', ['jasmine:all']);
    grunt.registerTask('testdebug', ['jasmine:all:build', 'browser']);
    grunt.registerTask('notest', order.slice(0, -1));
    grunt.registerTask('debug', ['notest', 'testdebug']);

};
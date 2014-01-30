// SDK Gruntfile
'use strict';

var port = 9001,
    testurl = "http://127.0.0.1:" + port + "/tests/SpecRunner.html";

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        releasetemp: '<%= pkg.name %>.tmp',

        banner: grunt.file.read("src/banner.tpl"),

        toExport: "MozuSDK",

        testPlatform: './tests/sdk.js',
       
        clean: {
            dist: {
                src: ['dist']
            },
            tmp: {
                src: ['<%= releasetemp %>']
            },
            test: {
                src: ['<%= testPlatform %>']
            }
        },
        browserify: {
            debug: {
                files: {
                    '<%= testPlatform %>': ['./src/init_debug.js']
                },
                options: {
                    debug: true,
                    standalone: "<%= toExport %>",
                    bare: true,
                    external: ["xmlhttprequest"]
                }
            },
            dist: {
                files: {
                    '<%= releasetemp %>': ['./src/init.js']
                },
                options: {
                    standalone: '<%= toExport %>',
                    bare: true,
                    external: ["xmlhttprequest"]
                }
            }
        },
        concat: {
            options: {
                banner: '<%= banner %>'
            },
            debug: {
                src: '<%= testPlatform %>',
                dest: './dist/<%= pkg.name %>.debug.js'
            }
        },
        uglify: {
            dist: {
                options: {
                    banner: '<%= banner %>'
                },
                src: '<%= releasetemp %>',
                dest: '<%= pkg.main %>.js'
            }
        },
        connect: {
            server: {
                options: {
                    port: port,
                    base: '.'
                }
            },
            browser: {
                options: {
                    port: port,
                    base: '.',
                    keepalive: true,
                    open: testurl
                }
            }
        },
        mocha: {
            test: {
                options: {
                    reporter: 'Dot',
                    urls: [testurl],
                    run: true
                }
            }
        },
        tfscheckout: {
            dist: {
                dir: 'dist'
            }
        },
        jsdoc: {
            src: ['src/context.js', 'readme.md'],
            options: {
                destination: 'docs',
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-browserify');


    var tfsloc = "C:\\Program Files\ (x86)\\Microsoft\ Visual\ Studio\ 11.0\\Common7\\IDE\\TF.exe";
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

    grunt.registerTask('test', ['browserify:debug', 'connect:server', 'mocha']);
    grunt.registerTask('dist', ['clean:dist', 'browserify:dist', 'concat:debug', 'uglify', 'clean:tmp']);
    grunt.registerTask('testbrowser', ['browserify:debug', 'connect:browser']);
    grunt.registerTask('default', ['test', 'dist', 'clean:test', 'tfscheckout']);

};

'use strict';

var allScripts = ['lib/when/when.js', 'lib/uritemplate/bin/uritemplate.js', 'lib/microevent/microevent.js', 'src/utils.js', 'src/postprocessors.js', 'src/reference.js', 'src/object.js', 'src/collection.js', 'src/interface.js', 'src/context.js', 'src/init.js'];

var port = 9001,
    testurl = "http://127.0.0.1:" + port + "/tests/SpecRunner.html";

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        toExport: 'Mozu',
        exportAs: 'Mozu',

        releasetemp: '<%= pkg.name %>.tmp',

        banner: grunt.file.read("src/banner.tpl"),
        
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
                banner: '<%= banner %>' + grunt.file.read('src/wrap_header.tpl'),
                footer: grunt.file.read('src/wrap_footer.tpl')
            },
            dist: {
                src: allScripts,
                dest: '<%= releasetemp %>'
            },
            debug: {
                src: allScripts.concat('src/init_debug.js'),
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
                    banner: '<%= banner %>',
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
                    reporter: 'Nyan',
                    urls: [testurl],
                    run: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-mocha');

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

    var order = ['bower', 'clean:dist', 'concat', 'uglify', 'clean:tmp', 'tfscheckout', 'connect:server', 'mocha'];

    grunt.registerTask('default', order);
    grunt.registerTask('test', ['connect:server','mocha']);
    grunt.registerTask('testdebug', ['connect:browser']);
    grunt.registerTask('notest', order.slice(0, -2));
    grunt.registerTask('debug', ['notest', 'testdebug']);

};
// hyprlive Gruntfile
'use strict';

var port = 9001,
    testurl = "http://127.0.0.1:" + port + "/tests/SpecRunner.html";

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        releasetemp: '<%= pkg.name %>.tmp',

        banner: grunt.file.read("src/banner.tpl"),

        bower: {
            install: {
                options: {
                    cleanup: true,
                    bowerOptions: {
                        verbose: true,
                        forceLatest: true
                    }
                }
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
                banner: '<%= banner %>',
            },
            //dist: {
            //    src: ['wrap_header.tpl', 'lib/nunjucks/nunjucks-min.js',
            //    dest: '<%= releasetemp %>'
            //},
            debug: {
                src: ['src/wrap_header.tpl', 'lib/swig/swig.js', 'src/loader.js', 'src/env.js', 'src/tags.js', 'src/filters.js', 'src/wrap_footer.tpl'],
                dest: '<%= pkg.main %>.debug.js'
            }
        },
        uglify: {
            dist: {
                options: {
                    banner: '<%= banner %>'
                },
                src: '<%= concat.debug.dest %>', // <%= concat.dist.dest %> when there's a real min version with compilation
                dest: '<%= pkg.main %>.min.js'
            }
        }
        //connect: {
        //    server: {
        //        options: {
        //            port: port,
        //            base: '.'
        //        }
        //    },
        //    browser: {
        //        options: {
        //            port: port,
        //            base: '.',
        //            keepalive: true,
        //            open: testurl
        //        }
        //    }
        //},
        //mocha: {
        //    test: {
        //        options: {
        //            reporter: 'Nyan',
        //            urls: [testurl],
        //            run: true
        //        }
        //    }
        //}
    });

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-contrib-connect');
    //grunt.loadNpmTasks('grunt-mocha');


    var order = ['bower', 'clean:dist', 'concat', 'uglify', 'clean:tmp' /*, 'connect:server', 'mocha' */];
    // while zetlen swig's bower.json is still mysteriously out of whack, let's just never bower
    //grunt.registerTask('default', order);
    //grunt.registerTask('nobower', order.slice(1));

    grunt.registerTask('default', order.slice(1));


    //grunt.registerTask('test', ['connect:server', 'mocha']);
    //grunt.registerTask('testdebug', ['connect:browser']);
    //grunt.registerTask('notest', order.slice(0, -2));
    //grunt.registerTask('debug', ['notest', 'testdebug']);

};
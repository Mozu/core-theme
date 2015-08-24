// hyprlive Gruntfile
'use strict';

var port = 9001,
    testurl = "http://127.0.0.1:" + port + "/tests/SpecRunner.html";

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        banner: grunt.file.read("src/banner.tpl"),

        testPlatform: './tests/hyprlive.js',

        clean: {
            dist: {
                src: ['dist']
            },
            test: {
                src: ['<%= testPlatform %>']
            }
        },
        concat: {
            options: {
                banner: '<%= banner %>',
            },
            test: {
                src: ['src/wrap_header.tpl', 'node_modules/swig/dist/swig.js', 'src/loader.js', 'src/env.js', 'src/tags.js', 'src/filters.js', 'src/wrap_footer.tpl'],
                dest: '<%= testPlatform %>'
            },
            dist: {
                src: '<%= testPlatform %>',
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
        watch: {
            files: ['src/*', 'tests/HyprLiveSpec.js'],
            tasks: ['default']
        },
        mocha: {
            test: {
                options: {
                    reporter: 'Spec',
                    urls: [testurl],
                    run: true
                }
            }
        }
    });

    Object.keys(grunt.file.readJSON('package.json').devDependencies).filter(function(dep) { return dep.match(/^grunt-/); }).forEach(grunt.loadNpmTasks);

    grunt.loadNpmTasks('grunt-contrib-watch');

    //var order = ['clean:dist', 'concat', 'uglify', 'clean:tmp', 'connect:server', 'mocha'];
    // while zetlen swig's bower.json is still mysteriously out of whack, let's just never bower
    //grunt.registerTask('default', order);
    //grunt.registerTask('nobower', order.slice(1));


    grunt.registerTask('test', ['concat:test', 'connect:server', 'mocha']);
    grunt.registerTask('dist', ['clean:dist', 'concat:dist', 'uglify']);
    grunt.registerTask('testbrowser', ['concat:test', 'connect:browser']);
    grunt.registerTask('default', ['test', 'dist', 'clean:test']);

};
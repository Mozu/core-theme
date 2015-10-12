// Theme Docs Gruntfile
'use strict';

module.exports = function (grunt) {

    grunt.initConfig({
        clean: {
            dist: {
                src: ['built']
            }
        },
        jsdoc: {
            dist: {
                src: ['./externals/*.js'],
                dest: './built',
                options: {
                    configure: './jsdoc_conf.json'
                }
            }
        },

        watch: {
            all: {
                files: ['./externals/*.js', '../Themes/Core4/scripts/**/*.js', 'jsdoc_conf.json'],
                tasks: ['clean','jsdoc'],
                options: {
                    spawn: false,
                    livereload: true
                }
            }
        },

        connect: {
            all: {
                options: {
                    port: 8008,
                    base: 'built',
                    keepalive: true,
                    livereload: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('live', ['clean', 'jsdoc', 'connect', 'watch']);

};
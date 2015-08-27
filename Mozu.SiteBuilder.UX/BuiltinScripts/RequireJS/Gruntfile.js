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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    var order = ['clean:dist', 'concat', 'uglify', 'clean:tmp'];

    grunt.registerTask('default', order);

};
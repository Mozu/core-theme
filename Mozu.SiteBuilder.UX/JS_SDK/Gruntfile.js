'use strict';

var allScripts = ['node_modules/when/when.js', 'node_modules/uritemplate/bin/uritemplate.js', 'src/utils.js', 'src/reference.js', 'src/interface.js', 'src/context.js', 'src/init.js'];

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        toExport: 'Mozu',
        exportAs: 'Mozu',

        tmp: '<%= pkg.name %>.tmp',

        banner: grunt.file.read('banner.tpl'),

        
        clean: {
            dist: {
                src: ['dist']
            },
            tmp: {
                src: ['<%= tmp %>']
            }
        },
        concat: {
            options: {
                stripBanners: true
            },
            dist: {
                src: allScripts,
                dest: '<%= tmp %>'
            },
            debug: {
                src: allScripts.concat('init_debug.js'),
                dest: '<%= tmp %>'
            }
        },
        wrap: {
            wrapper: 'definewrapper.tpl',
            src: '<%= concat.dist.dest %>',
            dest: '<%= tmp %>',
            data: {
                toExport: '<%= toExport %>',
                exportAs: '<%= exportAs %>',
                banner: '<%= banner %>'
            }
        },
        uglify: {
            dist: {
                options: {
                    banner: '<%= banner %>'
                },
                src: '<%= wrap.dest %>',
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
                src: '<%= wrap.dest %>',
                dest: '<%= pkg.main %>.js'
            }
        },
        jasmine: {
            all: {
                src: '<%= uglify.beautify.dest %>',
                options: {
                    errorReporting: true,
                    specs: 'tests/**/*.js',
                    vendor: 'vendor/jquery.js'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerTask('wrap', 'Wraps the file using a lodash template.', function () {
        var conf = grunt.config('wrap');
        grunt.log.write('Looking for ' + conf.wrapper + ' and ' + conf.src + '....');
        try {
            var wrapper = grunt.file.read('./' + conf.wrapper, 'UTF-8'),
                content = grunt.file.read('./' + conf.src, 'UTF-8');
        } catch (e) {
            if (!wrapper) grunt.log.error(conf.wrapper + ' not found') && grunt.fatal(e);
            if (!content) grunt.log.error(conf.src + ' not found') && grunt.fatal(e);
        }
        grunt.log.ok();
        conf.data.body = content;
        grunt.file.write(conf.dest, grunt.template.process(wrapper, conf));
        grunt.log.ok('Wrapped file saved to ' + conf.dest);
    });

    var order = ['clean:dist', 'concat:dist', 'wrap', 'uglify:beautify', 'uglify:dist', 'clean:tmp', 'jasmine:all'];
    var debugorder = ['clean:dist', 'concat:debug', 'wrap', 'uglify:beautify', 'uglify:dist', 'clean:tmp', 'jasmine:all'];

    grunt.registerTask('strict', debugorder); // TODO: figure out real debug channel
    grunt.registerTask('debug', debugorder);
    grunt.registerTask('test', ['jasmine:all']);
    grunt.registerTask('testdebug', ['jasmine:all:build']);
    grunt.registerTask('default', order.slice(0, -1));

};
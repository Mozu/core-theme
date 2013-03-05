'use strict';

var allScripts = ['node_modules/when/when.js', 'node_modules/uritemplate/bin/uritemplate.js', 'src/utils.js', 'src/reference.js', 'src/interface.js', 'src/context.js', 'src/init.js'];

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        toExport: 'Mozu',
        exportAs: 'Mozu',

        releasetemp: '<%= pkg.name %>.tmp',
        debugtemp: '<%= pkg.name %>.debug.tmp',

        banner: grunt.file.read('banner.tpl'),

        
        clean: {
            dist: {
                src: ['dist']
            },
            tmp: {
                src: ['<%= releasetemp %>', '<%= debugtemp %>']
            }
        },
        concat: {
            options: {
                stripBanners: true
            },
            dist: {
                src: allScripts,
                dest: '<%= releasetemp %>'
            },
            debug: {
                src: allScripts.concat('init_debug.js'),
                dest: '<%= debugtemp %>'
            }
        },
        wrap: {
            release: {
                wrapper: 'definewrapper.tpl',
                src: '<%= concat.dist.dest %>',
                dest: '<%= releasetemp %>',
                data: {
                    toExport: '<%= toExport %>',
                    exportAs: '<%= exportAs %>',
                    banner: '<%= banner %>'
                }
            },
            debug: {
                wrapper: '<%= wrap.release.wrapper %>',
                src: '<%= debugtemp %>',
                dest: '<%= pkg.main %>.debug.js',
                data: {
                    toExport: '<%= toExport %>',
                    exportAs: '<%= exportAs %>',
                    banner: '<%= banner %>'
                }
            }
        },
        uglify: {
            dist: {
                options: {
                    banner: '<%= banner %>'
                },
                src: '<%= wrap.release.dest %>',
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
                src: '<%= wrap.release.dest %>',
                dest: '<%= pkg.main %>.js'
            }
        },
        jasmine: {
            all: {
                src: '<%= wrap.debug.dest %>',
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
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerMultiTask('wrap', 'Wraps the file using a lodash template.', function () {
        var conf = this.data;
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

    var order = ['clean:dist', 'concat', 'wrap', 'uglify', 'clean:tmp', 'jasmine:all'];

    grunt.registerTask('default', order); // TODO: figure out real debug channel
    grunt.registerTask('test', ['jasmine:all']);
    grunt.registerTask('testdebug', ['jasmine:all:build', 'browser']);
    grunt.registerTask('notest', order.slice(0, -1));
    grunt.registerTask('debug', ['notest', 'testdebug']);

};
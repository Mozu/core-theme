module.exports = function(grunt) {

    grunt.initConfig({

        bower: {
            install: {
                options: {
                    targetDir: './scripts/vendor',
                    layout: 'byComponent',
                    cleanBowerDir: true,
                    bowerOptions: {
                        production: true,
                        forceLatest: true
                    }
                }
            }
        },
        jshint: {
            default: [
                'theme.json',
                'theme-ui.json',
                'labels/**/*.json',
                'Gruntfile.js',
                'scripts/**/*.js'
            ],
            options: {
                ignores: ['scripts/vendor/**/*.js'],
                globals: {
                    console: true,
                    window: true,
                    document: true,
                    setTimeout: true,
                    clearTimeout: true,
                    module: true,
                    define: true,
                    require: true,
                    Modernizr: true,
                    process: true
                }
            }
        },
        tfscheckout: {
            compiled: {
                dir: 'compiled'
            },
            vendor: {
                dir: 'scripts/vendor'
            }
        },
        zubat: {
            main: {
                dir: '.',
                ignore: ['\\.references', '\\.git', 'node_modules', '^/resources', '^/tasks', '\\.zip$']
            }
        },
        setver: {
            release: {
                packagejson: true,
                bowerjson: true,
                thumbnail: {
                    src: 'thumb.tpt.png',
                    color: '#ffffff',
                    pointsize: 20,
                    dest: 'thumb.png'
                }
            }
        },
        watch: {
            json: {
                files: [
                    'theme.json',
                    'theme-ui.json',
                    'labels/**/*.json'
                ],
                tasks: ['jshint'],
                options: {
                    spawn: false
                }
            },
            javascript: {
                files: [
                    'scripts/**/*.js'
                ],
                tasks: ['default'],
                options: {
                    spawn: false
                }
            }
        }
    });

    ['grunt-bower-task',
     'grunt-contrib-jshint',
     'grunt-contrib-watch'].forEach(grunt.loadNpmTasks);

    grunt.loadTasks('./tasks/');
    grunt.registerTask('default', ['jshint', 'tfscheckout', 'bower', 'zubat']);
    grunt.registerTask('notfs', ['jshint', 'zubat']);
    grunt.registerTask('release', ['jshint', 'tfscheckout', 'bower', 'zubat', 'setver']);
    grunt.registerTask('releasenotfs', ['jshint', 'tfscheckout', 'bower', 'zubat', 'setver']);

};

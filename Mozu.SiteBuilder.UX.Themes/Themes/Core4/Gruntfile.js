module.exports = function (grunt) {

    grunt.initConfig({
       
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
                //asi: true,
                //boss: true,
                //undef: true,
                //laxcomma: true,
                //unused: false,
                //expr: true,
                //eqnull: true,
                //browser: true,
                //devel: true,
                //nonstandard: true,
                //loopfunc: true,
                //"-W099": true,
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
            main: {
                dir: 'compiled'
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

    [ 'grunt-contrib-jshint', 'grunt-contrib-watch'].forEach(grunt.loadNpmTasks);
    grunt.loadTasks('./tasks/');
    grunt.registerTask('default', [ 'jshint', 'tfscheckout', 'zubat']);
    grunt.registerTask('notfs', [ 'jshint', 'zubat']);
    grunt.registerTask('release', [ 'jshint', 'tfscheckout', 'zubat', 'setver']);
    grunt.registerTask('releasenotfs', [ 'jshint', 'tfscheckout', 'zubat', 'setver']);
   
}; 

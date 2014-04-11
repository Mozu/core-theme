module.exports = function (grunt) {

    grunt.initConfig({
        jshint: {
            main: [
              'Gruntfile.js',
              'build.js',
              'scripts/**/*.js'
            ],
            options: {
                ignores: ['scripts/vendor/**/*.js'],
                undef: true,
                laxcomma: true,
                unused: false,
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadTasks('./tasks/');
    grunt.registerTask('default', ['jshint', 'zubat']);
    grunt.registerTask('release', ['jshint', 'zubat', 'setver']);
};

module.exports = function(grunt) {

    var pkg = grunt.file.readJSON('./package.json');
    var semver = require('semver');

    grunt.initConfig({
        pkg: pkg,
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
            "default": [
                'theme.json',
                'theme-ui.json',
                'labels/**/*.json',
                'Gruntfile.js',
                'scripts/**/*.js'
            ],
            options: {
                es3: true,
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
        zubat: {
            main: {
                dir: '.',
                ignore: ['\\.references', '\\.git', 'node_modules', '^/resources', '^/tasks', '\\.zip$']
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
        },
        "compress": {
          "build": {
            "options": {
              "archive": "<%= pkg.name %>-<%= pkg.version %>.zip",
              "pretty": true
            },
            "files": [
              {
                "src": [
                  "**",
                  "!node_modules/**",
                  "!references/**",
                  "!tasks/**",
                  "!configure.js",
                  "!Gruntfile.js",
                  "!mozu.config.json",
                  "!*.zip"
                ],
                "dest": "/"
              }
            ]
          }
        }
    });

    ['grunt-bower-task',
     'grunt-contrib-jshint',
     'grunt-contrib-watch',
     'grunt-contrib-compress'].forEach(grunt.loadNpmTasks);

    grunt.loadTasks('./tasks/');
    grunt.registerTask('default', ['jshint', /*'bower', */ 'zubat']); // no bower necessary for now


    grunt.registerTask('setver', function() {

        var j = grunt.file.readJSON('./theme.json');
        j.about.name = "Core7 VisaCheckout " + semver.inc(pkg.version, grunt.option('increment') || 'prerelease');
        grunt.file.write('./theme.json', JSON.stringify(j, null, 4));

    });

};

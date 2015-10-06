module.exports = function(grunt) {

    var pkg = grunt.file.readJSON('./package.json');
    grunt.initConfig({
        mozuconfig: grunt.file.exists('./mozu.config.json') ? grunt.file.readJSON('./mozu.config.json') : {},
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
            },
              "sync": {
                "files": "<%= mozusync.upload.src %>",
                "tasks": [
                  "mozusync:upload"
                ]
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
                  "admin/**/*",
                  "compiled/**/*",
                  "labels/**/*",
                  "resources/**/*",
                  "scripts/**/*",
                  "stylesheets/**/*",
                  "templates/**/*",
                  "theme.json",
                  "*thumb.png",
                  "*thumb.jpg",
                  "theme-ui.json",
                  "!*.orig",
                  "!.inherited"
                ],
                "dest": "/"
              }
            ]
          }
        },
        "mozutheme": {
          "check": {},
          "update": {
            "versionRange": "<%= pkg.config.baseThemeVersion %>"
          },
          "compile": {},
          "quickcompile": {
            "command": "compile",
            "opts": {
              "skipminification": true
            }
          }
        },
        "mozusync": {
          "options": {
            "applicationKey": "<%= mozuconfig.workingApplicationKey %>",
            "context": "<%= mozuconfig %>",
            "watchAdapters": [
              {
                "src": "mozusync.upload.src",
                "action": "upload"
              },
              {
                "src": "mozusync.del.remove",
                "action": "delete"
                }
            ]
          },
          "upload": {
            "options": {
              "action": "upload",
              "noclobber": true
            },
            "src": [
              "admin/**/*",
              "compiled/**/*",
              "labels/**/*",
              "resources/**/*",
              "scripts/**/*",
              "stylesheets/**/*",
              "templates/**/*",
              "theme.json",
              "*thumb.png",
              "*thumb.jpg",
              "theme-ui.json",
              "!*.orig",
              "!.inherited"
            ],
            "filter": "isFile"
          },
          "del": {
            "options": {
              "action": "delete"
            },
            "src": "<%= mozusync.upload.src %>",
            "filter": "isFile",
            "remove": []
          },
          "wipe": {
            "options": {
              "action": "deleteAll"
            },
            "src": "<%= mozusync.upload.src %>"
            }
        }
    });

    ['grunt-bower-task',
     'grunt-contrib-jshint',
     'grunt-contrib-watch',
     'grunt-contrib-compress',
     'grunt-mozu-appdev-sync',
     'thmaa'
    ].forEach(grunt.loadNpmTasks);

    grunt.registerTask('default', [
      'jshint', 
      'bower',
      'mozutheme:quickcompile'
    ]); // no bower necessary for now


    grunt.registerTask('setver', function() {

        var j = grunt.file.readJSON('./theme.json');
        var b = grunt.file.readJSON('./bower.json');
        j.about.name = "Core8 " + pkg.version;
        b.version = pkg.version;
        grunt.file.write('./theme.json', JSON.stringify(j, null, 4));
        grunt.file.write('./bower.json', JSON.stringify(b, null, 4));

    });

};

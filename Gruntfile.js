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
          navigation: true,
          location: true,
          module: true,
          define: true,
          require: true,
          Modernizr: true,
          process: true
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
      "compile": {},
      "quickcompile": {
        "command": "compile",
        "opts": {
          "skipminification": true
        }
      }
    }
  });

  ['grunt-bower-task',
    'grunt-contrib-jshint',
    'grunt-contrib-watch',
    'grunt-contrib-compress',
    'grunt-mozu-appdev-sync',
    'mozu-theme-helpers'
  ].forEach(grunt.loadNpmTasks);

  grunt.registerTask('default', [
    'jshint', 
    'bower',
    'mozutheme:quickcompile'
  ]); // no bower necessary for now


  grunt.registerTask('setver', function() {
    var b = grunt.file.readJSON('./bower.json');
    b.version = pkg.version;
    grunt.file.write('./bower.json', JSON.stringify(b, null, 4));
  });

};

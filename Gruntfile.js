/* global module: true */
module.exports = function (grunt) {
  'use strict';
  var pkg = grunt.file.readJSON('./package.json');
  require('time-grunt')(grunt);
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
      production: {
        src: [
          'theme.json',
          'theme-ui.json',
          'labels/**/*.json',
          'Gruntfile.js',
          'scripts/**/*.js'
        ]
      },
      develop: {
        src: '{<%= jshint.production.src %>}',
        options: {
          devel: true
        }
      },
      options: {
        es3: true,
        browser: true,
        undef: true,
        nonstandard: true,
        ignores: ['scripts/vendor/**/*.js'],
        globals: {
          JSON: true,
          define: true,
          require: true,
          Modernizr: true
        }
      }
    },
    compress: {
      build: {
        options: {
          archive: '<%= pkg.name %>-<%= pkg.version %>.zip',
          pretty: true
        },
        files: [
          {
            src: [
              'admin/**/*',
              'compiled/**/*',
              'labels/**/*',
              'packageconfig.xml',
              'resources/**/*',
              'scripts/**/*',
              'stylesheets/**/*',
              'templates/**/*',
              'theme.json',
              '*thumb.png',
              '*thumb.jpg',
              'theme-ui.json',
              '!*.orig',
              '!.inherited'
            ],
            dest: '/'
          }
        ]
      }
    },
    mozutheme: {
      check: {
        command: 'check'
      },
      fullcompile: {
        command: 'compile'
      },
      quickcompile: {
        command: 'compile',
        opts: {
          skipminification: true
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

  grunt.registerTask('build', [
    'jshint:develop',
    'bower',
    'mozutheme:quickcompile'
  ]);

  grunt.registerTask('build-production', [
    'jshint:production',
    'mozutheme:fullcompile',
    'compress'
  ]);

  grunt.registerTask('default', ['build']);

  grunt.registerTask('setver', function () {
    var b = grunt.file.readJSON('./bower.json');
    b.version = pkg.version;
    grunt.file.write('./bower.json', JSON.stringify(b, null, 4));
  });
};

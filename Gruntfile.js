module.exports = function(grunt) {

  'use strict';

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    config: {
      build: 'dest',
      temp: '.tmp',
      source: 'src'
    },

    watch: {
      loader: {
        files: [
          '<%= config.source %>/**/*.*',
        ],
        tasks: ['copy:nonjs','concat:app'],
      },

      dest: {
        files: ['<%= config.build %>/**/*.*'],
        options: {
          livereload: true
        }
      }
    },

    express: {
      server: {
        options: {
          port: 3333,
          bases: '<%= config.build %>',
          livereload:true
        }
      }
    },

    copy: {
      nonjs: {
        files: [
          {
            expand: true,
            cwd: '<%= config.source %>',
            src: [
                '**/*.html',
                'img/**/*.*',
                'styles.css'
              ],
            dest: '<%= config.build %>'
          }
        ]
      }
    },

    clean: {
      all: {
        files: [{
          dot: true,
          src: [
            '<%= config.build %>',
            '<%= config.temp %>'
          ]
        }]
      }
    },

    concurrent: {
      loader: [ 'watch:loader', 'watch:dest', 'server']
    },

    concat: {
      app: {
        src: [
          '<%= config.source %>/js/vendor/*.js',
          '<%= config.source %>/js/app.js'
        ],
        dest: '<%= config.build %>/built.js'
      }
    }
  });

  grunt.registerTask('server', ['express', 'express-keepalive']);
  grunt.registerTask('build', ['clean:all', 'copy:nonjs', 'concat:app']);
  grunt.registerTask('default',['build', 'concurrent:loader']);

};
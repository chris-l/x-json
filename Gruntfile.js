module.exports = function(grunt) {

  grunt.initConfig({
    'jslint'  : {
      all     : {
        src : [ 'src/*.js' ],
        directives : {
          indent : 2
        }
      }
    },
    'uglify'  : {
        target : {
          files : { 'dist/x-json.js' : 'src/x-json.js' }
      }
    },
    'connect': {
      demo: {
        options: {
          open: true,
          keepalive: true
        }
      }
    },
    'gh-pages': {
      options: {
        clone: 'bower_components/x-json'
      },
      src: [
        'bower_components/**/*',
        '!bower_components/x-json/**/*',
        'demo/*', 'src/*', 'index.html'
      ]
    },
    vulcanize: {
      default: {
        options: {
          inline: true,
          'strip-excludes' : false,
          excludes: {
            imports: [ "polymer.html" ]
          }
        },
        files: {
          'dist/x-json.html' : 'dist/x-json.html'
        }
      }
    },
    clean : [ 'dist/x-json.js' ],
    'replace': {
      example: {
        src: ['src/*'],
        dest: 'dist/',
        replacements: [{
          from: 'bower_components',
          to: '..'
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-vulcanize');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('lint',  ['jslint']);
  grunt.registerTask('build',  ['jslint', 'replace', 'uglify', 'vulcanize', 'clean']);
  grunt.registerTask('deploy', ['gh-pages']);
  grunt.registerTask('server', ['connect']);

};

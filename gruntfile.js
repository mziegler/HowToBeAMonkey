// Grunt build script for Winslow Homer


module.exports = function(grunt) {
    
    // 1. All configuration goes here 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        
        
        
        // clear dist and build directories
        clean: {
            build: ['build'],
            dist: ['dist'],
        },
        
        
        
        
        // create directories for building
        mkdir: {
            all: {
                options: {
                    create: ['build', 'dist/gh-pages']
                }
            }
        },
        
        
        
        
        // copy files into the build directory, and dist directory
        copy: {
            'prebuild': {
                files: [
                    {expand: true, src: ['**'], cwd: 'src/', dest: 'build/',},            
                ]
            },
        },
        
        
        
        
        
        concat: {
            // 2. Configuration for concatinating files goes here.
        },
    });
   
    
   
   
    
    // 3. Where we tell Grunt we plan to use this plug-in.
    //grunt.loadNpmTasks('grunt-contrib-concat');
    
    // load tasks from all dependencies
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    
    
    
    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    //grunt.registerTask('default', ['concat']);
    grunt.registerTask('default', ['clean', 'mkdir', 'copy:prebuild']);
};



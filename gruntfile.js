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
            prebuild: {
                files: [
                    {expand: true, src: ['**'], cwd: 'src/', dest: 'build/',},
                    {expand:true, cwd:'data/', src: ['media.js', 'behavior.json'], dest: 'build/'},        
                ]
            },
            
            postbuild: {
                files: [
                        {expand: true, src: ['**'], cwd: 'build/', dest: 'dist/gh-pages',},            
                ]
            }
        },
        
        
        
        
        
        shell: {
            options: {},
            builddata: {
                command: 'python3 build_data.py',
                options: {
                    execOptions: {
                        cwd: 'data',
                    }
                }
            }
        },
        
        
        /*
        concat: {
            options: {
                separator: ';\n',
            },
            scripts: {
                src: [
                    '',
                    ''
                ],
                dest: 'scripts.js.concat',
            }
        },
        */
        
        
        
        uglify: {
            options: {
                sourceMap: true,
                screwIE8: true,
            },
            
            scripts: {
                files: {
                    'build/scripts.js.ugly': [
                            'src/js/map.js',
                            'src/js/mapmedia.js',
                            'src/js/mapbubbles.js',
                            'src/js/introscreens.js',
                            'src/js/headercontrols.js',
                            ],
                }
            },
            
            libraries: {
                files: {
                    'build/libraries.js.ugly': [
                        'src/libraries/jquery-1.11.0.min.js',
                        'src/libraries/leaflet/leaflet.js',
                        'src/libraries/lightbox/lightbox.min.js',
                        'src/libraries/d3/d3.min.js',
                        'src/libraries/d3/d3.hexbin.min.js',
                    ],
                },
                options: {
                    mangle: false,
                    compress: false,
                }
            },
            

        },
        
        

        
        
        
        processhtml: {
            options: {
                // task-specific options
                files: {
                    'build/index.html': ['src/index.html']
                },
                includeBase: 'build/'
            },
            
            dist: {
                files: {
                    'build/index.html': ['src/index.html']
                }
            },
            
            dev: {
                files: {
                    'build/index.html': ['src/index.html']
                }
            }
        },
        
        
        
        
        // push to github pages
        'gh-pages': {
            options: {
                base: 'dist/gh-pages',
                
            },
            
            src: ['**'],
            
        },
        
        
        
        
        
        'http-server': {
            dev: {
                root: 'build',
                port: 8080,
                runInBackground: true,
                host: '0.0.0.0',
                // logFn: function(req, res, error) { },
            },
            
            testbuild: {
                root: 'build',
                port: 8080,
                host: '0.0.0.0',
            }    
        },
        
        
        watch: {
            options: {
                // debounceDelay:3000   // not actually preventing multiple builds
            },
            src: {
                files: ['src/**'],
                tasks: ['build-debug'],
            },
            data: {
                files: ['data/**'],
                tasks: ['build-data', 'build-debug'],
            }
        }
        
        
        
        
    });
   
    
   
   
    

    // load tasks from all dependencies
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    
    
    

    grunt.registerTask('build-data', ['shell:builddata']);
        
    grunt.registerTask('setup', ['clean', 'mkdir', 'copy:prebuild']);
    
    
    
    grunt.registerTask('build-debug', ['setup', 'processhtml:dev']);
    
    grunt.registerTask('debug', ['build-data', 'build-debug', 'http-server:dev', 'watch']);
    
    
    
    grunt.registerTask('build', ['build-data', 'setup', 'uglify', 'processhtml:dist', 'copy:postbuild']);
    
    grunt.registerTask('test-build', ['build', 'http-server:testbuild']);
    
    
    grunt.registerTask('default', ['debug']);
};



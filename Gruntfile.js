/*By Adam*/
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            compile: {
                options: {
                    baseUrl: "./js",

                    mainConfigFile: "./js/require.config.js",

                    waitSeconds: 0,

                    optimizeAllPluginResources: true,

                    name: "require.config",

                    optimize: 'uglify',

                    // Output file after optimization
                    out: "build/<%= pkg.name %>.build.js"
                }
            },
            compileDev:
                {
                    options: {
                        baseUrl: "./js",

                        mainConfigFile: "./js/require.config.js",

                        waitSeconds: 0,

                        optimizeAllPluginResources: true,

                        name: "require.config",

                        optimize: 'none',

                        // Output file after optimization
                        out: "build-dev/<%= pkg.name %>.build.js"
                    }
                }
        },
        copy:
            {
                build: {
                    files: [
                        {
                            expand: true,
                            src: ['./css/**', './font/**', './img/**', './js/**/*.html'],
                            dest: './build/'
                        },
                        {
                            expand: true,
                            src: ['index.html'],
                            dest: './build'
                        },
                        {
                            src: ['./bower_components/requirejs/require.js'],
                            dest: './build/'
                        }
                    ]
                },
                buildDev: {
                    files: [
                        {
                            expand: true,
                            src: ['./css/**', './font/**', './img/**', './js/**/*.html'],
                            dest: './build-dev/'
                        },
                        {
                            expand: true,
                            src: ['index.html'],
                            dest: './build-dev'
                        },
                        {
                            src: ['./bower_components/requirejs/require.js'],
                            dest: './build-dev/'
                        },
                        {
                            src: ['./js/modules/wizard/controllers/WizardCtrl.js'],
                            dest: './build-dev/'
                        }
                    ]
                }
            },
        //usemin: {
        //    html: ['build/index.html']
        //},
        html2js:
            {
                options: { useStrict: true, module: 'pecTemplate' },
                build: {
                    options: {
                        htmlmin: {
                            collapseBooleanAttributes: true,
                            collapseWhitespace: true,
                            removeAttributeQuotes: true,
                            removeComments: true,
                            removeEmptyAttributes: true,
                            removeRedundantAttributes: true,
                            removeScriptTypeAttributes: true,
                            removeStyleLinkTypeAttributes: true
                        }
                    },
                    src: ['js/modules/wizard/templates/*.html', 'js/modules/common/templates/*.html'],
                    dest: 'tmp/template.js'
                },
                buildDev: {
                    src: ['js/modules/wizard/templates/*.html', 'js/modules/common/templates/*.html'],
                    dest: 'tmp/template.js'
                }
            },
        clean:
            {
                build: ['build', 'dist','tmp'],
                buildDev: ['build-dev','tmp']
            },
        compress:
            {
                main:
                {
                    options:
                    {
                        archive: 'dist/staging.zip'
                    },
                    files: [
                        {
                            src: ['build/**']
                        }
                    ]
                }
            },
        concat: {
            build: {
                src: ['css/*.css', 'bower_components/ng-dialog/css/*.css'],
                dest: 'css/style.css'
            }
        },
        imagemin:
        {
            build: {
                options:
                    {
                        optimizationLevel: 7
                    },
                files: [
                        {
                            expand: true,
                            cwd: 'build/img',
                            src: ['**/*.{png,jpg,gif}'],
                            dest: 'build/img'
                        }
                ]
            }
        },
        cssmin:
            {
                build: {
                    options:
                        {
                            report: 'gzip'
                        },
                    files: [{
                        expand: true,
                        cwd: 'build/css',
                        src: ['**/*.css'],
                        dest: 'build/css'
                    }]
                }
            },
        htmlmin:
            {
                build: {
                    options: {
                        removeComments: true,
                        collapseWhitespace: true
                    },
                    files: [{
                        expand: true,
                        cwd: 'build/',
                        src: ['**/*.html'],
                        dest: 'build/'
                    }]
                }
            }
    })

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-html2js');


    grunt.registerTask('myusermin', function (task) {
        if (task === 'build')
        {
            grunt.config('usemin.html', ['build/index.html']);
            grunt.task.run('usemin');
        }
        else
        {
            grunt.config('usemin.html', ['build-dev/index.html']);
            grunt.task.run('usemin');
        }
    });

    grunt.registerTask('default', ['clean:build', 'html2js:build', 'requirejs:compile', 'concat:build', 'copy:build', 'myusermin:build', 'optimize', 'compress']);
    grunt.registerTask('optimize', ['imagemin', 'cssmin', 'htmlmin']);

    //for dev
    grunt.registerTask('dev', ['clean:buildDev', 'html2js:buildDev', 'requirejs:compileDev', 'concat:build', 'copy:buildDev', 'myusermin:buildDev']);

    
}
module.exports = function(grunt) {

require('load-grunt-tasks')(grunt);
var compass = require('compass-importer');


grunt.initConfig({	

	pkg: grunt.file.readJSON('package.json'),

	api: {
		name: 'garypburton'
	},

	dirs: {
		www: 'www/',
		src: 'app/',
		assets: 'www/assets/',
		dist: 'dist/',
		js: 'app/js/',
		scss: 'app/scss/',
		img: 'app/img/',
		html: 'app/assemble/'
	},

	curl: {
		'pagesMaster': {
			src: 'http://content.garypburton.com/<%= api.name %>/wp-json/wp/v2/pages',
			dest: '<%= dirs.html %>data/pages.json'
		}
    },

    jshint: {
		all: ['Gruntfile.js', "<%= dirs.js %>main.js"]
	},

	uglify: {
	    dev: {
	      	files: {
	        	'<%= dirs.assets %>js/main.min.js': ['<%= dirs.js %>main.js'],
	        	'<%= dirs.assets %>js/plugins.min.js': ['<%= dirs.js %>plugins.js'],
	      	}
	    }	  
	},

	sass: {
        options: {
            sourceMap: true,
            includePaths: [ '.compass'],
            importer: compass
        },
        dev: {
        	options: {
        		outputStyle: 'compact'
        	},
            files: {
                '<%= dirs.assets %>css/styles.css': '<%= dirs.scss %>styles.scss'
            }
        }
    },

	imagemin: {                          // Task
    	dev: {                          // Target
      		options: {                       // Target options
        		optimizationLevel: 3
        		/*use: [mozjpeg()]*/
      		},
      		files: [{
        		expand: true,                  // Enable dynamic expansion
        		cwd: '<%= dirs.img %>',                   // Src matches are relative to this path
        		src: ['**/*.{png,jpg,gif}'],   // Actual patterns to match
        		dest: '<%= dirs.assets %>img'                  // Destination path prefix
      		}]
    	},
    	production: {                          // Target
      		options: {                       // Target options
        		optimizationLevel: 7
        		/*use: [mozjpeg()]*/
      		},
      		files: [{
        		expand: true,                  // Enable dynamic expansion
        		cwd: 'app/src/img',                   // Src matches are relative to this path
        		src: ['**/*.{png,jpg,gif}'],   // Actual patterns to match
        		dest: 'dist/assets/img'                  // Destination path prefix
      		}]
    	}
  	},	

  	assemble: {
	  	options: {
	  		flatten: true,
	    	assets: 'assets',
	    	//plugins: ['permalinks'],
	    	//partials: ['app/src/site-html/includes/**/*.hbs'],
	    	layoutdir: '<%= dirs.html %>layouts',
	    	data: ['<%= dirs.html %>data/*.{json,yml}']
	  	},
	  	siteDev: {
	  		options:{
	  			layout: 'default.hbs',
	  			production: false 
	  		},
	    	src: ['<%= dirs.html %>pages/*.hbs'],
	    	dest: '<%= dirs.www %>'
	  	}
	},

	// Watch task
	watch: {	
		options: {
			spawn: false //Spawn set to false for when you find there is a delay with tasks running when watch events are triggered. This can be set to true if this isn't an issue
		},
		gruntfile: {
			files: 'Gruntfile.js',
			options: {
		      	reload: true
		    }
		},			
	  	scss:{
	  		files:['<%= dirs.scss %>**/*.scss'],
	  		tasks:['sass:dev']
	  	},
	  	js:{
	  		files:['<%= dirs.js %>*.js'],
	  		tasks:['newer:jshint', 'newer:uglify:dev']
	  	},
	  	img:{
	  		files:['<%= dirs.img %>**/*.{png,jpg,gif}'],
	  		tasks:['newer:imagemin:dev']
	  	},
	  	assemble:{
	  		files:['<%= dirs.html %>**/*.hbs', '<%= dirs.html %>data/*.json'],
	  		tasks:['assemble:siteDev']
	  	},
	},

	browserSync: {
	    dev: {
	        bsFiles: {
	            src : ['<%= dirs.assets %>css/styles.css', '<%= dirs.www %>*.html', '<%= dirs.assets %>img/**/*.{png,jpg,gif}', '<%= dirs.assets %>js/**/*.js'],
	        },
	        options: {
	            //proxy: "",
	            //tunnel: "",
	            watchTask: true,
	            server: {
	            	baseDir: "www"
	            } 
	        }
	    }
	}
	
});

// Task to curl the API endpoint
grunt.registerTask('curlPagesData', [ 'curl:pagesMaster']); 

// Custom task that generate seperate data files per object returned and creates an empty handlebars template with the name of the page slugs
grunt.registerTask('data', 'Creates data files and empty pages from the returned JSON', function() {
	var pages = grunt.file.readJSON('app/assemble/data/pages.json');
	// Loop through the master pages json file
	for(var i = 0; i < pages.length; i++){
		var obj = pages[i];
		var slug = obj.slug;
		var stringy = JSON.stringify(obj);
		grunt.file.write('app/assemble/data/' + slug +'.json', stringy); // Create a json file per page
		console.log('wrote data file '+slug);
		if(!grunt.file.exists('app/assemble/pages/' + slug +'.hbs') || !grunt.file.exists('app/assemble/pages/index.hbs')){ // Check if the file exists
			if(slug === 'home' &&  !grunt.file.exists('app/assemble/pages/index.hbs')){
				grunt.file.write('app/assemble/pages/index.hbs', ''); // Create an empty handlebars file per page
				console.log('wrote file with name index');
			}else if(slug != 'home'){
				grunt.file.write('app/assemble/pages/' + slug +'.hbs', ''); // Create an empty handlebars file per page
				console.log('wrote file with name ' +slug);
			}	
		}else{
			console.log('file already exists');
		}
	}
});

// Runs curl and data task one after the other
grunt.registerTask('dataInit', ['curl:pagesMaster', 'data']);

grunt.registerTask('serve', [ 'jshint', 'uglify', 'sass:dev', 'assemble:siteDev', 'imagemin:dev', 'browserSync', 'watch']); 

};
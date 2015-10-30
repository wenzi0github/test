var gulp = require('gulp'),
    jshint = require( 'gulp-jshint' ),      // js代码检查    
    csslint = require( 'gulp-csslint' ),    // css检查
    notify = require( 'gulp-notify' ),      // 控制台文字描述
    gutil = require('gulp-util'),
    mapstream = require( 'map-stream' ),    // 代码检查报错时使用
    

    // 集成环境
    cache = require('gulp-cached'),
    header = require('gulp-header'),		// 向文件行首写入内容
    css_minify = require('gulp-minify-css'),// css压缩
    js_uglify = require('gulp-uglify'),     // js压缩
    concat = require('gulp-concat'),     // 文件合并
    imagemin = require('gulp-imagemin'),    // img压缩
    RevAll = require('gulp-rev-all'),
    fs = require('fs');


var colors = gutil.colors;
/*
http://jshint.com/docs/
file.jshint.success = true; // or false 
file.jshint.errorCount = 0; // number of errors returned by JSHint 
file.jshint.results = []; // JSHint errors, see [http://jshint.com/docs/reporters/](http://jshint.com/docs/reporters/) 
file.jshint.data = []; // JSHint returns details about implied globals, cyclomatic complexity, etc 
file.jshint.opt = {}; // The options you passed to JSHint 
*/

// js和css检查
var test = {
    js : mapstream(function (file, cb) {
        var fjshint = file.jshint;
        if (!fjshint.success) {
            console.log( '\n' );
            console.log( colors.red('[ '+fjshint.results.length+' errors in ]'+file.path) );
            
            fjshint.results.forEach(function (result) {
                var err = result.error;
                console.log( colors.grey('------------------------------------------------------------------------------') );
                console.log('[line ' + err.line + ', col ' + err.character + '] ' + err.reason);
                console.log( colors.grey('=> ') + colors.red(err.evidence) );
            });

            throw new gutil.PluginError( 'jslint', colors.red('Jshint failure, plese check the error message.') );
        }
        cb(null, file);
    }),

    css : mapstream(function (file, cb) {
        var fcsshint = file.csslint;
        if (!fcsshint.success) {
            console.log( '\n' );
            console.log( colors.red('[ '+fcsshint.results.length+' errors in ]'+file.path) );
            
            fcsshint.results.forEach(function (result) {
                var err = result.error;
                console.log( colors.grey('------------------------------------------------------------------------------') );
                console.log('[line ' + err.line + ', col ' + err.col + '] ' + err.message);
                console.log( colors.grey('=> ') + colors.red(err.evidence) );
            });

            throw new gutil.PluginError( 'csslint', colors.red('Csshint failure, plese check the error message.') );
        }
        cb(null, file);
    }),
    
    concat : function(version){
    	var filepath = '',
    		revAll = new RevAll({
	    	hashLength : 16,
	    	fileNameVersion : 'version-'+version+'.json',
	    	fileNameManifest : 'map-'+version+'.json',
	    	transformFilename: function (file, hash) {
	            console.log('revPathOriginal: '+file.revPathOriginal);
	            console.log('revFilenameOriginal: '+file.revFilenameOriginal);
	            console.log('revFilenameExtOriginal: '+file.revFilenameExtOriginal);
	            console.log('revHashOriginal: '+file.revHashOriginal);
	            console.log('revHash: '+file.revHash);
	            console.log('hash: '+hash);
	            filepath = file.revPathOriginal;
	            return hash.substr(0, 16)+file.revFilenameOriginal+file.revFilenameExtOriginal;
	        }
	    }),
	    date = new Date(),
	    msg = '/* Date: '+date.toLocaleString()+'  path:'+filepath+'*/\n';
	
	    return gulp.src('./css/index/**/*.css')
	        .pipe(concat('index.css'))
	        .pipe(cache('caching'))
	        .pipe(css_minify())
	        // .pipe(gulp.dest('./build'))
	        .pipe(revAll.revision())
	        .pipe(header(msg))
	        .pipe(gulp.dest('./build'))
	        .pipe(revAll.manifestFile())
	        .pipe(gulp.dest('./rev'))
	        .pipe(revAll.versionFile())
	        .pipe(gulp.dest('./rev'))
    }
}

// jshint任务
gulp.task('jshint', function() {
    return gulp.src('./js/*/*.js')  // js目录下所有的js文件
        .pipe(jshint())     // js代码检查
        .pipe(test.js);  // 若有错误，则调用myReporter进行提示
});
gulp.task('csslint', function() {
    return gulp.src('./css/*/*.css')  // js目录下所有的js文件
        .pipe(csslint())     // js代码检查
        .pipe(test.css); 
});

// 合并与压缩
gulp.task('concat', function(){
    var version = '0.0.0';
    
    // 读取git中最新的tag号
	fs.readdir('./.git/refs/tags', function(err, files){
		if(err){
			throw err;
		}
		version = files.pop();
		
		test.concat(version)
	})
})
// http://www.gulpjs.com.cn/docs/recipes/
gulp.task( 'default', ['concat'], function(){
    gulp.src( './conf/build.json', {
        read : false
    })
    .pipe(notify({
        message : 'All lint task complete, without error.'
    }));
});

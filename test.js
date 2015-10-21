var gulp = require('gulp'),
    jshint = require( 'gulp-jshint' ),      // js代码检查    
    csslint = require( 'gulp-csslint' ),    // css检查
    notify = require( 'gulp-notify' ),      // 合并代码
    gutil = require('gulp-util'),
    mapstream = require( 'map-stream' );    // 代码检查报错时使用

var colors = gutil.colors;
/*
http://jshint.com/docs/
file.jshint.success = true; // or false 
file.jshint.errorCount = 0; // number of errors returned by JSHint 
file.jshint.results = []; // JSHint errors, see [http://jshint.com/docs/reporters/](http://jshint.com/docs/reporters/) 
file.jshint.data = []; // JSHint returns details about implied globals, cyclomatic complexity, etc 
file.jshint.opt = {}; // The options you passed to JSHint 
*/
// js代码检查
var jsTest = mapstream(function (file, cb) {
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
});

// css代码检查
var cssTest = mapstream(function (file, cb) {
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
});

// jshint任务
gulp.task('jshint', function() {
    return gulp.src('./js/*/*.js')  // js目录下所有的js文件
        .pipe(jshint())     // js代码检查
        .pipe(jsTest);  // 若有错误，则调用myReporter进行提示
});
gulp.task('csslint', function() {
    return gulp.src('./css/*/*.css')  // js目录下所有的js文件
        .pipe(csslint())     // js代码检查
        .pipe(cssTest); 
});

gulp.task( 'default', ['jshint', 'csslint'], function(){
    // gulp.src( './conf/build.json', {
    //     read : false
    // })
    // .pipe(notify({
    //     message : '代码检查完毕，无错误！'
    // }));
    console.log( colors.green('All lint task complete, without error.') );
});

{
  "name": "global",
  "author": "yiguoc@jumei.com",
  "engines": {
    "node": ">= 0.8.0"
  },
  "devDependencies": {
    "gulp": "^3.8.9",
    "gulp-csslint": "^0.2.0",
    "gulp-jshint": "^1.8.6",
    "gulp-notify": "^2.2.0",
    "gulp-util": "^3.0.7",
    "map-stream": "0.0.6"
  }
}

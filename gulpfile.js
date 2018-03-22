const gulp=require('gulp');
const sass=require('gulp-sass');
const browserSync=require('browser-sync');
const useref = require('gulp-useref');
const runSequence = require('run-sequence');
const uglify = require('gulp-uglify');
const gulpIf = require('gulp-if');
const minifyCSS = require('gulp-minify-css');
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const del = require('del');
gulp.task('sass', function() {
    return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss
        .pipe(sass())
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});
gulp.task('watch', ['browserSync', 'sass'], function (){
    gulp.watch('app/scss/**/*.scss', ['sass']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('app/!*.html', browserSync.reload);
    gulp.watch('app/js/!**!/!*.js', browserSync.reload);
});
gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: 'app'
        },
    })
});
gulp.task('useref', function(){ // gulp-useref会将多个文件拼接成单一文件，并输出到相应目录。
    return gulp.src('app/!*.html')
    // Minifies only if it's a CSS file
        .pipe(gulpIf('*.css', minifyCSS()))
        // Uglifies only if it's a Javascript file
        .pipe(gulpIf('*.js', uglify()))
        .pipe(useref())
        .pipe(gulp.dest('dist'))
});
gulp.task('images', function(){
    return gulp.src('app/images/!**!/!*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
});
gulp.task('clean', function(callback) {
    del('dist');
    return cache.clearAll(callback);
});
gulp.task('clean:dist', function(callback){
    del(['dist/!**!/!*', '!dist/images', '!dist/images/!**/!*'], callback)
});
gulp.task('build', [`clean`, `sass`, `useref`, `images`, `fonts`], function (){
    console.log('Building files');
});
gulp.task('build', function (callback) {
    runSequence('clean:dist',
        ['sass', 'useref', 'images', 'fonts'],
        callback
    )
});
gulp.task('default', function (callback) {
    runSequence(['sass','browserSync', 'watch'],
        callback
    )
});

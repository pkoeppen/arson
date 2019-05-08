'use-strict';

const gulp = require('gulp');
const sync = require('browser-sync');
const exec = require('child_process').exec;
const sass = require('gulp-sass');
const eslint = require('gulp-eslint');

// Docker takes a second to get running. Wait for it to do so.
const DOCKER_START_INTERVAL = 1000;
const DOCKER_RESTART_INTERVAL = 2000;

const docker = {
  up() {
    // Spin up containers defined in docker-compose.yml.
    return new Promise(resolve => {
      exec('docker-compose up -d', error => {
        if (error) {
          return reject(error);
        }
        setTimeout(() => resolve(), DOCKER_START_INTERVAL);
      });
    });
  },
  restart() {
    // Restart the Ghost container.
    return new Promise(resolve => {
      exec('docker restart ghost_blog', error => {
        if (error) {
          return reject(error);
        }
        setTimeout(() => resolve(), DOCKER_RESTART_INTERVAL);
      });
    });
  }
};

gulp.task('reload', () => {
    // Restart Docker, then refresh the page.
    return docker.restart()
    .then(() => sync.reload());
});

gulp.task('lint', () => {
    // Lint main JS file.
    return gulp.src(['./content/themes/arson/assets/js/main.js'])
      .pipe(eslint())
      .pipe(eslint.format());
});

gulp.task('js', () => {
    // Stream JS to browser.
    return gulp.src(['./content/themes/arson/assets/js/main.js'])
      .pipe(sync.stream());
});

gulp.task('sass', () => {
    // Compile Sass.
    return gulp.src('./content/themes/arson/assets/sass/style.sass')
      .pipe(sass())
      .pipe(gulp.dest('./content/themes/arson/assets/css'))
      .pipe(sync.stream());
});

gulp.task('watch', () => {
    return docker.up()
    .then(() => {
        sync.init({
            proxy: 'localhost:2368'
        });
        gulp.watch('./content/themes/arson/assets/js/*.js', gulp.parallel('lint', 'js'));
        gulp.watch('./content/themes/arson/assets/sass/*.sass', gulp.series('sass'));
        gulp.watch('./content/themes/arson/**/*.hbs', gulp.series('reload'));
    });
});

gulp.task('default', gulp.series('sass', 'watch'));

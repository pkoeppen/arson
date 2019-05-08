'use-strict';

const gulp = require('gulp');
const sync = require('browser-sync');
const exec = require('child_process').exec;
const sass = require('gulp-sass');

const DOCKER_START_INTERVAL = 1000;
const DOCKER_RESTART_INTERVAL = 2000;

const docker = {
  up() {
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
    return docker.restart()
    .then(() => sync.reload());
});

gulp.task('sass', () => {
    return gulp.src("./content/themes/arson/assets/sass/*.sass")
      .pipe(sass())
      .pipe(gulp.dest("./content/themes/arson/assets/css"))
      .pipe(sync.stream());
});

gulp.task('watch', () => {
    return docker.up()
    .then(() => {
        sync.init({
            proxy: 'localhost:2368'
        });
        gulp.watch('./content/themes/arson/assets/sass/*.sass', gulp.series('sass'));
        gulp.watch('./content/themes/arson/**/*.hbs', gulp.series('reload'));
    });
});

gulp.task('default', gulp.series('watch'));

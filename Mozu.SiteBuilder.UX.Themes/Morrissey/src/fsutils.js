var fs = require('fs'),
    util = require('util'),
    fsMkdirp = require('mkdirp'),
    fsWalk = require('walk').walk,
    path = require('path'),
    EventEmitter = require('events').EventEmitter;



function noop() { }

var fsCopy = function(src, dst, cb, options) {
    options = options || {};
    function copyHelper(err) {
        var is
          , os
        ;

        if (!err && !options.overwrite) {
            return cb(new Error("File " + dst + " exists."));
        }

        fs.stat(src, function (err, stat) {
            if (err) {
                return cb(err);
            }

            is = fs.createReadStream(src);
            os = fs.createWriteStream(dst);

            util.pump(is, os, function (err) {
                if (err) {
                    return cb(err);
                }

                fs.utimes(dst, stat.atime, stat.mtime, cb);
            });
        });
    }

    cb = cb || noop;
    fs.stat(dst, copyHelper);
}

var fsCopyRecursive = function (src, dst, cb, options) {
    options = options || {};

    function syncDirs(cb, src, dst) {
        var walker = fsWalk(src)
        ;

        walker.on('directory', function (root, stat, next) {
            var newDir = path.join(dst, root.substr(src.length + 1), stat.name)
            ;

            fsMkdirp(newDir, stat.mode, next);
        });

        walker.on('end', function () {
            cb();
        });
    }

    function syncFiles(cb, src, dst) {
        var walker = fsWalk(src)
        ;

        walker.on('file', function (root, stat, next) {
            var curFile = path.join(root, stat.name)
              , newFile = path.join(dst, root.substr(src.length + 1), stat.name)
            ;

            fsCopy(curFile, newFile, function (err) {
                if (err) {
                    cb(err);
                    return;
                }
                next();
            }, { overwrite: true });
        });

        walker.on('end', function () {
            cb();
        });
    }

    dst = path.resolve(process.cwd(), dst);

    fsMkdirp(path.join(dst), function () {
        fs.realpath(src, function (err, rsrc) {
            fs.realpath(dst, function (err, rdst) {
                syncDirs(function () {
                    syncFiles(cb, rsrc, rdst);
                }, rsrc, rdst);
            });
        });
    });
}


module.exports.copy = fsCopy;
module.exports.copyRecursive = fsCopyRecursive;
module.exports.removeRecursive = require('rimraf');
module.exports.walkDir = fsWalk;
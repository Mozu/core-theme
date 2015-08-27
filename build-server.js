var net = require('net')
var exec = require('child_process').exec
var colors = require('colors')
var gaze = require('gaze')
var argv = require('optimist').argv
var ncp = require('ncp').ncp
var crypto = require('crypto')
var destinationDir = 'C:/Git/Mozu2'
var fs = require('fs')

var reIgnore = /((\/|\\)((\.git)|(bin)|(ext-.+)|(obj)|(packages)|(node_modules)|(ext\/builds)|(Scripts\/build))(\/|\\))|(.DS_Store)|(.exe)|(.zip)/
var dirIgnore = /(\/|\\)((\.git)|(bin)|(ext-.+)|(obj)|(packages)|(node_modules)|(ext\/builds)|(Scripts\/build))$/

var start = new Date()

var accept = function(socket) {

    socket.setKeepAlive(true)
    socket.on('error', function(e) {
        log("ERROR")
        log(e)
    });
    socket.on('close', function() {
        log("CLOSE")
    });
    socket.on('end', function() {
        log("END")
    });

    socket.on('data', function(data) {
        var msg = data.toString()

        if (typeof ops[msg] !== 'function') return

        ops[msg](socket)
    })

    log('OPEN')
    //socket.pipe(socket)
    
    socket.write('first connect open\n')
}


var ops = { 
    msbuild: function(socket) {
        var errors = 0,
            warnings = 0,
            cmd,
            child

        cmd = 'msbuild Mozu.SiteBuilder.sln /p:BuildingInsideVisualStudio=true;Configuration=Debug;Platform="Any CPU" /v:q';

        socket.write(log(10, cmd))
        child = exec(cmd, {maxBuffer: 200*1024*20}, function(error, stdout, stderr) {
            if (error !== null) {
                log('stderr: ' + stderr)
                log('exec error: ' + error)
                socket.write('\n======ERROR======'.red)
            }

            socket.write('\n\n  Errors:   ' + errors.toString().red)
            socket.write('\n  Warnings: ' + warnings.toString().yellow + '\n\n')

            socket.write('msbuild complete')
        })

        child.stdout.on('data', function(data) {
            if (!data) return
            var str = data.toString()
            if (str.indexOf(': warning ') > 0) {
                warnings++
                socket.write(str.yellow)
                return
            }
            if (str.indexOf(': error ') > 0) {
                errors++
                socket.write(str.red)
                return
            }
            socket.write(str)   
        })
    },
    restoreNuget: function(socket) {
            var cmd,
            child

        cmd = 'nuget restore';

        socket.write(log(10, cmd))
        child = exec(cmd, {maxBuffer: 200*1024*20}, function(error, stdout, stderr) {
            if (error !== null) {
                log('stderr: ' + stderr)
                log('exec error: ' + error)
                socket.write('\n======ERROR======\n'.red)
            }

            socket.write('nuget complete')
        })

        child.stdout.on('data', function(data) {
            if (!data) return
            socket.write(data)   
        })
    },
    buildSencha: function(socket) {
        var errors = 0,
            warnings = 0,
            cmd,
            child

        cmd = 'sencha -q --cwd "Mozu.SiteBuilder.UX.Admin\\Scripts" app build';

        socket.write(log(10, cmd))
        child = exec(cmd, {maxBuffer: 200*1024*20}, function(error, stdout, stderr) {
            if (error !== null) {
                log('stderr: ' + stderr)
                log('exec error: ' + error)
                socket.write('\n======ERROR======'.red)
            }

            socket.write('\n\n  Errors:   ' + errors.toString().red)
            socket.write('\n  Warnings: ' + warnings.toString().yellow + '\n\n')

            socket.write('sencha build complete')
        })

        child.stdout.on('data', function(data) {
            if (!data) return
            var str = data.toString()
            if (str.indexOf('[WRN]') > -1) {
                warnings++
                socket.write(str.yellow)
                return
            }
            if (str.indexOf('[ERR]') > -1) {
                errors++
                socket.write(str.red)
                return
            }
            socket.write(str)
        })
    },

    buildSass: function(socket) {
        var cmd,
            child

        cmd = 'sencha -q --cwd "Mozu.SiteBuilder.UX.Admin\\Scripts" ant sass';

        socket.write(log(10, cmd))
        child = exec(cmd, {maxBuffer: 200*1024*20}, function(error, stdout, stderr) {
            if (error !== null) {
                log('stderr: ' + stderr)
                log('exec error: ' + error)
                socket.write('\n======ERROR======\n'.red)
            }

            socket.write('sencha sass complete')
        })

        child.stdout.on('data', function(data) {
            if (!data) return
            socket.write(data)   
        })
    },

    clone: function() {
        var fnUpdate,
            fnRemove

        fnUpdate = function() {
            log(9, '*** Adding/Updating files ***'.yellow)

            var getHash = function(file) {
                var stream = fs.createReadStream(file),
                    hash = crypto.createHash('sha1'),
                    chunk

                hash.setEncoding('hex')

                console.log('read', stream.read())

                // while (null !== (chunk = stream.read())) {
                //     console.log('READ %d bytes of data', chunk.length)
                // }
                console.log('done')
                return 0
            }

            ncp(__dirname, destinationDir, {
                clobber: true,
                filter: function(source) {
                    var copy = !reIgnore.test(source),
                        statSource = fs.statSync(source),
                        destPath,
                        statDest,
                        update

                    if (!copy) return false

                    destPath = destinationDir + source.substr(__dirname.length)

                    update = fs.existsSync(destPath)

                    if (update && statSource.isFile()) {
                        statDest = fs.statSync(destPath)
                        log(1, destPath, '\n', statSource, '\n', statDest)

                        copy = statSource.size !== statDest.size
                                || statSource.mode !== statDest.mode
                                || statSource.atime.getTime() !== statDest.atime.getTime()

                        if (copy) getHash(source)
                    }
                    
                    if (statSource && statSource.isFile()) {
                        if (copy) log(update ? source.yellow : source.green)
                        else log(2,'SKIP file'.red, source)
                    } else if (statSource && statSource.isDirectory()) {
                        copy = copy && !dirIgnore.test(source)
                        if (copy) log(2, source.blue)
                        else log(2, 'SKIP  dir'.red, source)
                    }

                    //return false
                    return copy
                }
            }, function(err) {
                if (err) {
                    return console.error(err)
                }
                log('update is complete')


                fnRemove()
            })
        }

        fnRemove = function() {
            log(9, '*** Removing files ***'.yellow)

            var async = 0

            var fnCheckAsync = function() {
                --async
                //log('async'.blue, --async)
                if (!async) {


                    log(9, ('\n\tElapsed build time: ' +  printElapsed()).green)
                }
            }

            var walk = function(dir) {
                async++
                fs.readdir(dir, function(err, list) {
                    var pending = list.length

                    pending = list.length

                    list.forEach(function(file) {
                        var sourceFile
                        
                        file = dir + '/' + file

                        if (reIgnore.test(file)) return

                        sourceFile = __dirname + file.substr(destinationDir.length)

                        if (!fs.existsSync(sourceFile)) {
                            log(('TBR: ' + file).red)
                            removeFileOrDir(file)
                            return
                        }

                        async++
                        fs.stat(file, function(err, stat) {
                            if (stat && stat.isDirectory())
                                if (!dirIgnore.test(file))
                                    walk(file)
                                else
                                    log(2, 'ignoring'.green, file)
                            fnCheckAsync()
                        })
                    })
                    fnCheckAsync()
                })
            }

            walk(destinationDir)
        }

        fnUpdate()
    },

    test: function() {
        log(__dirname, __dirname.toString(), __dirname.toString().length, __dirname.length)
    }
}

var log = function(level) {
    var output = '',
        args = Array.prototype.slice.call(arguments, 0)

    if (typeof level !== 'number' || level < 0 || level > 10) {
        level = 5
    } else {
        args = Array.prototype.slice.call(args, 1)
    }

    //console.log('stuff', level, args)

    if (level < verbosity) return

    if (level == 10) {
        args.unshift('\nಠ_ಠ > '.blue)

        if (typeof args[1] === 'string') args[1] = args[1].green

        args.push('\n')
    }

    console.log.apply(console, args)

    return args.join(' ')
}

var printElapsed = function() {
    var delta = new Date() - start,
        minutes,
        seconds
        
    minutes = Math.floor(delta / 1000 / 60)
    seconds = Math.floor((delta - minutes * 1000 * 60) / 1000)
    milliseconds = Math.floor(delta - minutes * 1000 * 60 - seconds * 1000)

    minutes = minutes.toString()
    seconds = seconds.toString()
    milliseconds = milliseconds.toString()

    if (seconds.length === 1) seconds = '0' + seconds
    if (milliseconds.length === 1) milliseconds = '00' + milliseconds
    else if (milliseconds.length === 2) milliseconds = '0' + milliseconds

    return minutes + ':' + seconds + '.' + milliseconds
}

var removeFileOrDir = function(file) {
    var stat = fs.statSync(file)

    if (file === '.' || file === '..' || !stat) return

    if (stat.isDirectory()) {
        fs.readdirSync(file).forEach(function(item) {
            removeFileOrDir(file + '/' + item)
        })
        fs.rmdirSync(file)
    } else {
        fs.unlinkSync(file)
    }
}

if (argv.q) {
    verbosity = 9
} else if (argv.d) {
    verbosity = 0
} else {
    verbosity = 4
}

if (argv.clone) {
    ops.clone()
    // reIgnore = /(\/|\\)((\.git)|(bin))(\/|\\)/
    // var str = 'Z:/Mozu/.git/logs'
    // log(str, reIgnore.test(str))
    // str = 'Z://Mozu/logs'
    // log(str, reIgnore.test(str))
    // str = 'Z:/Mozu/bin/stuff'
    // log(str, reIgnore.test(str))
    // str = 'Z:/Mozu/binary/stuff'
    // log(str, reIgnore.test(str))
} else if (argv.test) {
    ops.test()
} else {
    var server = net.createServer(accept)
    server.listen(8124, function() {
        log('server bound');
    })
}
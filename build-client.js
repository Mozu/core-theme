var net = require('net')
var argv = require('optimist').argv
var exec = require('child_process').exec
var spawn = require('child_process').spawn
var colors = require('colors')

var start = new Date()

var pull = function() {
    var cmd = 'git tf pull --rebase'
    if (argv.pull || argv.p || argv.checkin || argv.c) {
        log(cmd)
        child = exec(cmd, {maxBuffer: 200*1024*50}, function(error, stdout, stderr) {
            pullConfig()
        })

        child.stdout.on('data', function(data) {
            process.stdout.write(data)
        })

    } else {
        pullConfig()
    }
}

var pullConfig = function() {
    var cmd = 'git tf pull --rebase   # Trying to pull ../Mozu Configs'
    if (argv.pull || argv.p || argv.checkin || argv.c) {
        log(cmd)
        child = exec(cmd, {cwd: '../Mozu Configs', maxBuffer: 200*1024*20}, function(error, stdout, stderr) {
            checkin()
        })

        child.stdout.on('data', function(data) {
            process.stdout.write(data)
        })

    } else {
        checkin()
    }
}

var checkin = function() {
    var cmd = 'git tf checkin --no-lock --no-metadata'
    if (argv.checkin || argv.c) {
        log(cmd)
        child = exec(cmd, {maxBuffer: 200*1024*20}, function(error, stdout, stderr) {
            restoreNuget()
        })

        child.stdout.on('data', function(data) {
            process.stdout.write(data)
        })

    } else {
        restoreNuget()
    }
}

var restoreNuget = function() {
    if (!(argv.ignore || argv.i) || argv.nuget || argv.n) {
        connection.write('restoreNuget')
        connection.on('data', function(data) {
            if (data.toString().indexOf('nuget complete') < 0) return
            msbuild()
        })
    } else {
        msbuild()
    }
}

var msbuild = function() {
    if (!argv.ignore && !argv.i) {
        connection.write('msbuild')
        connection.on('data', function(data) {
            var str = data.toString()
            if (str.indexOf('msbuild complete') < 0) return
            senchaBuild()
        })
    } else {
        senchaBuild()
    }
}

var senchaBuild = function() {
    if (argv.javascript || argv.j) {
        connection.write('buildSencha')
        connection.on('data', function(data) {
            if (data.toString().indexOf('sencha build complete') < 0) return
            connection.end()
        })
    } else {
        sassBuild()
    }
}

var sassBuild = function() {
    if (!(argv.javascript || argv.j) && (argv.sass || argv.s)) {
        connection.write('buildSass')
        connection.on('data', function(data) {
            if (data.toString().indexOf('sencha sass complete') < 0) return
            connection.end()
        })
    } else {
        connection.end()
    }
}

var log = function(val) {
    console.log('\nಠ_ಠ > '.blue + val.green)
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

if (argv.help || argv.h) {
    console.log('Options:\n'.green)
    console.log('    (no arguments)   '.blue + 'Run Nuget Restore and then run MSBuild on the solution')
    console.log('    --pull       -p  '.blue + 'Pull from TFS before running NugetRestore and MSBuild')
    console.log('    --checkin    -c  '.blue + 'Pull and Checkin code from TFS before running NugetRestore and MSBuild')
    console.log('    --javascript -j  '.blue + 'Sencha build JS and SASS')
    console.log('    --sass       -s  '.blue + 'Compile the SASS')
    console.log('    --nuget      -n  '.blue + 'Restore Nuget')
    console.log('    --ignore     -i  '.blue + 'Skip the MSBuild step')
    console.log()
} else {
    var connection = (function() {
        var socket = new net.Socket()
        socket.setKeepAlive(true)
        socket.on('data', function(data) {
            process.stdout.write(data)
            if (data.toString().indexOf('first connect open') > -1) pull()
        })
        socket.on('error', function(e) {
            console.log('error')
            console.log(e)
        })
        socket.on('close', function() {
            console.log(('\n\tElapsed build time: ' +  printElapsed()).green)
            console.log('\nclosing connection')
        })
        socket.on('end', function() {
            console.log('\nconnection ending')
        })

        socket.connect(8124, 'mozu.volusion.com')

        return socket
    }())
}
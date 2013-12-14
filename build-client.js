var net = require('net')
var argv = require('optimist').argv
var exec = require('child_process').exec
var colors = require('colors')

var pull = function() {
    var cmd = 'git tf pull --rebase'
    if (argv.pull || argv.p || argv.checkin || argv.c) {
        log(cmd)
        child = exec(cmd, function(error, stdout, stderr) {  
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
        child = exec(cmd, function(error, stdout, stderr) {  
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
            if (data.toString().indexOf('msbuild complete') < 0) return
            connection.end()
        })
    } else {
        connection.end()
    }
}

var log = function(val) {
    console.log('\nಠ_ಠ > '.blue + val.green)
}

if (argv.help || argv.h) {
    console.log('Options:\n'.green)
    console.log('    (no arguments) '.blue + 'Run Nuget Restore and then run MSBuild on the solution')
    console.log('    --pull     -p  '.blue + 'Pull from TFS before running NugetRestore and MSBuild')
    console.log('    --checkin  -c  '.blue + 'Pull and Checkin code from TFS before running NugetRestore and MSBuild')
    console.log('    --nuget    -n  '.blue + 'Restore Nuget')
    console.log('    --ignore   -i  '.blue + 'Skip the MSBuild step')
    console.log()
} else {
    var connection = (function () {
        var socket = new net.Socket()
        socket.setKeepAlive(true)
        socket.on('data', function (data) {
            process.stdout.write(data)
            if (data.toString().indexOf('first connect open') > -1) pull()
        })
        socket.on('error', function (e) {
            console.log('error')
            console.log(e)
        })
        socket.on('close', function () {
            process.stdout.write('\n')
            console.log('closing connection')
        })
        socket.on('end', function () {
            console.log('\nconnection ending')
        })

        socket.connect(8124, 'mozu.volusion.com')

        return socket
    }())
}


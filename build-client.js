var net = require('net')
var argv = require('optimist').argv
var exec = require('child_process').exec

var connection = (function () {
    var socket = new net.Socket()
    socket.setKeepAlive(true)
    socket.on('data', function (data) {
        process.stdout.write(data)
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

var restoreNuget = function() {
    if (!argv.nuget && !argv.n) {
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
    if (!argv.build && !argv.b) {
        connection.write('msbuild')
        connection.on('data', function(data) {
            if (data.toString().indexOf('msbuild complete') < 0) return
            connection.end()
        })
    } else {
        connection.end()
    }
}

if (!argv.pull && !argv.p) {
    child = exec('git tf pull --rebase', function(error, stdout, stderr) {  
         restoreNuget()
    })

    child.stdout.on('data', function(data) {
        process.stdout.write(data)
    })

} else {
    
    restoreNuget()

}
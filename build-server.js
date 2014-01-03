var net = require('net')
var exec = require('child_process').exec
var colors = require('colors')

var accept = function(socket) {

    socket.setKeepAlive(true)
    socket.on('error', function(e) {
        console.log("ERROR")
        console.log(e)
    });
    socket.on('close', function() {
        console.log("CLOSE")
    });
    socket.on('end', function() {
        console.log("END")
    });

    socket.on('data', function(data) {
        var msg = data.toString()

        if (typeof ops[msg] !== 'function') return

        ops[msg](socket)
    })

    console.log('OPEN')
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

        socket.write(log(cmd))
        child = exec(cmd, {maxBuffer: 200*1024*20}, function(error, stdout, stderr) {
            if (error !== null) {
                console.log('stderr: ' + stderr)
                console.log('exec error: ' + error)
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

        socket.write(log(cmd))
        child = exec(cmd, {maxBuffer: 200*1024*20}, function(error, stdout, stderr) {
            if (error !== null) {
                console.log('stderr: ' + stderr)
                console.log('exec error: ' + error)
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

        socket.write(log(cmd))
        child = exec(cmd, {maxBuffer: 200*1024*20}, function(error, stdout, stderr) {
            if (error !== null) {
                console.log('stderr: ' + stderr)
                console.log('exec error: ' + error)
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

        socket.write(log(cmd))
        child = exec(cmd, {maxBuffer: 200*1024*20}, function(error, stdout, stderr) {
            if (error !== null) {
                console.log('stderr: ' + stderr)
                console.log('exec error: ' + error)
                socket.write('\n======ERROR======\n'.red)
            }

            socket.write('sencha sass complete')
        })

        child.stdout.on('data', function(data) {
            if (!data) return
            socket.write(data)   
        })
    }
}

var log = function(val) {
    return '\nಠ_ಠ > '.blue + val.green + '\n'
}

var server = net.createServer(accept)
server.listen(8124, function() {
    console.log('server bound');
})
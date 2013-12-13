var net = require('net')
var exec = require('child_process').exec

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
    
    socket.write('\nConnected')
        
    socket.write('\nStarting build... please wait\n\n')
}


var ops = { 
    msbuild: function(socket) {
        var cmd,
            child

        cmd = 'msbuild Mozu.SiteBuilder.sln /p:BuildingInsideVisualStudio=true;Configuration=Debug;Platform="Any CPU"';

        socket.write('\n\t\t> ' + cmd)
        child = exec(cmd, {maxBuffer: 200*1024*20}, function(error, stdout, stderr) {
            if (error !== null) {
                console.log('stderr: ' + stderr)
                console.log('exec error: ' + error)
                socket.write('\n\n======ERROR======')
            }

            socket.write('msbuild complete')
        })

        child.stdout.on('data', function(data) {
            if (!data) return
            socket.write(data)   
        })
    },
    restoreNuget: function(socket) {
            var cmd,
            child

        cmd = 'nuget restore';

        socket.write('\n\t\t> ' + cmd)
        child = exec(cmd, {maxBuffer: 200*1024*20}, function(error, stdout, stderr) {
            if (error !== null) {
                console.log('stderr: ' + stderr)
                console.log('exec error: ' + error)
                socket.write('\n\n======ERROR======')
            }

            socket.write('nuget complete')
        })

        child.stdout.on('data', function(data) {
            if (!data) return
            socket.write(data)   
        })
    }
}

var server = net.createServer(accept)
server.listen(8124, function() {
    console.log('server bound');
})
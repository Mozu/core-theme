var net = require('net')
var exec = require('child_process').exec
var build = function(socket) {
    socket.setKeepAlive(true)
    // socket.on('data', function(data) {
    //     console.log("DATA");
    //     console.log(data);
    // });
    socket.on('error', function(e) {
        console.log("ERROR");
        console.log(e);
    });
    socket.on('close', function() {
        console.log("CLOSE");
    });
    socket.on('end', function() {
        console.log("END");
    });
    console.log('OPEN');
    socket.pipe(socket)
    socket.write('Connected')
    socket.write('\tStarting build... please wait')
    socket.write('\n\t\t> nuget restore')
    exec('nuget restore', function(error, stdout, stderr) {
        socket.write(stdout)
        if (error !== null) {
            console.log('stderr: ' + stderr)
            console.log('exec error: ' + error)
        }

        socket.write('\n\t\t> msbuild /p:BuildingInsideVisualStudio=true')
        exec('msbuild /p:BuildingInsideVisualStudio=true', function(error, stdout, stderr) {
            socket.write(stdout)
            if (error !== null) {
                console.log('stderr: ' + stderr)
                console.log('exec error: ' + error)
            }

            socket.write('\n\n\t Build Completed')
            socket.end()
        })
    })
}

var server = net.createServer(build)
server.listen(8124, function() {
    console.log('server bound');
})
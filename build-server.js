var net = require('net')
var exec = require('child_process').exec
var build = function(socket) {
    var cmd,
        buildChild

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
    console.log('OPEN')
    socket.pipe(socket)
    socket.write('Connected')
    socket.write('\tStarting build... please wait')

    cmd = 'msbuild Mozu.SiteBuilder.sln /p:BuildingInsideVisualStudio=true;Configuration=Debug;Platform="Any CPU"';

    socket.write('\n\t\t> ' + cmd)
    buildChild = exec(cmd, {maxBuffer: 200*1024*20}, function(error, stdout, stderr) {
        if (error !== null) {
            console.log('stderr: ' + stderr)
            console.log('exec error: ' + error)
            socket.write('\n\n======ERROR======')
        }

        socket.write('\n\n\t Build Completed')
        socket.end()
    })

    buildChild.stdout.on('data', function(data) {
        if (!data) return
        socket.write(data)   
    })
}

var server = net.createServer(build)
server.listen(8124, function() {
    console.log('server bound');
})
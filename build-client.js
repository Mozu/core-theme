var net = require('net');

var build = function () {
    var socket = new net.Socket()
    socket.setKeepAlive(true)
    socket.on('data', function (data) {
        var msg = data.toString()
        console.log(msg)
    })
    socket.on('error', function (e) {
        console.log('ERROR')
        console.log(e)
    })
    socket.on('close', function () {
        console.log('closing connection')
    })
    socket.on('end', function () {
        console.log('connection ending')
    })

    socket.connect(8124, 'mozu.volusion.com', function () {
        //console.log('connected');
    })

    return socket
}

var client = build()
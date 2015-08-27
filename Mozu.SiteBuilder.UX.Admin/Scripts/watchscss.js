var watchTimeout
var watched = []
var dir = __dirname + '\\sass\\src'
var senchaDir = __dirname
var finder = require('findit')(dir)
var path = require('path')
var fs = require('fs')
var exec = require('child_process').exec
var building = false
var rerun = false
var process

var isWatched = function (dir) {
    for (var i = 0; i < watched.length; i++) {
        if (dir === watched[i]) return true
    }
    return false
}

var fnWatch = function (dir) {
    return function (e, filename) {
        var p = dir + '\\' + filename

        if (!filename || !filename.match) return

        if (!fs.existsSync(p)) return

        if (fs.lstatSync(p).isDirectory()) {
            if (isWatched(p)) return
            fs.watch(p, fnWatch(p))
            watched.push(p)
            return
        }

        if (!filename.match(/.scss$/)) return

        console.log('Changed Detected: ', p);

        if (building) {
            rerun = true
            console.log('\t\tCurrently Building, will rerun after build completes')
            return
        }

        clearTimeout(watchTimeout);

        watchTimeout = setTimeout(fnExec, 500)
    }
}

var fnExec = function () {
    var cmd = 'sencha ant sass -cw "' + senchaDir + '"' 
    building = true
    console.log('\n\tCompiling SASS')
    process = exec(cmd, function (error, stdout, stderr) {
        if (error) {
            console.log('\t\tbuild error', error)
        } else {
            console.log('\t\tBuild success, waiting for next change...\n\n')
        }
        building = false
        if (rerun) {
            rerun = false
            fnExec()
        }
    })
}

finder.on('directory', function (dir) {
    watched.push(dir)
    fs.watch(dir, fnWatch(dir))
})

watched.push(dir)
fs.watch(dir, fnWatch(dir))

console.log('\n\tWatching for changes: \n\t\t', dir, '\n')
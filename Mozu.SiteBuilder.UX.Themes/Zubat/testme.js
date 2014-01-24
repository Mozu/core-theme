var zubat = require('./src/zubat'),
    color = require('cli-color'),
    bat = zubat(process.argv[process.argv.length - 1], { logLevel: 2 }, function () {
        console.log('cb called, it worked');
        process.exit();
    }),
    fmts = {
        error: color.red.bold,
        info: color.bold,
        success: color.green.bold
    };
bat.on('log', function (str, sev, level) {
    console.log(fmts[sev]('[' + sev.toUpperCase() + ']') + ' ' + str + ' level:' + level);
});
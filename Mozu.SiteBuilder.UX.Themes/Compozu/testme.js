var compozu = require('./src/compozu'),
    color = require('cli-color'),
    compozer = compozu(process.argv[process.argv.length - 1], { logLevel: 2 }, function () {
        console.log('cb called, it worked');
        process.exit();
    }),
    fmts = {
        error: color.red.bold,
        info: color.bold,
        success: color.green.bold
    };
compozer.on('log', function (str, sev, level) {
    console.log(fmts[sev]('[' + sev.toUpperCase() + ']') + ' ' + str + ' level:' + level);
});
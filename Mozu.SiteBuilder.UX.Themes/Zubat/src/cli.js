var zubat = require('./zubat'),
    logger = require('./logger'),
    color = require('cli-color'),
    pkg = require('../package.json'),
    program = require('optimist')
        .usage("Compress and optimize scripts in a Mozu theme, respecting theme inheritance. \nUsage: zubat [options] <themePath>")
        .alias('o', 'dest')
        .describe('o', 'Specify a destination other than the default /compiled/scripts directory of your theme.')
        .alias('m', 'manualancestry')
        .describe('m', 'Specify theme ancestry at the command line instead of analyzing it through theme.json. \nExample: zubat -m ../parentThemeDir -m ../grandparentThemeDir -m ../Core4\n\n')
        .boolean('v')
        .alias('v', 'verbose')
        .describe('v', 'Talk a lot.')
        .boolean('q')
        .alias('q', 'quiet')
        .describe('q', 'Don\'t talk at all.')
        .describe('version', 'Print version information and exit.')
        .check(function (argv) {
            if (!argv.version && (!argv._ || !argv._[0])) {
                logger.error("No theme path provided.");
                throw "You must supply a theme path."
            }
        }).argv;

var themePath = program._ && program._[0];

if (program.version) {
    console.log(pkg.version);
    process.exit(1);
}
program.logLevel = 1;
if (program.verbose) program.logLevel = 2;
if (program.quiet) program.logLevel = 0;


module.exports = {
    run: function () {
        zubat(themePath, program, function () {
            if (!program.quiet) logger.success('All tasks complete!');
            process.exit(0);
        }).on('log', function (str, sev, level) {
            logger[sev](str);
        });
    }
}
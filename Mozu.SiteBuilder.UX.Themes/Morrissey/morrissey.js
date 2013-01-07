var util = require('util'),

    Lyrically = require('./src/lyrically'),
    Theme = require("./src/theme"),
    Optimizer = require("./src/optimizer"),
    
    program = require('commander');

program
    .version('0.1.0')
    .option('-j, --build-js', 'Compile JavaScript using r.js')
    .option('-r, --remove-untouched-files', 'Remove all files that have not been modified from the base theme.')
    //.option('-l, --check-less', 'Check LessCSS and theme settings for errors')
    .option('-v, --verbose', 'Talk a lot, mostly about emotions')
    .option('-a, --autogenerate-theme-settings', 'Look through stylesheets for theme settings and autogenerate a simple ThemeSettings.xml file')
    .option('-n, --no-inheritance', 'Do not build an inherited theme based on this theme\'s declared base theme. Not recommended.')
    .option('-d, --themes-dir [dir]', 'Parent directory for all themes. Defaults to current directory. [./]', process.cwd())

    .on('--help', function(){
        Lyrically.note("I am a wry and melancholy theme builder for Mozu.");
        console.log("");
        console.log('  Examples:');
        console.log('');
        console.log('    $ node morrissey -rj Stripes');
        console.log('         Compile JavaScript in the Stripes theme and remove untouched files inherited from the core theme.');
        console.log('');
        console.log('    $ node morrissey -rv Ghurka -d ../../../Themes');
        console.log('         Removed untouched files in Ghurka, expecting Ghurka to be in the passed Themes directory.');
        console.log("");
        Lyrically.whine("Remember that if your theme is in TFS source control, you need to check out your entire Themes directory to use this tool.");
        console.log("");
    })
    .parse(process.argv);

program.currentThemeName = program.args[0];
module.exports = {
    run: function () {
        if (!program.currentThemeName) {
            Lyrically.lament("Please supply a theme name.");
            util.puts("");
            process.exit(1);
        }

        var theme = new Theme(program.currentThemeName, program),
            optimizer = new Optimizer(theme, program);


        optimizer.on('success', function (summary) {
            if (summary) Lyrically.note(summary);
            Lyrically.admit("Your theme built successfully.");
            util.puts("");
            process.exit(0);
        });

        optimizer.on('failure', function (errors) {
            Lyrically.lament(errors);
            Lyrically.lament('Your theme did not build successfully.');
            util.puts("");
            process.exit(1);
        });

        optimizer.run();
    }
};
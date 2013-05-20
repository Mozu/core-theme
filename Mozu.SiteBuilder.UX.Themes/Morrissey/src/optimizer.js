var util = require('util'),
    events = require('events'),
    path = require('path'),
    Lyrically = require('./lyrically'),
    grunt = require('grunt');

var allTasks = {
    'generatethemeconfig': 'Generates a theme.xml file from user input.',
    'buildtemptheme': 'Generates a theme.xml file from user input.',
    'removeuntouchedfiles': 'Removes files that are identical to the base theme version, since such files are unnecessary and will override intended changes to the base theme',
    'buildjs': 'Generates optimized JavaScript files using r.js'
};
for (var taskName in allTasks) {
    grunt.registerMultiTask(taskName, allTasks[taskName], require('./tasks/' + taskName));
}


var Optimizer = function (theme, program) {

    events.EventEmitter.call(this);

    this.theme = theme;
    this.program = program;
    this.tasks = [];

    if (!(program.generateThemeConfig || program.removeUntouchedFiles || program.buildJs)) {
        Lyrically.whine("Please specify an action to take on the theme '" + program.currentThemeName + "'.", false);
        Lyrically.note("Run 'moz -h' to see available actions.");
        util.puts("");
        process.exit(1);
    }

    if (program.generateThemeConfig) {
        this.tasks.push('generatethemeconfig');
    } else if (!theme.has("themeConfig")) {
        Lyrically.whine("No theme config found.");
        this.tasks.push("generatethemeconfig");
    }


    if (program.removeUntouchedFiles) {
        this.tasks.push('removeuntouchedfiles');
    }

   if (program.buildJs) {
        this.tasks.push("buildtemptheme");
        this.tasks.push('buildjs');
    }

    //grunt.file.setBase(theme.baseDir);

    grunt.option.init({});

    Optimizer.current = this;

};

util.inherits(Optimizer, events.EventEmitter);



Optimizer.prototype.run = function () {
    var self = this;

    // create a stupid gruntfile since stupid grunt needs one
    var gConf = {};
    for (var tn in allTasks) {
        gConf[tn] = { build: {} };
    }
    grunt.file.write('Gruntfile.js', 'module.exports = function(grunt) { grunt.initConfig(' + JSON.stringify(gConf) + ') };');

    try {
        grunt.option('optimizer', this);
        grunt.tasks(this.tasks, { verbose: self.program.verbose }, function () {
            self.cleanup();
            self.emit('success');
        });
        complete = true;
    } catch (e) {
        self.cleanup();
        self.emit('failure', e.message);
    }
};

Optimizer.prototype.cleanup = function () {
    var self = this;
    if (this.tempTheme) {
        if (this.program.verbose) Lyrically.note('Deleting temporary files.', false);
        //console.log(this.program.themesDir)
        //console.log(path.resolve(this.program.themesDir))
        grunt.file.delete('Gruntfile.js');
        grunt.file.setBase(path.resolve(this.program.themesDir));
        try {
            grunt.file.delete(this.tempTheme.baseDir);
            if (this.program.verbose) Lyrically.admit('Successfully deleted temporary files.');
        } catch (e) {
            Lyrically.lament("There was an error cleaning up temporary files. You may have to delete this directory manually: " + this.tempTheme.baseDir);
        }
    }
};

module.exports = Optimizer;
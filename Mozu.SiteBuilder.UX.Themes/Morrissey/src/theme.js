var util = require('util'),
    fs = require('fs'),
    path = require('path'),
    Q = require('q'),
    elementtree = require('elementtree'),
    Lyrically = require('./lyrically');

var existsSync = fs.existsSync || path.existsSync; // for backwards compatibility with node <0.8

var Theme = function (name, program) {
    if (program.verbose) console.log("Reading theme " + name + ".");
    this.name = name;
    this.program = program;
    this._has = {};
    this.baseDir = path.resolve(this.program.themesDir, name);

    if (!existsSync(this.baseDir)) {
        Lyrically.lament(this.name + " not found in " + this.baseDir);
        throw new Error("Couldn't build theme.");
    }

};

Theme.prototype = {

    baseTheme: null,

    getBaseTheme: function () {
        if (this.baseTheme) return this.baseTheme;
        var config = this.getThemeConfig();
        if (!config) {
            Lyrically.lament("Cannot get base theme without theme.xml config specifying a base theme.");
            throw new Error("Ack!");
        }
        if (!this.baseTheme && config.extends) {
            Lyrically.note('Extending ' + this.name + " over " + config.extends + ".")
            this.baseTheme = new Theme(config.extends, this.program)
        }
        return this.baseTheme;
    },

    getAncestry: function(acc) {
        acc = acc || [this];
        if (this.baseTheme) {
            acc.unshift(this.baseTheme);
            return this.baseTheme.getAncestry(acc);
        } else {
            return acc;
        }
    },

    has: function (thing) {
        if (!(thing in this._has)) {
            this._has[thing] = existsSync(this.getPath(thing));
        }
        return this._has[thing];
    },
    paths: {
        themeConfig: ["theme.xml"],
        settings: ["MetaData","ThemeSettings.xml"],
        buildConfig: ["MetaData","build.js"],
        scripts: ["Resources","Scripts"],
        builtScripts: ["Resources","Scripts-Built"],
        stylesheets: ["Resources", "Stylesheets"],
        layouts: ["Layouts"],
        modules: ["Modules"],
        templates: ["Templates"],
        widgets: ["Widgets"]
    },

    getPath: function (pathName) {
        if (!this.paths[pathName]) {
            throw "getPath: no such path " + pathName;
        }
        return path.resolve.apply(path, [this.baseDir].concat(this.paths[pathName]));
    },


    _supportedThemeConfigs: ['name', 'author', 'extends', 'isDesktop', 'isMobile'],
    getThemeConfig: function() {
        if (!this.themeConfig) {
            try {
                var xml = this.getFileContentsSync('themeConfig', 'Theme config');
                if (xml.indexOf('\uFEFF') === 0) {
                    xml = xml.substring(1);
                }
                var et = elementtree.parse(xml),
                    val,
                    sName;
                this.themeConfig = {};
                for (var s = 0; s < this._supportedThemeConfigs.length; s++) {
                    sName = this._supportedThemeConfigs[s];
                    val = et.findtext(sName);
                    if (val !== '' && !isNaN(Number(val))) val = Number(val);
                    if (val && val.toLowerCase && val.toLowerCase() === 'true') val = true;
                    if (val && val.toLowerCase && val.toLowerCase() === 'false') val = false;
                    this.themeConfig[sName] = val;
                }
            } catch (err) {
                Lyrically.lament('Could not read theme.xml file for ' + this.name);
            }
        }
        return this.themeConfig;
    },

    getBuildConfig: function() {
        if (!this.buildConfig) {
            try {
                this.buildConfig = eval(this.getFileContentsSync('buildConfig', 'Build config'));
            } catch (e) {
                Lyrically.lament('Could not parse build.js file for ' + this.name);
                throw e;
                process.exit(1);
            }
        }
        return this.buildConfig;
    },

    getFileContentsSync: function(name, descrip) {
        var _name = "_" + name;
        if (this[_name]) return this[_name];
        var p = this.getPath(name);
        try {
            this[_name] = fs.readFileSync(p, 'utf-8');
        } catch (e) {
            Lyrically.lament(descrip + ' not found for ' + this.name + ' at ' + p);
            throw e;
        }

        return this[_name];
    },

    getInheritedFileContentsSync: function(pathName) {
        var fullPath = path.resolve(this.baseDir,pathName);
        if (!existsSync(fullPath)) {
            if (this.baseTheme) {
                return this.baseTheme.getInheritedFileContentsSync(pathName);
            } else {
                return false;
            }
        }
        return fs.readFileSync(fullPath,'utf-8');
    }
};

module.exports = Theme;
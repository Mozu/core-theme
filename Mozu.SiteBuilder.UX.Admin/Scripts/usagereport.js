var fs = require('fs'),
	util = require('util'),
	path = require('path');

var jsonDir = process.argv[2];
var everythingRequired = [],
	everythingPresent = [];

	function getCfg(cls, cfgName) {
		var cfg, val;
		if (!cls.members.cfg) return false;
		cfg = cls.members.cfg.filter(function(item){
			return item.name === cfgName;
		});
		if (!cfg || cfg.length === 0 || !cfg[0].default) return false;
		cfg = cfg[0];
		try {
			val = eval(cfg.default);
		} catch(e){}
		return val;
	}

	function readArrayFromCfg(cls, cfgName, clsPrefix) {
		var arr = getCfg(cls, cfgName);
		if (!arr || arr.length == 0) return false;
		return arr.map(function(i){
			if (i.indexOf(clsPrefix) !== 0){
				return clsPrefix + "." + i;
			}
			return i;
		});
	}

	function readValueFromCfg(cls, cfgName, clsPrefix) {
		var val = getCfg(cls, cfgName);
		if (!val) return false;
		if (clsPrefix && val.indexOf(clsPrefix) !== 0) val = clsPrefix + "." + val;
		return val;
	}

fs.readdir(jsonDir, function(err, filenames){
    filenames.forEach(function (filename) {
        var views, models, stores;
        var fileContents = fs.readFileSync(path.resolve(jsonDir, filename));
        var md = JSON.parse(fileContents);
        everythingPresent.push(md.name);
        if (md.superclasses && md.superclasses.indexOf('Ext.app.Controller') !== -1) { // this is a controller
            // we have to do nasty stuff to find out what's being required by the "views" and "models" shorthand, since JSDuck doesn't do it
            views = readArrayFromCfg(md, "views", "Taco.view");
            models = readArrayFromCfg(md, "models", "Taco.model");
            stores = readArrayFromCfg(md, "stores", "Taco.store")
        }

        if (md.superclasses && md.superclasses.indexOf('Ext.data.Store') !== 1) { // this is a store
            // we have to include the model property here
            everythingRequired = everythingRequired.concat(readValueFromCfg(md, "model", "Taco.model"))
        }

        everythingRequired = everythingRequired.concat(md.requires.concat(md.uses).concat(md.extends).concat(md.mixins).concat(models).concat(views).concat(stores));
    });

    var neverUsed = everythingPresent.filter(function(cls){
        return cls.indexOf('Taco.') === 0 && everythingRequired.indexOf(cls) === -1;
    });

    util.puts("The following " + neverUsed.length + " classes are declared but never used:\n\n" + neverUsed.join("\n"));
    util.puts("Each never-used class was never used infinity times.");
})
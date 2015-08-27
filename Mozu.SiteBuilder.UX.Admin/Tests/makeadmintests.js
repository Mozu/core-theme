var path = require('path'),
    fs = require('fs')
    includedClasses = JSON.parse(fs.readFileSync(process.argv.pop(), 'utf-8')); // better argue a filename then

var unitTestGroup = {
    group: 'Unit',
    expanded: true,
    alsoPreload: [
        {
            text: "Taco.app.viewPort.removeAll(true);"
        }

    ],
    items: []
},

    makeGroup = function(name) {
        return {
            group: name.charAt(0).toUpperCase() + name.substring(1),
            expanded: true,
            items: []
        };
    }

    getSubGroup = function(group, name) {
        for (var i = 0, l = group.items.length; i < l; i++) {
            if (group.items[i].group && group.items[i].group.toLowerCase() === name.toLowerCase() ) {
                return group.items[i];
            }
        }
        var newGroup = makeGroup(name);
        group.items.push(newGroup);
        return newGroup;
    }

includedClasses.filter(function(clsFile) {
    return clsFile.indexOf('../Scripts/app') === 0 && fs.existsSync(path.resolve(clsFile.replace('../Scripts/app', 'unit').replace(/\.js$/, '.t.js')));
}).forEach(function(clsFile) {
    var pathParts = clsFile.replace('../Scripts/app/', '').split('/'),
        pathPart,
        ctx = unitTestGroup;
    while (pathPart = pathParts.shift()) {
        ctx = getSubGroup(ctx, pathPart);
    }
    ctx.items.push({
        url: clsFile.replace('../Scripts/app', 'unit').replace(/\.js$/, '.t.js'),
        title: path.basename(clsFile)
    });
});

fs.writeFileSync('AllUnitTests.js', 'window.AllMozuUnitTests = ' + JSON.stringify(unitTestGroup, null, 2) + ";");
// BEGIN INIT

if (!LiveTemplates) throw new ReferenceError("If no AMD loader is present, there must be a global variable named LiveTemplates for HyprLive to function.");
LiveTemplates = JSON.parse(LiveTemplates);

var locals = {},
    localNames = ['themeSettings', 'siteContext']; //, 'user', 'pageContext', 'navigation'];

for (var lni = 0, llen = localNames.length; lni < llen; lni++) {
    locals[localNames[lni]] = require.mozuData(localNames[lni].toLowerCase());
    if (!locals[localNames[lni]]) throw new ReferenceError('This page template fails to preload the ' + localNames[lni] + ' global using {% preload_json ' + localNames[lni] + ' "' + localNames[lni].toLowerCase() + '" %}');
}

var HyprLive = {
    engine: new swig.Swig({
        cache: false,
        cmtControls: ['{% comment %}', '{% endcomment %}'],
        locals: locals
    }),
    getTemplate: getHyprLiveTemplate
};

HyprLive.engine.compileFile = function (path) {
    return getHyprLiveTemplate(path).tpl;
}
// END INIT
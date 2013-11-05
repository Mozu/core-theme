// BEGIN INIT

if (!HyprLiveContext) throw new ReferenceError("If no AMD loader is present, there must be a global variable named HyprLiveContext for HyprLive to function.");
HyprLiveContext = JSON.parse(HyprLiveContext);

var locals = {},
    volatilelocalNames = ['pageContext', 'user']; // 'navigation'];

for (var lni = 0, llen = volatilelocalNames.length; lni < llen; lni++) {
    locals[volatilelocalNames[lni]] = require.mozuData(volatilelocalNames[lni].toLowerCase());
    if (!locals[volatilelocalNames[lni]]) throw new ReferenceError('This page template fails to preload the ' + volatilelocalNames[lni] + ' global using {% preload_json ' + volatilelocalNames[lni] + ' "' + volatilelocalNames[lni].toLowerCase() + '" %}');
}

locals.siteContext = HyprLiveContext.siteContext;
locals.themeSettings = HyprLiveContext.siteContext.themeSettings;
locals.labels = HyprLiveContext.siteContext.labels; 

var HyprLive = {
    engine: new swig.Swig({
        cache: false,
        cmtControls: ['{% comment %}', '{% endcomment %}'],
        locals: locals
    }),
    getTemplate: getHyprLiveTemplate,
    getThemeSetting: function(setting) {
        return locals.themeSettings[setting];
    },
    getLabel: function (name) {
        return locals.labels[name];
    }
};

HyprLive.engine.compileFile = function (path) {
    return getHyprLiveTemplate(path).tpl;
}
// END INIT
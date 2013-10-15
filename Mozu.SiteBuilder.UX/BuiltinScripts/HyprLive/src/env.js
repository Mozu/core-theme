// BEGIN INIT
var HyprLive = {
    engine: new swig.Swig({
        cache: false,
        cmtControls: ['{% comment %}', '{% endcomment %}'],
        locals: TemplateContext
    }),
    getTemplate: getHyprLiveTemplate
};

HyprLive.engine.compileFile = function (path) {
    return getHyprLiveTemplate(path).tpl;
}
// END INIT
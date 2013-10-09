// BEGIN INIT
var HyperLive = {
    engine: new swig.Swig({
        cache: false,
        cmtControls: ['{% comment %}', '{% endcomment %}']
    }),
    getTemplate: getHyperLiveTemplate
};

HyperLive.engine.compileFile = function (path) {
    return getHyperLiveTemplate(path).tpl;
}
// END INIT
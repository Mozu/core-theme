var HyperLiveTemplate = function (precompiledTpl, swigTpl, path) {
    this.precompiledTpl = precompiledTpl;
    this.tpl = swigTpl;
    this.path = path;
},

    compiled = {},
    getHyperLiveTemplate = function (path) {
        var lpath = path.toLowerCase();
        if (!(lpath in compiled)) {
            compiled[lpath] = new HyperLiveTemplate(HyperLive.engine.precompile(LiveTemplates[lpath], {
                filename: path
            }), HyperLive.engine.compile(LiveTemplates[lpath], {
                filename: path
            }), path);
        }
        return compiled[lpath];
    };

HyperLiveTemplate.prototype = {
    render: function (obj) {
        return HyperLive.engine.run(this.precompiledTpl.tpl, obj, this.path);
    }
}
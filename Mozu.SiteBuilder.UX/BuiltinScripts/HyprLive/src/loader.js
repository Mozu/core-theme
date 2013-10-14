var HyprLiveTemplate = function (precompiledTpl, swigTpl, path) {
    this.precompiledTpl = precompiledTpl;
    this.tpl = swigTpl;
    this.path = path;
},

    compiled = {},
    getHyprLiveTemplate = function (path) {
        var lpath = path.toLowerCase();
        if (!(lpath in compiled)) {
            compiled[lpath] = new HyprLiveTemplate(HyprLive.engine.precompile(LiveTemplates[lpath], {
                filename: path
            }), HyprLive.engine.compile(LiveTemplates[lpath], {
                filename: path
            }), path);
        }
        return compiled[lpath];
    };

HyprLiveTemplate.prototype = {
    render: function (obj) {
        return HyprLive.engine.run(this.precompiledTpl.tpl, obj, this.path);
    }
}
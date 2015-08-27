var HyprLiveTemplate = function (precompiledTpl, path) {
    this.precompiledTpl = precompiledTpl;
    this.path = path;
},

    compiled = {},
    getHyprLiveTemplate = function (path) {
        var lpath = path.toLowerCase(),
            tptText = HyprLiveContext.templates[lpath];
        if (!tptText) throw new ReferenceError("HyprLive template \"" + lpath + "\" not found!");
        if (!(lpath in compiled)) {
            compiled[lpath] = new HyprLiveTemplate(HyprLive.engine.precompile(tptText, {
                filename: path
            }), path);
        }
        return compiled[lpath];
    };

HyprLiveTemplate.prototype = {
    render: function (obj) {
        HyprLive.immanentize();
        return HyprLive.engine.run(this.precompiledTpl.tpl, obj, this.path);
    }
}
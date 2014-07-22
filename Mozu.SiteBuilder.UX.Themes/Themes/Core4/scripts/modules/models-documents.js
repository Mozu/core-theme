define(
    ["modules/backbone-mozu", "hyprlivecontext"],
    function (Backbone, context) {
        
        var locals = context.locals;

        var Document = Backbone.MozuModel.extend({
            helpers: ['url'],
            url: function() {
                // attributes available through this.get, theme settings and sitecontext available through "locals.themeSettings" and "locals.siteContext"
                return "/cms/" + this.get('id');
            }
        })

        return {
            Document: Document
        }

});

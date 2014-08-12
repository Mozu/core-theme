define(['modules/jquery-mozu','shim!vendor/underscore>_','shim!vendor/backbone[shim!vendor/underscore>_=_,jquery=jQuery]>Backbone','hyprlive'], function($, _, Backbone, Hypr) {
    // because mozuviews need mozumessageviews and mozumessageviews extend mozuviews, we're risking circular reference problems.
    // we fix this by making a factory method that extends the mozu message view only when asked.
    // this avoids the circular reference problem by not asking for backbone-mozuview until we know it's been provided.
    var MozuMessagesView,
        offset = parseInt(Hypr.getThemeSetting('gutterWidth')) || 10;
    return function (opts) {
        if (!MozuMessagesView) MozuMessagesView = Backbone.MozuView.extend({
            templateName: 'modules/common/message-bar',
            initialize: function () {
                this.model.on('reset', this.render, this)
            },
            render: function () {
                Backbone.MozuView.prototype.render.apply(this, arguments);
                if (this.model.length > 0) {
                    this.$el.ScrollTo({
                        onlyIfOutside: true,
                        offsetTop: offset,
                        offsetLeft: offset * 1.5,
                        axis: 'y'
                    })
                }
            }
        });
        return new MozuMessagesView(opts);
    }

});
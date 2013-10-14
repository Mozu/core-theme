define(['modules/jquery-mozu','shim!vendor/underscore>_','shim!vendor/backbone[shim!vendor/underscore>_=_,jquery=jQuery]>Backbone'], function($, _, Backbone) {
    // because mozuviews need mozumessageviews and mozumessageviews extend mozuviews, we're risking circular reference problems.
    // we fix this by making a factory method that extends the mozu message view only when asked.
    // this avoids the circular reference problem by not asking for backbone-mozuview until we know it's been provided.
    var MozuMessagesView;
    return function (opts) {
        if (!MozuMessagesView) MozuMessagesView = Backbone.MozuView.extend({
            templateName: 'modules/common/message-bar',
            initialize: function () {
                this.model.on('reset', this.render, this)
            }
        });
        return new MozuMessagesView(opts);
    }

});
define(["backbone", 'hyprlive'], function(Backbone, Hypr) {

    var isDebugMode = require.mozuData('pagecontext').isDebugMode,
    unexpectedErrorText = Hypr.getLabel('unexpectedError');

    var Message = Backbone.Model.extend({
        defaults:{
            autoFade : false
        },
        toJSON: function() {
            var j = Backbone.Model.prototype.toJSON.apply(this);
            if ((!isDebugMode && j.errorCode === "UNEXPECTED_ERROR") || !j.message) j.message = unexpectedErrorText;
            return j;
        }
    }),
    MessagesCollection = Backbone.Collection.extend({
        model: Message
    });
    return {
        Message: Message,
        MessagesCollection: MessagesCollection
    };

});

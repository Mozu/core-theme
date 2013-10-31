define(["shim!vendor/backbone[shim!vendor/underscore>_=_,jquery=jQuery]>Backbone"], function (Backbone) {

        var Message = Backbone.Model.extend({
            toJSON: function () {
                var j = Backbone.Model.prototype.toJSON.apply(this);
                j.message = j.message || require.mozuLabel('unexpectedError');
                return j;
            }
        }),
        MessagesCollection = Backbone.Collection.extend({
            model: Message
        });
        return {
            Message: Message,
            MessagesCollection: MessagesCollection
        }

   });

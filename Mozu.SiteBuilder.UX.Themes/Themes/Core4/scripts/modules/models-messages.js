define(["shim!vendor/backbone[shim!vendor/underscore>_=_,jquery=jQuery]>Backbone"], function (Backbone) {

        var Message = Backbone.Model.extend({
            toJSON: function () {
                var j = Backbone.Model.prototype.toJSON.apply(this);
                if (!j.Message) j.Message = j.message || "Unknown error!";
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

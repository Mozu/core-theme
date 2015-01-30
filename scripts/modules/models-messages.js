define(["shim!vendor/backbone[shim!vendor/underscore>_=_,jquery=jQuery]>Backbone", 'hyprlive'], function (Backbone, Hypr) {

        var Message = Backbone.Model.extend({
            toJSON: function () {
                var j = Backbone.Model.prototype.toJSON.apply(this);
                j.message = j.message || Hypr.getLabel('unexpectedError');
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

define(["modules/api", 'underscore', "modules/backbone-mozu", 'modules/models-address', "hyprlive", "modules/models-product"],
    function (api, _, Backbone, AddressModels, Hypr, ProductModels, ReturnModels) {

    var B2bContactItem = Backbone.MozuModel.extend({
        toJSON: function () {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if (j.parent) {
                j.parent = j.parent.toJSON();
            }
            return j;
        }
    }),

    b2bContactItemsList = Backbone.Collection.extend({
        model: B2bContactItem
    }),

    B2bContact = Backbone.MozuModel.extend({
        mozuType: 'b2bcontact',
        idAttribute: 'id',
        relations: {
            items: b2bContactItemsList
        },
        handlesMessages: true,
        initialize: function () {
            var self = this;
        },
        toJSON: function () {
            var self = this,
                jsonItems = [];
            this.get('items').each(function (item) {
                jsonItems.push(item.toJSON());
            });
            this.set('items', jsonItems);
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            return j;
        }
    }),

    B2bContactCollection = Backbone.MozuPagedCollection.extend({
        mozuType: 'b2bcontacts',
        defaults: {
            startIndex: 0,
            pageSize: 5
        },
        relations: {
            items: Backbone.Collection.extend({
                model: B2bContact
            })
        }
    });

    return {
        B2bContactCollection: B2bContactCollection,
        B2bContact: B2bContact
    };
});

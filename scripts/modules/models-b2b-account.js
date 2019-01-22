define(["underscore", "modules/backbone-mozu", "modules/models-product", "modules/models-attributes"], function (_, Backbone, ProductModels, Attributes) {

    var b2bUser = Backbone.MozuModel.extend({
        mozuType: 'b2buser',
        toJSON: function(){
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);

            j.id = j.userId;
            j.accountId = require.mozuData('user').accountId;
            return j;
        }
    });

    var b2bAccount = Backbone.MozuModel.extend({
        mozuType: 'b2baccount',
        relations: {
            users: Backbone.Collection.extend({
                model: b2bUser
            })
        }
    });

    var b2bAccounts = Backbone.MozuModel.extend({
        mozuType: 'b2baccounts',
        relations: {
            items: Backbone.Collection.extend({
                model: b2bAccount
            })
        }
    });

    return {
        'b2bUser': b2bUser,
        'b2bAccount': b2bAccount,
        'b2bAccounts': b2bAccounts
    };
});

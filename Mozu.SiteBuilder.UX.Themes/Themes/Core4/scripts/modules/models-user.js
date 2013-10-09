define(
    ["modules/backbone-mozu"],
    function (Backbone) {

        var User = Backbone.MozuModel.extend({
            mozuType: 'user',

        });

        return {
            User: User
        }
    }
);

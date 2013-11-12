define(
    ["modules/backbone-mozu"],
    function (Backbone) {

        var User = Backbone.MozuModel.extend({
            mozuType: 'user',
            changePassword: function () {
                return this.apiModel.action('changePassword', {
                    oldPassword: this.get('oldPassword'),
                    newPassword: this.get('password')
                });
            }
        });

        return {
            User: User
        }
    }
);

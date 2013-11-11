define(['modules/backbone-mozu', 'modules/jquery-mozu', 'shim!vendor/underscore>_', 'modules/models-customer'], function(Backbone, $, _, CustomerModels) {
    
    var AccountSettingsView = Backbone.MozuView.extend({
        templateName: 'modules/my-account/my-account-settings',
        initialize: function () {
            this.editing = {};
        },
        startEditName: function () {
            this.editing.name = true;
            this.render();
        },
        finishEditName: function () {
            this.model.save();
            this.editing.name = false;
        },
        startEditPassword: function () {
            this.editing.password = true;
            this.render();
        },
        finishEditPassword: function() {
            this.model.changePassword();
            this.editing.password = false;
        },
        startEditPhone: function() {
            this.editing.phone = true;
            this.render();
        },
        finishEditPhone: function() {
            this.model.save();
            this.editing.phone = false;
        },
        getRenderContext: function () {
            var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            c.editing = this.editing;
            return c;
        }
    });
        
    $(document).ready(function () {
        var accountModel = CustomerModels.Customer.fromCurrent();
        accountModel.set('user', require.mozuData('user'));
        //accountModel.set('openOrders', require.mozuData('orders'));

        var $accountSettingsEl = $('#account-settings');

        window.accountSettingsView = new AccountSettingsView({
            el: $accountSettingsEl,
            model: accountModel
        });


        accountSettingsView.render();


    });
});
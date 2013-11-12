define(['modules/backbone-mozu', 'modules/jquery-mozu', 'shim!vendor/underscore>_', 'modules/models-customer', 'modules/views-paging'], function(Backbone, $, _, CustomerModels, PagingViews) {
    
    var AccountSettingsView = Backbone.MozuView.extend({
        templateName: 'modules/my-account/my-account-settings',
        autoUpdate: [
            'primaryBillingContact.firstName',
            'primaryBillingContact.lastNameOrSurname',
            'primaryBillingContact.phoneNumbers.home',
            'user.oldPassword',
            'user.password',
            'user.confirmPassword',
            'acceptsMarketing'
        ],
        initialize: function () {
            var self = this;
            this.editing = {};
            this.listenTo(this.model, 'change:acceptsMarketing', function () {
                self.model.syncApiModel();
                self.model.apiUpdate();
            });
        },
        startEditName: function () {
            this.editing.name = true;
            this.render();
        },
        cancelEditName: function() {
            this.editing.name = false;
            this.render();
        },
        finishEditName: function () {
           this.doModelAction('savePrimaryBillingContact');
            this.editing.name = false;
        },
        startEditPassword: function () {
            this.editing.password = true;
            this.render();
        },
        finishEditPassword: function() {
            this.doModelAction('changePassword');
            this.editing.password = false;
        },
        cancelEditPassword: function() {
            this.editing.password = false;
            this.render();
        },
        startEditPhone: function() {
            this.editing.phone = true;
            this.render();
        },
        finishEditPhone: function() {
           this.doModelAction('savePrimaryBillingContact');
           this.editing.phone = false;
        },
        cancelEditPhone: function() {
            this.editing.phone = false;
            this.render();
        },
        getRenderContext: function () {
            var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            c.editing = this.editing;
            return c;
        },
        doModelAction: function(action, payload) {
            var self = this;
            var operation = this.model[action](payload);
            if (operation.then) {
                operation.then(function () {
                    self.render();
                });
            }
        },

    });


    var OrderHistoryView = Backbone.MozuView.extend({
        templateName: "modules/common/order-list",
    });
        
    $(document).ready(function () {
        var accountModel = window.accountModel =  CustomerModels.Customer.fromCurrent();
        accountModel.set('user', require.mozuData('user'));

        var $accountSettingsEl = $('#account-settings'),
            $orderHistoryEl = $('#account-orderhistory'),
            orderHistory = accountModel.get('orderHistory');

        window.accountViews = {
            accountSettingsView: new AccountSettingsView({
                el: $accountSettingsEl,
                model: accountModel,
                messagesEl: $('#account-messages')
            }),
            accountOrderHistoryView: new OrderHistoryView({
                el: $orderHistoryEl.find('[data-mz-orderlist]'),
                model: orderHistory
            }),
            accountOrderHistoryPagingControls: new PagingViews.PagingControls({
                el: $orderHistoryEl.find('[data-mz-pagingcontrols]'),
                model: orderHistory
            }),
            accountOrderHistoryPageNumbers: new PagingViews.PageNumbers({
                el: $orderHistoryEl.find('[data-mz-pagenumbers]'),
                model: orderHistory
            })
        }

        _.invoke(window.accountViews, 'render');

    });
});
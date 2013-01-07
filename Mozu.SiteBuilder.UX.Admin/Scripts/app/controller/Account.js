/**
 * @class Taco.controller.Account
 * The Account controller
 */

Ext.define('Taco.controller.Account', {
    extend: 'Taco.core.Controller',
    modelName: 'Taco.model.Account',
    requires: ['Taco.view.account.Overview', 'Taco.view.account.Billing', 'Taco.view.account.Users', 'Taco.model.User'], 
    views: ['account.Overview', 'account.Billing', 'account.Users'],

    index: function () {
        var me = this;
            
        Ext.ModelManager.getModel('Taco.model.User').load(Taco.User.id, {
            success: function (data) {
                me.createContentView(Ext.create('Taco.view.account.Overview', {
                    recordId: data
                }));
            }
        });
    },

    billing: function () {
        this.createContentView('Taco.view.account.Billing');
    },

    users: function () {
        this.createContentView('Taco.view.account.Users');
    },

    roles: function (params) {
        console.log('roles', params, arguments);
        this.createContentView('Taco.view.account.Roles');
    }
});


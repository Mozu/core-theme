/**
 * @class Taco.controller.Account
 * The Account controller
 */



//Simeon:  Thomm told me to remove this controller and comment out the my account link.
// this ui was pseudo functional.

Ext.define('Taco.controller.Account', {
    extend: 'Taco.core.Controller',
    modelName: 'Taco.model.Account',
    requires: [
        // deprecated old views
        //'Taco.view.account.Overview',
        //'Taco.view.account.Billing',
        'Taco.view.error.Http404',
        'Taco.view.account.Users',
        'Taco.model.AdminUser'
    ],
    views: [
        // deprecated old views
        //'account.Overview',
        //'account.Billing',
        'account.Users'
    ],

    
    // deprecated old views
    index: function () {
        var me = this;

        this.createContentView("Taco.view.error.Http404");

        /*
        Ext.ModelManager.getModel('Taco.model.AdminUser').load(Taco.user.id, {
            success: function (data) {
                me.createContentView('Taco.view.account.Overview', {
                    recordId: data
                });
            }
        });
        */
    },

    // deprecated old views
    billing: function () {
        this.createContentView("Taco.view.error.Http404");

        //this.createContentView('Taco.view.account.Billing');

    },
    


    users: function () {
        this.createContentView('Taco.view.account.Users');
    },

    roles: function (params) {
       
        this.createContentView('Taco.view.role.Index');
    }
});


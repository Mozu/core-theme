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
        'Taco.view.error.Http404',
        'Taco.view.account.Users',
        'Taco.model.AdminUser'
    ],
    views: [
        'account.Users'
    ],


    // deprecated old views
    index: function () {
        this.createContentView('Taco.view.error.Http404');
    },

    // deprecated old views
    billing: function () {
        this.createContentView('Taco.view.error.Http404');

    },


    users: function () {
        this.createContentView('Taco.view.account.Users');
    },

    roles: function () {
        this.createContentView('Taco.view.role.Index');
    }
});
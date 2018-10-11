/**
 * @class  Taco.controller.B2BAccounts
 * The B2BAccounts controller.
 */
Ext.define('Taco.controller.B2BAccounts', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.b2baccounts.Index', 'Taco.view.b2baccounts.Edit', 'Taco.view.b2baccounts.Create'],
    indexView: 'Taco.view.b2baccounts.Index',
    editorView: 'Taco.view.b2baccounts.Edit',
    views: ['b2baccounts.Index'],
     edit: function () {
         this.createContentView('Taco.view.b2baccounts.Edit', {
             contextConfig: {
                 supportedLevels: ['c'],
                 requiresContextOfType: ['c', 's']
             }
         });
    },
     create: function () {
         this.createContentView('Taco.view.b2baccounts.Create', {
             contextConfig: {
                 supportedLevels: ['c'],
                 requiresContextOfType: ['c']
             }
         });
     }
});

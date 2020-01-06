/**
 * @class Taco.view.b2baccounts.Create
 */

Ext.define('Taco.view.b2baccounts.Create', {
    extend: 'Taco.view.react.Index',
    alias: 'widget.b2baccountcreate',
    parentTitleCfg: {
        title: 'Create B2B Account',
        controller: 'b2baccounts'
    },
    initComponent: function () {
        this.callParent(arguments);
    },
    title: "Create B2B Account",
    contextConfig: {
        supportedLevels: ['c'],
        requiresContextOfType: ['c']
    },

    cls: 'b2b-page'
});
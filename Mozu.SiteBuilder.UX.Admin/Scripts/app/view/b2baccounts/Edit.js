/**
 * @class Taco.view.b2baccounts.Edit
 */

Ext.define('Taco.view.b2baccounts.Edit', {
    extend: 'Taco.view.react.Index',
    alias: 'widget.b2baccountedit',
    parentTitleCfg: {
        title: 'B2B Accounts',
        controller: 'b2baccounts'
    },
    initComponent: function () {
        this.callParent(arguments);
    },
    contextConfig: {
        supportedLevels: ['c'],
        requiresContextOfType: ['c', 's']
    },
    cls: 'b2b-page'
});
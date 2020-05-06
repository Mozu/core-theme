/**
* The B2BAccounts list (grid) view
*/

Ext.define('Taco.view.b2baccounts.Index', {
    extend: 'Taco.view.react.Index',
    alias: 'widget.b2baccountslist',
    parentTitleCfg: {
        title: 'B2B Accounts',
        controller: 'b2baccounts'
    },
    initComponent: function () {
        this.callParent(arguments);
    },
    cls:'b2b-page'
});

/**
 * @class Taco.view.returns.Edit
 */
Ext.define('Taco.view.returns.Edit', {
    extend: 'Taco.view.react.Index',
    //formCls: 'Taco.view.returns.Form',
    title: "Edit Return",
    enableSearchBarInHeader: false,
    parentTitleCfg: {
        title: 'Return',
        controller: 'returns'
    },
    initComponent: function () {
        this.callParent(arguments);
    }
});
Ext.define('Taco.view.b2bAttribute.Edit', {
    extend: 'Taco.view.react.Index',
    requires: [
        'Taco.view.b2bAttribute.Form'
    ],
    enableSearchBarInHeader: false,
    formCls: 'Taco.view.b2bAttribute.Form',
    parentTitleCfg: {
        title: 'B2B Attributes',
        controller: 'b2battributes'
    },
    initComponent: function () {
        this.callParent(arguments);
    }
});
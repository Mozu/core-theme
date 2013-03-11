Ext.define('Taco.view.productType.AttributeGroup', {
    extend: 'Ext.panel.Panel',
    xtype: 'widget.taco.producttype.attributegroup',

    layout: 'card',
    header: {
        margin: '0 0 7'
    },

    initComponent: function () {
        this.tools = [{
            xtype: 'primarybutton',
            text: 'Add',
            click: this.create,
            scope: this
        }];
        
        this.callParent(arguments);
    }
})
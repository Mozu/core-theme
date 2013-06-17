/**
 * @class Taco.view.order.widget.OrderItemGrid
 */

// todos extend base class for the subform
Ext.define('Taco.view.order.widget.OrderItemGrid', {
    extend: 'Ext.grid.Panel',
    requires: [],
    config: {

        editMode: true,
        
       
        // width of the actionColumn. used to align the grid total container
        actionColumnWidth: 60,
        
        tbar: [{text:"test"}],
        
        // components to add to the panel header. typically used to add an actions menu button
        tools: []
    },
    
    initComponent: function (eOpts) {
        var me = this;
            
        this.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-shipping-orderItemGrid'].join(' ');
        
        this.callParent(arguments);
    }
});

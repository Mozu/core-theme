/**
 * @class Taco.view.order.widget.UnpackagedItems
 * this is a container with header designed to contain an order item grid 
 */


Ext.define('Taco.view.order.widget.UnpickedupItems', {
    extend: 'Ext.panel.Panel',
    requires: ['Taco.view.order.widget.PickupItemGrid'],
    config: {
        
        record: null,

        headerData: {
            
        }
    },
    
    
    initComponent: function(eOpts) {
        var me = this,
            data =[],
            unpickedupItems = me.record.get("unpickedupItems");        
        


        me.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-shipping-package'].join(' ');

        // initialize the header;
        me.header = me.getHeaderTemplate();

        // data to be loaded into the store
        if (unpickedupItems) {
            data = unpickedupItems
        }
        
        me.grid = Ext.create('Taco.view.order.widget.PickupItemGrid', {
            
            isPackage: false,
            
            //the unpackaged items data to be loaded by the store
            data: data,
            
            record: this.record,
            
            isUnShippedItems:true,

            // configs for the grid
            editMode: true,

            enableCellEditing: true,

            enableCheckBoxSelection: true,

            enableActionColumn: false,

            enableToolbar: true,

            enableMoveMenu: true,

            enableShippingMethodMenu: false,

            enableShippingLabelButton: false,

            enabledPackingSlipButton: false,

            enabledRemoveButton: false,

            enabledMarkAsFulfilledButton: false
        });

        me.items = [
            me.grid
        ];

        
        me.callParent(arguments);
    },
    
   
    getHeaderTemplate : function() {
        return {
            xtype: "component",
            tpl: [
                '<div class="shipment-header">',
                    '<div class="orderCountRow" style="border-bottom:1px solid #bfbfbf !important;padding:13px 0 13px 0;">',
                        '<span class="titleRow" style="line-height1.4em">{title}</span>',
                        '<div style="float:right;padding:4px 19px 4px 10px;">',
                            ' Total In Store Pickup Items: {totalPickupItems} ',
                            '<span class="seperator">|</span>',
                            'Fulfilled Items: {itemsPickedup} ',
                            '<span class="seperator">|</span>',
                            ' Pending Items: {itemsNotPickedup} ',
                        '</div>',
                    '</div>',
                '</div>'
            ],
            data: this.getHeaderData()
        };
    },
    
    loadData: function (data) {
        var me = this;
        me.grid.getStore().loadData(data);
    },
    
    changeShipTo: function (dom) {
        
    }
});

/**
 * @class Taco.view.order.widget.UnpackagedItems
 * this is a container with header designed to contain an order item grid 
 */


Ext.define('Taco.view.order.widget.UnpackagedItems', {
    extend: 'Ext.panel.Panel',
    requires: ['Taco.view.order.widget.OrderItemGrid'],
    config: {
        
        record: null,

        headerData:{
            // ui controls
            showVisibilityToggle: false,
            showChangeLink: true,
            

            // order info
            title: "Unshipped Items",
            shipmentStatus: "Partially Shipped",
            orderTotal: 65,
            shippedItemTotal: 45,
            pendingItemTotal: 20,
            shippingMethod: "FedEx 2nd Day Air",
            
            // billing contact info
            firstName: "John",
            lastName: "Smith",
            address1: "321654 horseback hollow, Austin, Tx 78954",
            zipCode: "78757",
            state: "Tx",
            phoneNumber: "542.654.6543",
            email: "noone@sopmwhere.com"
        }
    },
    
    initComponent: function(eOpts) {
        var me = this,
            data =[],
            unpackagedItems = me.record.get("unpackagedItems");        
        


        me.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-shipping-package'].join(' ');

        // initialize the header;
        me.header = me.getHeaderTemplate();

        // data to be loaded into the store
        if (unpackagedItems) {
            data = unpackagedItems
        }

        
        me.grid = Ext.create('Taco.view.order.widget.OrderItemGrid', {
            
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

            enabledMarkAsShippedButton: false
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
                    '<div class="titleRow">',
                        ' {title} ',
                        '<span class="seperator">|</span>',
                        ' {shipmentStatus} ',
                    '</div>',

                    '<div class="orderCountRow">',
                        ' Ordered: {orderTotal} ',
                        '<span class="seperator">|</span>',
                        'Shipped: {shippedItemTotal} ',
                        '<span class="seperator">|</span>',
                        ' Pending: {pendingItemTotal} ',
                    '</div>',

                    '<div class="shipTo">',
                        'Shipped to: {firstName} {lastName} ',
                        '<span class="seperator">|</span>',
                        ' {address1} {zipCode} {state} ',
                        '<tpl if="values.phoneNumber">',
                            '<span class="seperator">|</span>',
                            ' {phoneNumber} ',
                        '</tpl>',
                        '<tpl if="values.email">',
                            '<span class="seperator">|</span>',
                            ' {email} ',
                        '</tpl>',
                        '<tpl if="values.showChangeLink">',
                            '<span class="seperator">|</span>',
                            '<a class="shipmentAction" shipmentAction="changeShipTo">Change</a>',
                        '</tpl>',
                    '</div>',

                    '<div class="shippingMethodRow">',
                        ' Shipping Method: {shippingMethod} ',
                    '</div>',
                '</div>'
            
            ],
            data: this.getHeaderData(),
            listeners: {
                el: {
                    click: {
                        fn: function (e, dom, eOpt) {
                            var action = dom.getAttribute("shipmentAction");
                            switch (action) {
                                case "changeShipTo":
                                    this.changeShipTo(dom);
                                    break;
                            }
                        },
                        scope: this
                    }
                }
            }
        };
    },
    
    loadData: function (data) {
        var me = this;
        me.grid.getStore().loadData(data);
    },
    
    changeShipTo: function (dom) {
        
    }
});

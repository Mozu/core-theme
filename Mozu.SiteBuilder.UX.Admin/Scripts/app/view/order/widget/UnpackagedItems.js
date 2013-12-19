/**
 * @class Taco.view.order.widget.UnpackagedItems
 * this is a container with header designed to contain an order item grid 
 */


Ext.define('Taco.view.order.widget.UnpackagedItems', {
    extend: 'Ext.panel.Panel',
    requires: ['Taco.view.order.widget.ShippingItemGrid'],
    config: {
        
        record: null,

        headerData: {
            /*
            // ui controls
            showVisibilityToggle: false,
            showChangeLink: true,
            

            // order info
            title: "Unshipped Items",
            fulfillmentStatus: null,
            orderTotal: null,
            shippedItemTotal: null,
            pendingItemTotal: null,
            shippingMethod: null,
            
            // billing contact info
            firstName: null,
            lastName: null,
            cityOrTown: null,
            address1: null,
            postalOrZipCode: null,
            stateOrProvince: null,
            phoneNumber: null,
            email: null
            */
        }
    },
    
    //style: "border:1px solid #bfbfbf;padding:19px;",
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

        
        me.grid = Ext.create('Taco.view.order.widget.ShippingItemGrid', {
            
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
                
                    

                    '<table style="width:100%;border-bottom:1px solid #bfbfbf;"><tr><col/><col /><col  />',
                        '<td style="width:33%;vertical-align:top;">',

                            '<div class="header-section">',
                                '<div class="header-label">Order Fulfillment Status</div>',
                                
                                '<tpl if="fulfillmentStatus==\'PartiallyFulfilled\'">',
                                    "Partially Fulfilled",
                                '<tpl elseif="fulfillmentStatus==\'NotFulfilled\'">',
                                    "Not Fulfilled",
                                '<tpl else>',
                                    '{fulfillmentStatus}',
                                '</tpl>',
                            '</div>',

                        '</td>',
                
                        '<td style="width:34%;vertical-align:top;padding:0 10px 0 10px ">',
                            '<div class="header-section">',
                                '<div class="header-label">Shipping Method</div>',
                                '<tpl if="values.shippingMethod">',
                                    '<div>{shippingMethod}</div>',
                                '<tpl else>',
                                    '<div>Uses default for order</div>',
                                '</tpl>',
                            '</div>',
                        '</td>',
                
                        '<td style="width:33%;vertical-align:top">',
                            '<div class="header-section">',
                                '<div class="header-label">Ship to</div>',
                                '<div>{firstName} {lastName}</div>',
                                    '<tpl if="values.address1 || values.address2">',
                                        '<div>{address1} {address2}</div>',
                                    '</tpl>',
                                    '<tpl if="values.address3 || values.address4">',
                                        '<div>{address3} {address4}</div>',
                                    '</tpl>',
                                '<div>{cityOrTown}, {stateOrProvince} {postalOrZipCode} {countryCode}</div>',
                                '<tpl if="values.phoneNumber">',
                                    ' {phoneNumber} ',
                                '</tpl>',
                                '<tpl if="values.email">',
                                    ' {email} ',
                                '</tpl>',
                                
                            '</div>',
                
                            /*
                            '<tpl if="values.showChangeLink">',
                                '<a class="shipmentAction" shipmentAction="changeShipTo">Change</a>',
                            '</tpl>',
                            */
                
                        '</td>',
                    '</tr></table>',


                    

                    

                    '<div class="orderCountRow" style="border-bottom:1px solid #bfbfbf !important;padding:13px 0 13px 0;">',
                        '<span class="titleRow" style="line-height1.4em">{title}</span>',
                        '<div style="float:right;">',
                            ' Ordered: {orderTotal} ',
                            '<span class="seperator">|</span>',
                            'Shipped: {shippedItemTotal} ',
                            '<span class="seperator">|</span>',
                            ' Pending: {pendingItemTotal} ',
                        '</div>',
                    '</div>',

                    

                    
                '</div>'



                /*

                '<div class="shipment-header">',
                    '<div class="titleRow">',
                        ' {title} ',
                        '<span class="seperator">|</span>',
                        
                        '<tpl if="fulfillmentStatus==\'PartiallyFulfilled\'">',
                            "Partially Fulfilled",
                        '<tpl elseif="fulfillmentStatus==\'NotFulfilled\'">',
                            "Not Fulfilled",
                        '<tpl else>',
                            '{fulfillmentStatus}',
                        '</tpl>',
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
                        ' {address1} {cityOrTown}, {stateOrProvince} {postalOrZipCode}  {countryCode}',
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
                        ' Shipping Method: ',
                        '<tpl if="values.shippingMethod">',
                            '{shippingMethod}',
                        '<tpl else>',
                            'Uses default for order',
                        '</tpl>',
                    '</div>',
                '</div>'
                */
            
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

/**
 * @class Taco.view.order.widget.Package
 * this is a container with header designed to contain an order item grid
 * supports the toggling of visibility of the grid;
 */


Ext.define('Taco.view.order.widget.Package', {
    extend: 'Ext.panel.Panel',
    requires: ['Taco.view.order.widget.OrderItemGrid'],
    config: {
        
        record: null,
        
        gridHidden:false,
        
        // possible values:  "shipped", "unshipped", "unpackaged"
        packageType: "unshipped",
        
        // data for this view
        packageData: {},
        
        // configs for the grid
        editMode: true,

        enableCellEditing: true,

        enableCheckBoxSelection: true,

        enableActionColumn: true,

        enableToolbar: true,
        
        enableMoveMenu: true,

        isShippedPackage: false,
        
        enableShippingMethodMenu: true,

        enableShippingLabelButton: true,

        enabledPackingSlipButton: true,

        enabledRemoveButton: true,

        enabledMarkAsShippedButton: true,

        
        // this is default sample data just
        headerData: {
            //ui controls
            showVisibilityToggle: true,

            // order info
            title: "Package #",
            shipmentStatus: "Not Shipped",
            itemTotal: 0,
            weight: 0,
            shippingMethod: "Shipping method here",
            trackingNumber: null,
            shippedDate: "shipped date here",
            
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
        var me = this;        
        
        me.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-shipping-package'].join(' ');

        // initialize the header;
        me.header = me.getHeaderTemplate();

        
        me.grid = Ext.create('Taco.view.order.widget.OrderItemGrid', {
            record: this.record,
            // data to be loaded into the store
            data : me.packageData.items,

            hidden: me.getGridHidden(),

            editMode: true,
            
            isShippedPackage : me.getIsShippedPackage(),

            enableCellEditing: me.getEnableCellEditing(),

            enableCheckBoxSelection: me.getEnableCheckBoxSelection(),

            enableActionColumn: me.getEnableActionColumn(),
            
            enableMoveMenu: me.getEnableMoveMenu(),
            
            enableShippingMethodMenu: me.getEnableShippingMethodMenu(),

            enableShippingLabelButton: me.getEnableShippingLabelButton(),

            enabledPackingSlipButton: me.getEnabledPackingSlipButton(),

            enabledRemoveButton: me.getEnabledRemoveButton(),

            enabledMarkAsShippedButton: me.getEnabledMarkAsShippedButton(),

            enableToobar: me.getEnableToolbar()
        });

        me.items = [
            me.grid
        ];

        
        // load the package items
       // me.loadData(me.packageData.items);
        
        
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
                        '<tpl if="values.shipmentStatus==\'Shipped\'">',
                            '<span class="seperator">|</span>',
                            'Shipped Date Hre{shippedDate}',
                        '<tpl else>',
                            '<span class="seperator">|</span>',
                            '<a class="shipmentAction" shipmentAction="deletePackage">Delete</a>',
                        '</tpl>',
                        
                

                    '</div>',
                

                    '<div class="trackingNumberRow">',
                        ' Tracking Number: ',
                        '<tpl if="values.trackingNumber">',
                            '<a class="shipmentAction" shipmentAction="addTrackingNumber">{trackingNumber}</a>',
                        '<tpl else>',
                            '<a class="shipmentAction" shipmentAction="addTrackingNumber">Add Tracking Number</a>',
                        '</tpl>',
                    '</div>',
                    '<div class="orderCountRow">',
                        ' Products: {itemTotal} ',
                        '<span class="seperator">|</span>',
                        'Weight: {weight} lbs',
                    '</div>',
                    '<div class="shipTo">',
                        'Ship to:  {firstName} {lastName} ',
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
                    '</div>',
                    '<div class="shippingMethodRow">',
                        ' Shipping Method: {shippingMethod} ',
                    '</div>',
                '<tpl if="values.showVisibilityToggle">',
                    '<div class="visibilityToggle">',
                        '<a class="shipmentAction expanded" shipmentAction="toggleVisibility">Click for more details</a>',
                    '</div>',
                '</tpl>',
                '</div>'
                
            ],
            data: this.getHeaderData(),
            listeners: {
                el: {
                    click: {
                        fn: function (e, dom, eOpt) {
                            var action = dom.getAttribute("shipmentAction");
                            switch (action) {
                                case "toggleVisibility":
                                    this.toggleVisibility(dom)
                                    break;
                                case "addTrackingNumber":
                                    this.addTrackingNumber()
                                    break;
                                case "deletePackage":
                                    this.deletePackage()
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
    
    toggleVisibility: function (dom) {
        var vis = this.grid.isHidden();
        var txt = "Click for more details";
        this.grid.setVisible(vis);
        if (vis) {
            txt = "Click to hide details";
        }
        Ext.fly(dom).update(txt);
    },
    
    deletePackage: function() {
        debugger
    },

    addTrackingNumber: function () {
        debugger
    }
    
});

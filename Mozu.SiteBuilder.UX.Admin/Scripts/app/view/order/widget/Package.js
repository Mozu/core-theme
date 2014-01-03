/**
 * @class Taco.view.order.widget.Package
 * this is a container with header designed to contain an order item grid
 * supports the toggling of visibility of the grid;
 */


Ext.define('Taco.view.order.widget.Package', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Taco.view.order.widget.ShippingItemGrid',
        'Taco.view.order.modal.EditTrackingNumber',
        'Taco.store.PackagingTypes'
    ],
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
            fulfillmentStatus: "Not Shipped",
            fulfillmentLocationCode: "",
            itemTotal: 0,
            weight: 0,
            shippingMethod: "",
            trackingNumber: null,
            shipDate: "",
            
            packagingType: "",
            
            // billing contact info
            firstName: "",
            lastName: "",
            cityOrTown: "",
            address1: "",
            postalOrZipCode: "",
            stateOrProvince: "",
            phoneNumber: "",
            email: ""
        }
    },
    
    initComponent: function(eOpts) {
        var me = this;        
        
        me.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-shipping-package'].join(' ');
        
        // initialize the header;
        me.header = me.getHeaderTemplate();
        
        me.grid = Ext.create('Taco.view.order.widget.ShippingItemGrid', {
            record: this.record,
            // data to be loaded into the store
            data: me.packageData.items,
            order: me.record,
            // needed for toolbar actions
            packageData: me.packageData,

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

            enableToobar: me.getEnableToolbar(),
            
            showFulfillmentMethodColumn: false,

            showFulfillmentLocationColumn: false
        });

        me.items = [
            me.grid
        ];

        
        // load the package items
        // me.loadData(me.packageData.items);
        
        
        me.callParent(arguments);
    },
    

    getHeaderTemplate: function () {
        
        return {
            xtype: "component",
            tpl: [
                

                '<div class="shipment-header">',
                

                    '<div class="orderCountRow" style="border-bottom:1px solid #bfbfbf !important;border-top:1px solid #bfbfbf !important;padding:13px 0 13px 0;margin-bottom:19px;">',
                        '<span class="titleRow" style="line-height1.4em">{title}</span>',                        
                    '</div>',



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
                
                            '<tpl if="values.itemTotal">',
                                '<div class="header-section">',
                                    'Package Item Count: {itemTotal}',
                                '</div>',
                            '</tpl>',
                
                            '<div class="header-section">',
                                'Packaging Type: ',
                                '<tpl if="values.fulfillmentStatus==\'Fulfilled\'">',                
                                    '{packagingType}',
                                '<tpl else>',
                                    '<a class="shipmentAction" shipmentAction="packagingType">{packagingType}</a>',
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
                
                            '<div class="header-section">',
                                'Weight: {weight} lbs',
                            '</div>',

                            '<div class="header-section">',
                                ' Tracking: ',
                                /*
                                '<tpl if="values.fulfillmentStatus==\'fulfilled\'">',
                                    '<tpl if="values.trackingNumber">',
                                        '<span>{trackingNumber}</span>',
                                    '<tpl else>',
                                        '<span>No tracking number</span>',
                                    '</tpl>',
                                '<tpl else>',
                                */
                                    '<tpl if="values.trackingNumber">',
                                        '<a class="shipmentAction" shipmentAction="addTrackingNumber">{trackingNumber}</a>',
                                    '<tpl else>',
                                        '<a class="shipmentAction" shipmentAction="addTrackingNumber">Add Tracking Number</a>',
                                    '</tpl>',
                                //'</tpl>',
                
                                
                            '</div>',



                        '</td>',

                        '<td style="width:33%;vertical-align:top;padding-bottom:19px;">',
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
                        '</td>',
                
                    '</tr></table>',



                    '<tpl if="values.showVisibilityToggle">',
                        '<div class="visibilityToggle">',
                            '<a class="shipmentAction expanded" shipmentAction="toggleVisibility">Click for more details</a>',
                        '</div>',
                    '</tpl>',



                '</div>',






                /*

                


                '<div class="shipment-header">',
                    '<div class="titleRow">',
                        ' {title} ',
                        '<span class="seperator">|</span>',
                        '<tpl if="values.fulfillmentStatus==\'NotFulfilled\'">',
                            "Not Shipped",
                        '<tpl else>',
                            "Shipped",
                        '</tpl>',
                        '<tpl if="values.fulfillmentStatus==\'Fulfilled\'">',
                            '<span class="seperator">|</span>',
                            'Shipped Date: {shipDate:date("F d Y g:ia")}',
                        '<tpl else>',
                            '<span class="seperator">|</span>',
                            '<a class="shipmentAction" shipmentAction="deletePackage">Delete</a>',
                        '</tpl>',
                        
                

                    '</div>',
                

                    '<div class="trackingNumberRow">',
                        ' Tracking Number: ',
                
                        '<tpl if="values.fulfillmentStatus==\'Shipped\'">',
                            '<tpl if="values.trackingNumber">',
                                '<span>{trackingNumber}</span>',
                            '<tpl else>',
                                '<span>No tracking number</span>',
                            '</tpl>',
                        '<tpl else>',
                            '<tpl if="values.trackingNumber">',
                                '<a class="shipmentAction" shipmentAction="addTrackingNumber">{trackingNumber}</a>',
                            '<tpl else>',
                                '<a class="shipmentAction" shipmentAction="addTrackingNumber">Add Tracking Number</a>',
                            '</tpl>',
                        '</tpl>',





                    '</div>',
                    '<div class="orderCountRow">',
                        '<tpl if="values.itemTotal">',
                            ' Products: {itemTotal} ',
                            '<span class="seperator">|</span>',
                        '</tpl>',
                        'Weight: {weight} lbs',
                    '</div>',
                    '<div class="shipTo">',
                        'Ship to:  {firstName} {lastName} ',
                        '<span class="seperator">|</span>',
                        '{address1} {cityOrTown} {postalOrZipCode} {stateOrProvince} {countryCode}',
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
                        ' Shipping Method: ',
                        '<tpl if="values.shippingMethod">',
                            '{shippingMethod}',
                        '<tpl else>',
                            'Order default',
                        '</tpl>',
                        '<span class="seperator">|</span>',
                        'Packaging Type: ',
                
                        '<tpl if="values.fulfillmentStatus==\'Fulfilled\'">',
                            '{packagingType}',
                        '<tpl else>',
                            '<a class="shipmentAction" shipmentAction="packagingType">{packagingType}</a>',
                        '</tpl>',
                    '</div>',


                    



                '<tpl if="values.showVisibilityToggle">',
                    '<div class="visibilityToggle">',
                        '<a class="shipmentAction expanded" shipmentAction="toggleVisibility">Click for more details</a>',
                    '</div>',
                '</tpl>',
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
                                case "toggleVisibility":
                                    this.toggleVisibility(dom)
                                    break;
                                case "addTrackingNumber":
                                    this.addTrackingNumber()
                                    break;
                                case "deletePackage":
                                    this.deletePackage()
                                    break;
                                case "packagingType":
                                    this.showPackagingTypeMenu(e, dom, eOpt);
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
    
    changePackagingType: function (packagingType) {
        var me = this;
        
        if (packagingType && me.packageData.packagingType !== packagingType) {

            var data = Ext.clone(me.packageData);

            data.packagingType = packagingType;

            config = {
                jsonData: [data],
                success: function (response) {
                    // success handling here
                    var json = Ext.decode(response.responseText, true);
                    if (!json || !json.success) {
                        Taco.app.fireEvent('setmessage', "Error updating packaging type", 'error');
                        Taco.app.viewPort.setLoading(false);
                        return;
                    }
                    // reload the record
                    this.record.reload();
                },
                failure: function (response) {
                    var json = Ext.decode(response.responseText, true),
                        msg = (json && json.Message) ? json.Message : "Error updating packaging type";
                    Taco.app.fireEvent('setmessage', msg, 'error');
                    Taco.app.viewPort.setLoading(false);
                },
                scope: this
            };

            Taco.app.viewPort.setLoading(true);

            // call the model method to persist the change
            this.record.changePackagingType(config);
        }
    },

    showPackagingTypeMenu: function (e, dom, eOpt) {
        var me = this;

        
        
        var packagingStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.PackagingTypes'
        });

        var menuData = [];
        packagingStore.each(function (rec) {
            var record = Ext.clone(rec.data);
            //need to `lete the id from the data or opening the menu twice will cause it to blow up;
            delete record.id;
            menuData.push(record);
        });
        
        var menu = new Ext.menu.Menu({
            plain: true,
            listeners: {
                click: function (menu, item, e, eOpts) {
                    
                    var packagingType = item.packagingType;
                    if (packagingType) {
                        me.changePackagingType(packagingType);
                    }
                },
                //delegate: "x-menu-item-link",
                scope: me
            },
            items: menuData
        });
        
        menu.showBy(e.target);
    },

    deletePackage: function() {
        var me = this;
        // get package json
        var data = me.packageData;

        config = {
            jsonData: {
                orderId : this.record.get("id"),
                packageIds: [data.id]
            },
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    Taco.app.fireEvent('setmessage', "error deleting package", 'error');
                    Taco.app.viewPort.setLoading(false);
                    return;
                }
                // reload the record
                this.record.reload();
            },
            failure: function (response) {
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.Message) ? json.Message : "Error deleting package";
                Taco.app.fireEvent('setmessage', msg, 'error');
                Taco.app.viewPort.setLoading(false);
            },
            scope: this
        };
        
        Taco.app.viewPort.setLoading(true);

        // call the model method to persist the change
        this.record.deletePackage(config);
    },

    addTrackingNumber: function () {
        var me = this,
            packageData = me.packageData;

        var modal = Ext.create('Taco.view.order.modal.EditTrackingNumber', {
            packageData : packageData, 
            record: me.record
        });

        modal.show();
    }
    
});

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
            shippingMethodCode: "",
            shippingMethodName: "",

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

        // initialize the header;
        me.header = me.getHeaderTemplate();


        me.items = [
            me.grid
        ];

        
        // load the package items
        // me.loadData(me.packageData.items);
        
        
        me.callParent(arguments);
    },
    

    getToolBarConfig : function () {        
        tb = {
            plain: true,
            cls: "package-header-title-row",
            style: "background-color:#ffffff;",            
            enableOverflow: true,
            items: []
        };

        return tb

    },

    /*
    * populates a menu with configured shipping rates and secondary menus for all available rates by provider
    */ 
    getShippingRatesMenu: function () {
        var me = this,            
            configuredRatesMenuData = [],
            customConfiguredRatesMenuData = [],
            rateProviders = {
                fedex: [],
                usps: [],
                ups:[]
            },            
            store = Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingMethods');     

        if (store) {
            store.each(function (record) {
                var isConfigured = record.get("isConfigured"),
                    itemConfig = Ext.clone(record.data);                
                    itemConfig.text = Ext.clone(itemConfig.name);

                // remove the id from the data as it will cause conflicts between the duplicated items when they are configured;
                delete itemConfig.id;

                if (record.get("rateProvider") == 'custom') {
                    customConfiguredRatesMenuData.push(itemConfig)
                } else {
                    
                    if (isConfigured) {
                        // clone the config so that any subsequent changes dont' leak in to the configured config                        
                        configuredRatesMenuData.push(Ext.clone(itemConfig));

                        // tack on the text "configured" to the text description only in the secondary flyout menus
                        itemConfig.text += " (Configured)";
                    }
                    // populate secondary flyouts
                    rateProviders[itemConfig.rateProvider].push(itemConfig)
                }
            });
        }
                    
        return Ext.Array.union(                
            configuredRatesMenuData,
            customConfiguredRatesMenuData,
            {
                xtype: "menuseparator",                    
                disabled:true
            }, 
            
            {
                xtype: 'menuitem',
                menu: {
                    plain: true,
                    showSeparator: false,
                    listeners: {
                        click: {
                            fn: me.changeShippingMethod,
                            scope: me,
                            delegate: "x-menu-item-link"
                        }
                    },
                    items: rateProviders["fedex"]
                },
                // dont' allow the menu to flyout if there is no content in the list; This happens when the rate provider is unconfigured
                disabled: !rateProviders["fedex"].length,
                text: (rateProviders["fedex"].length) ? "FedEx" : "FedEx (Not Configured)"
            },
            
            
            [
                {
                    xtype: 'menuitem',                        
                    menu: {
                        plain: true,
                        showSeparator: false,
                        listeners: {
                            click: {
                                fn: me.changeShippingMethod,
                                scope: me,
                                delegate: "x-menu-item-link"
                            }
                        },
                        items: rateProviders["ups"]
                    },
                    disabled: !rateProviders["ups"].length,
                    text: (rateProviders["ups"].length) ? "UPS" : "UPS (Not Configured)"
                }
            ], [
                {
                    xtype: 'menuitem',                        
                    menu: {
                        plain: true,
                        showSeparator:false,                            
                        listeners: {
                            click: {
                                fn: me.changeShippingMethod,
                                scope: me,
                                delegate: "x-menu-item-link"
                            }
                        },
                        items: rateProviders["usps"]
                    },
                    disabled: !rateProviders["usps"].length,
                    text: (rateProviders["usps"].length) ? "USPS" : "USPS (Not Configured)"
                }
            ]
        )       

    },

    getHeaderTemplate: function () {
        var me = this;

        var toolbarConfig = this.getToolBarConfig();

        toolbarConfig.cls = "package-header-title-row";

        var titleRow = toolbarConfig;

        

        titleRow.items.push(
            {
                html: this.headerData.title,
                style:"margin-right:20px;",
                xtype:"component"
            },
            { xtype: 'tbfill' }
        );


        if (me.enabledMarkAsShippedButton) {

            me.markAsShippedButton = Ext.create("Ext.button.Button", {
                text: 'Mark As Shipped',
                ui: 'action',
                margin: "0 2px 0 0",
                scale: 'medium',
                handler: me.grid.markAsShipped,
                scope: me
            });
        
            titleRow.items.push(me.markAsShippedButton);
        }





        if (me.enableShippingMethodMenu) {


            // note: left this behavior in the grid to minimize bugs considering the late movement of this button to the outer class;
            // todo: move this behavior into the outer class and remove from grid;
            me.shippingMethodMenu = Ext.create("Ext.button.Button", {
                ui: 'action',
                margin: "0 2px 0 0",
                scale: 'medium',
                //menuAlign: 'tr-br',
                text: "Shipping Method",
                listeners: {
                    menushow: {
                        fn: function (button, menu, eOpts) {
                            var menuData = me.getShippingRatesMenu();
                            me.shippingMethodMenu.menu.removeAll();                            
                            me.shippingMethodMenu.menu.add(menuData);                            
                        },
                        scope: me
                    }
                },
                menu: {
                    plain: true,
                    showSeparator:false,
                    //maxHeight:600,
                    listeners: {
                        click: {
                            fn: me.changeShippingMethod,
                            scope: me,
                            delegate: "x-menu-item-link"
                        }
                    },
                    items: [{
                        text: "loading..."
                    }]
                }
            });

            titleRow.items.push(me.shippingMethodMenu);

        }

        
        // need to lookup the shipping method to see if its a custom rate. if so, dont show the shipping label button.
        var shippingMethodStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingMethods');
        var shippingMethodRecord = shippingMethodStore.getById(me.packageData.shippingMethodCode);


        if (me.enableShippingLabelButton && shippingMethodRecord && shippingMethodRecord.get("rateProvider")!="custom") {

            me.shippingLabelButton = Ext.create("Ext.button.Button", {
                text: 'View Shipping Label',
                ui: 'action',
                margin: "0 2px 0 0",
                scale: 'medium',
                handler: function () {
                    
                    me.viewShippingLabel()
                },
                scope: me
            });
            me.shippingLabelButton.setDisabled(!me.grid.packageData.shippingMethodCode);
            titleRow.items.push(me.shippingLabelButton);

        }

        if (me.enabledPackingSlipButton) {
            me.packingSlipButton = Ext.create("Ext.button.Button", {
                text: 'View Packing Slip',
                ui: 'action',
                margin: "0 2px 0 0",
                scale: 'medium',
                handler: function () {
                    
                    me.viewPackingSlip()
                },
                scope: me
            });            
            titleRow.items.push(me.packingSlipButton);
        }





        if (this.headerData.fulfillmentStatus == "NotFulfilled") {
            titleRow.items.push(
                {
                    xtype: "button",
                    ui: "action",
                    scale: "medium",
                    //margin: "0 2px 0 0",
                    text: "Cancel Shipment",
                    handler: function () {
                        this.deletePackage()
                    },
                    scope: this
                }
            )
        }


        var tb = Ext.create('Ext.toolbar.Toolbar', toolbarConfig);
        
        return {
            xtype: "container",
            items: [

                tb,     
        
        
                {
                    xtype: "component",
                    tpl: [
                

                        '<div class="shipment-header">',

                            '<table style="width:100%;border-bottom:1px solid #bfbfbf;"><tr><col/><col /><col  />',
                                '<td style="width:33%;vertical-align:top;">',

                                    '<div class="header-section">',
                                        '<span class="header-label">Order Fulfillment Status:</span>',
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
                                            '<span class="header-label">Package Item Count:</span> {itemTotal}',
                                        '</div>',
                                    '</tpl>',
                
                                    '<div class="header-section">',
                                        '<span class="header-label">Packaging Type:</span> ',
                                        '<tpl if="values.fulfillmentStatus==\'Fulfilled\'">',                
                                            '{packagingType}',
                                        '<tpl else>',
                                            '<a class="shipmentAction" shipmentAction="packagingType">{packagingType}</a>',
                                        '</tpl>',
                                    '</div>',





                                '</td>',

                                '<td style="width:34%;vertical-align:top;padding:0 10px 0 10px ">',
                
                                    '<div class="header-section">',
                                        '<span class="header-label">Shipping Method: </span>',

                                        '<tpl if="values.shippingMethod">',
                                            '<span>{shippingMethod}</span>',
                                        '<tpl else>',
                                            '<span>Uses default for order</span>',
                                        '</tpl>',
                                    '</div>',
                
                                    '<div class="header-section">',
                                        '<span class="header-label">Weight:</span> {weight} lbs',
                                    '</div>',

                                    '<div class="header-section">',
                                        ' <span class="header-label">Tracking:</span> ',
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

                            '<ul>',
                            '<lh>Transaction History</lh>',
                            '<tpl for="changeMessages">',
                            '<li>{subject}: {createDate:date("M d g:ia")} | Modified By: {userName}</li>',
                            '</tpl>',
                            '</ul>',

                            '<tpl if="values.showVisibilityToggle">',
                                '<div class="visibilityToggle">',
                                    '<a class="shipmentAction expanded" shipmentAction="toggleVisibility">Click for more details</a>',
                                '</div>',
                            '</tpl>',


                        '</div>',               
                
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
            
                }


            ]
        
        };

        this.getHeaderData();
    },



    changeShippingMethod: function (menu, item, e, eOpts) {


        

        if (item) {

            
            data = this.grid.packageData;
            // update the shipping code
            data.shippingMethodCode = item.code;
            data.shippingMethodName = item.name;

            config = {
                jsonData: [data],
                success: function (response) {
                    // success handling here
                    Taco.app.viewPort.setLoading(false);
                    var json = Ext.decode(response.responseText, true);
                    if (!json || !json.success) {
                        Taco.app.fireEvent('setmessage', "Error changing shipping method", 'error');
                        return;
                    }
                    // reload the record
                    this.record.reload();
                },
                failure: function (response) {
                    var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : "Error changing shipping method";
                    Taco.app.fireEvent('setmessage', msg, 'error');
                    Taco.app.viewPort.setLoading(false);
                },
                scope: this
            };

            Taco.app.viewPort.setLoading(true);

            // call the model method to persist the change
            this.record.changeShippingMethod(config);



        }
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
                        msg = (json && json.message) ? json.message : "Error updating packaging type";
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
                    msg = (json && json.message) ? json.message : "Error deleting package";
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
    },
    
    
    viewShippingLabel: function (button, e) {
        
        
        // view shipping label. open in new tab. this initiates a work flow that makes the package uneditable.
        // subsequent edits to a package with a shipping label will need to be confirmed with a ui that tells the user 
        // to destroy the shipping label. and should probably remove the tracking number from the package as well.

        
        var newWindow,
            me = this,
            grid = this.grid,
            data = grid.packageData,
            labelUrl = '/admin/app/order/shipping/package/label?orderId=' + data.orderId + '&packageId=' + data.id,
            windowName = "shippingLabel-" + data.orderId + "-" + data.id;
       
        if (data.shipmentId === null || data.shipmentId === undefined)
        {
            // need to open the window immediately after the click so the popup blocker doesn't suppress it. 
            //newWindow = window.open('/admin/Scripts/resources/images/legacy/loading.gif');
            
            newWindow = window.open('/admin/Scripts/build/resources/images/loading-shipping-label-m.gif', windowName);
            var errorIcon = "/admin/Scripts/build/resources/images/error-shipping-label.gif";

            me.setLoading(true);
            Ext.Ajax.request( {
                url: '/admin/app/order/shipping/package/prepareshipment',
                method: 'POST',
                jsonData: {
                    orderId: data.orderId,
                    packageIds: [ data.id ],
                    defaultWeight: data.weight,
                    defaultPackagingType: data.packagingType
                },
                success: function (response) {
                    me.setLoading(false);
                    
                    var json = Ext.decode(response.responseText, true);
                    if (!json || !json.success) {
                        Taco.app.fireEvent('setmessage', "Error viewing shipping label", 'error');
                        newWindow.location = errorIcon;
                        return;
                    }
                    newWindow.location = labelUrl;
                    me.record.reload();
                },
                failure: function (response) {
                    var json = Ext.decode(response.responseText, true),
                      msg = (json && json.message) ? json.message : "Error viewing shipping label";
                    Taco.app.fireEvent('setmessage', msg, 'error');
                    newWindow.location = errorIcon;
                    me.setLoading(false);
                }
            });
      
        }
        else {
            window.open(labelUrl, windowName);
        }
    },

    viewPackingSlip: function (button, e) {
        var me = this,
            grid = this.grid,
            data = {
                shippingMethodName: grid.packageData.shippingMethodName,
                items: grid.packageData.items,
                billingContact: this.record.data.billingContact,
                fulfillmentContact: this.record.data.fulfillmentContact,
                payments: this.record.data.payments,
                order: this.record.data,
                siteName: Taco.app.context.getSite().name
            },
            win = window.open(),
            tpl;

        


        tpl = new Ext.XTemplate(
            '<div style="font: 14px/1.5 sans-serif;">',
                '<table style="border-collapse: collapse; border-spacing: 0px; width: 100%;"><tbody><tr>',
                    '<td style="padding: 4px 30px 20px 4px; width: 100%;">',
                        '<h1 style="margin: 0px;">{siteName}</h1>',
                    '</td>',
                    '<td style="padding: 4px 30px 20px 4px;">',
                        '<h2 style="margin: 0px; white-space: nowrap;">PACKING SLIP</h2>',
                        '<table style="border-collapse: collapse; border-spacing: 0px;"><tbody><tr>',
                            '<td style="padding: 4px 30px 4px 4px;">',
                                '<div style="font-weight: bold; white-space: nowrap;">Date:</div>',
                                '<div style="white-space: nowrap;">{order.createDate:date("M d g:ia")}</div>',
                            '</td>',
                            '<td style="padding: 4px 30px 4px 4px;">',
                                '<div style="font-weight: bold; white-space: nowrap;">Order #:</div>',
                                '<div style="font-weight: bold; white-space: nowrap;">{order.orderNumber}</div>',
                            '</td>',
                        '</tr></tbody></table>',
                    '</td>',
                '</tr></tbody></table>',
                '<table style="border-collapse: collapse; border-spacing: 0px; width: 100%;"><tbody>',
                    '<tr>',
                        '<td style="font-weight: bold;">Bill To: (Customer ID #1)</td>',
                        '<td style="font-weight: bold;">Ship To:</td>',
                    '</tr>',
                    '<tr>',
                        '<td style="border-top: 2px solid black; padding: 4px 30px 20px 4px;">',
                            '<div>{billingContact.firstName} {billingContact.lastName}</div>',
                            '<div>{billingContact.address1}</div>',
                            '<div>{billingContact.cityOrTown}, {billingContact.stateOrProvince} {billingContact.postalOrZipCode}</div>',
                            '<div>{billingContact.countryCode}</div>',
                            '<div>{billingContact.homePhone}</div>',
                            '<div>{billingContact.email}</div>',
                        '</td>',
                        '<td style="border-top: 2px solid black; font-size: 16px; font-weight: bold; padding: 4px 30px 20px 4px;">',
                            '<div>{fulfillmentContact.firstName} {fulfillmentContact.lastName}</div>',
                            '<div>{fulfillmentContact.address1}</div>',
                            '<div>{fulfillmentContact.cityOrTown}, {fulfillmentContact.stateOrProvince} {fulfillmentContact.postalOrZipCode}</div>',
                            '<div>{fulfillmentContact.countryCode}</div>',
                            '<div>{fulfillmentContact.homePhone}</div>',
                            '<div>{fulfillmentContact.email}</div>',
                        '</td>',
                    '</tr>',
                    
                    
                    '<tr>',
                        '<td style="font-weight: bold;">Payment Method:</td>',
                        '<td style="font-weight: bold;">Shipping Method:</td>',
                    '</tr>',
                    '<tr>',                
                        '<td style="border-top: 2px solid black; font-weight: bold; padding: 4px 30px 20px 4px;">',
                            '<tpl for="payments">',                                
                                '<tpl if="values.status!=\'Voided\'">',
                                    '<div>{paymentType}<div>',
                                '</tpl>',
                            '</tpl>',
                        '</td>',
                        '<td style="border-top: 2px solid black; padding: 4px 30px 20px 4px;">{shippingMethodName}</td>',
                    '</tr>',
                    
                '</tbody></table>',
                '<table style="border-collapse: collapse; border-spacing: 0px; width: 100%;"><tbody>',
                    '<tr>',
                        '<td style="font-weight: bold; white-space: nowrap;">Code</td>',
                        '<td style="font-weight: bold; white-space: nowrap;">Name</td>',
                        '<td style="font-weight: bold; white-space: nowrap;">Qty</td>',
                        '<td style="font-weight: bold; white-space: nowrap;">Price</td>',
                        '<td style="font-weight: bold; white-space: nowrap;">Total</td>',
                    '</tr>',
                    '<tpl for="items"><tr>',
                        '<td style="border-top: 2px solid black; padding: 4px 30px 15px 4px; white-space: nowrap;">{productCode}</td>',
                        '<td style="border-top: 2px solid black; font-weight: bold; padding: 4px 30px 15px 4px; width: 100%;">{productName}</td>',
                        '<td style="border-top: 2px solid black; padding: 4px 30px 15px 4px; white-space: nowrap;">{quantity}</td>',
                        '<td style="border-top: 2px solid black; padding: 4px 30px 15px 4px; white-space: nowrap;">{unitPrice:usMoney}</td>',
                        '<td style="border-top: 2px solid black; padding: 4px 30px 15px 4px; white-space: nowrap;">{total:usMoney}</td>',
                    '</tr></tpl>',
                '</tbody></table>',
            '</div>'
        );

        //console.log(data, this.data);
        Ext.fly(win.document.body).setHTML(tpl.apply(data));
    }
    

    
});

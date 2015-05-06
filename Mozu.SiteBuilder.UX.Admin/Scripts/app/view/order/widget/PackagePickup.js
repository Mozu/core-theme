/**
 * @class Taco.view.order.widget.PackagePickup
 * this is a container with header designed to contain an order item grid
 * supports the toggling of visibility of the grid;
 */


Ext.define('Taco.view.order.widget.PackagePickup', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Taco.view.order.widget.PickupItemGrid'
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
        
        enabledRemoveButton: true,

        enabledMarkAsFulfilledButton: true,

        
        // this is default sample data just
        headerData: {
            //ui controls
            showVisibilityToggle: true,

            // order info
            title: "Pickup #",
            fulfillmentStatus: "Not Fulfilled",
            itemTotal: 0,
            weight: 0,
            
            fulfillmentDate: "",
            
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
        
        
        me.grid = Ext.create('Taco.view.order.widget.PickupItemGrid', {
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

            enabledRemoveButton: me.getEnabledRemoveButton(),

            enabledMarkAsFulfilledButton: me.getEnabledMarkAsFulfilledButton(),

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

    getToolBarConfig: function () {
        tb = {
            plain: true,
            cls: "package-header-title-row",
            style: "background-color:#ffffff;",
            enableOverflow: true,
            items: []
        };

        return tb

    },

    getHeaderTemplate: function () {
    
        var me = this;

        var toolbarConfig = this.getToolBarConfig();

        toolbarConfig.cls = "package-header-title-row";

        var titleRow = toolbarConfig;

        titleRow.items.push(
            {
                html: this.headerData.title,
                style: "margin-right:20px;",
                xtype: "component"
            },
            { xtype: 'tbfill' }
        );


        if (me.enabledMarkAsFulfilledButton && Ext.Array.contains(this.packageData.availableActions, "PickUp")) {
            me.markAsFulfilledButton = Ext.create("Ext.button.Button", {
                text: 'Mark As Fulfilled',
                ui: 'action',
                margin: "0 2px 0 0",
                scale: 'medium',
                handler: me.grid.markAsFulfilled,
                scope: me
            });

            titleRow.items.push(me.markAsFulfilledButton);
        }

        if (this.headerData.fulfillmentStatus == "NotFulfilled") {
            titleRow.items.push(
                {
                    xtype: "button",
                    ui: "action",
                    scale: "medium",
                    text: "Cancel Pickup",
                    handler: function () {                        
                        this.deletePickup()
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
                                        '<span class="header-label">Order Fulfillment Status</span>',
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

                                '</td>',

                                '<td style="width:34%;vertical-align:top;padding:0 10px 0 10px ">',
                                    '<div class="header-section">',                                                                            

                                        '<div><span class="header-label">Fulfillment Location Code:</span>{fulfillmentLocationCode}</div>',

                                        '<tpl if="values.fulfillmentDate">',
                                            '<div><span class="header-label">Fulfilled Date:</span>{fulfillmentDate:date("F d Y g:ia")}</div>',
                                        '</tpl>',

                                        '<tpl if="values.weight">',
                                            '<div><span class="header-label">Weight:</span> {weight} lbs</div>',
                                        '</tpl>',

                                
                                    '</div>',

                                '</td>',

                                '<td style="width:33%;vertical-align:top;padding-bottom:19px;">',
                                    '<div class="header-section">',


                                    '<div class="shipTo">',
                                        '<div class="header-label">Fulfillment Contact</div>',
                                        '<div>{firstName:stripTags} {lastName:stripTags}</div>',
                                        '<tpl if="values.phoneNumber">',
                                            '<div>{phoneNumber:stripTags}</div>',
                                        '</tpl>',
                                        '<tpl if="values.email">',
                                            '<div>{email}</div>',
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

                                        
                                    }
                                },
                                scope: this
                            }
                        }
                    }
                }
            ]
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

    deletePickup: function() {
        var me = this;
        // get package json
        var data = me.packageData;

        config = {
            jsonData: {
                orderId : this.record.get("id"),
                pickupIds: [data.id]
            },
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    Taco.app.fireEvent('setmessage', "error deleting pickup", 'error');
                    Taco.app.viewPort.setLoading(false);
                    return;
                }
                // reload the record
                this.record.reload();
            },
            failure: function (response) {
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : "Error deleting pickup";
                Taco.app.fireEvent('setmessage', msg, 'error');
                Taco.app.viewPort.setLoading(false);
            },
            scope: this
        };
        
        Taco.app.viewPort.setLoading(true);

        // call the model method to persist the change
        this.record.deletePickup(config);
    }
    
});

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

            enableToobar: me.getEnableToolbar()
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
                    '<div class="titleRow">',
                        ' {title} ',
                        '<span class="seperator">|</span>',
                        '<tpl if="values.fulfillmentStatus==\'NotFulfilled\'">',
                            "Not Fulfilled",
                        '<tpl else>',
                            "Fulfilled",
                        '</tpl>',
                        '<tpl if="values.fulfillmentStatus==\'Fulfilled\'">',
                            '<span class="seperator">|</span>',
                            'Fulfilled Date: {shipDate:date("F d Y g:ia")}',
                        '<tpl else>',
                            '<span class="seperator">|</span>',
                            '<a class="shipmentAction" shipmentAction="deletePickup">Delete</a>',
                        '</tpl>',
                        
                

                    '</div>',
                

                    '<div class="orderCountRow">',
                        '<tpl if="values.itemTotal">',
                            ' Package Item Count: {itemTotal} ',
                            '<span class="seperator">|</span>',
                        '</tpl>',
                        'Weight: {weight} lbs',
                    '</div>',
                    '<div class="shipTo">',
                        'Fulfillment Contact:  {firstName} {lastName} ',
                        '<tpl if="values.phoneNumber">',
                            '<span class="seperator">|</span>',
                            ' {phoneNumber} ',
                        '</tpl>',
                        '<tpl if="values.email">',
                            '<span class="seperator">|</span>',
                            ' {email} ',
                        '</tpl>',
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
                                
                                case "deletePickup":
                                    this.deletePickup()
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

    deletePickup: function() {
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
                    Taco.app.fireEvent('setmessage', "error deleting pickup", 'error');
                    Taco.app.viewPort.setLoading(false);
                    return;
                }
                // reload the record
                this.record.reload();
            },
            failure: function (response) {
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.Message) ? json.Message : "Error deleting pickup";
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

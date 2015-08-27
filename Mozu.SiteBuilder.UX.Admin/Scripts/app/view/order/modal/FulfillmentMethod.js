/**
 * @class Taco.view.order.modal.FulfillmentMethod
 */

Ext.define('Taco.view.order.modal.FulfillmentMethod', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.model.SiteShippingSettings',
        'Taco.view.order.widget.LocationPickupGrid',
        'Taco.model.Location',
        'Taco.store.LocationInventories'
    ],
    autoShow: true,
    closeAction: 'destroy',
    scale: 'large',
    title: 'Fulfillment Method',
    layout: {
        type: 'fit'
    },
    initComponent: function () {
        var me = this;


        
        
        Taco.model.SiteShippingSettings.load(123, {
            success: function (record, o) {
                me.shippingLocationCode = record.get("shippingLocationCode");
                me.initUI();
            },
            scope: this
        });

        me.directShipRadio = Ext.create('Ext.form.field.Radio', {
            name: 'fulfillmentMethod',
            boxLabel: 'Direct Ship',
            inputValue: 'ship',
            margin: "0 0 10 40px",
            checked: (me.record.get('fulfillmentMethod')== "Ship"),
            listeners: {
                change: {
                    fn:function(field, newValue, oldValue, eOpts) {
                        if (newValue) {
                            me.getLayout().setActiveItem(me.directShipPanel);
                            me.saveButton.enable();
                        } else {
                            
                            me.getLayout().setActiveItem(me.inStorePickupPanel);
                            
                            if (me.inStorePickupPanel.getSelectionModel().getSelection().length) {
                                me.saveButton.enable()
                            } else {
                                // if there is nothing currently selected then disable the save button;
                                me.saveButton.disable();
                            }
                        }
                    },
                    scope:me
                }
            },
            scope: me
        });
        
        me.inStorePickupRadio = Ext.create('Ext.form.field.Radio', {
            name: 'fulfillmentMethod',
            boxLabel: 'In Store Pickup',
            inputValue: 'inStorePickup',
            checked: (me.record.get('fulfillmentMethod') != "Ship"),
            margin: "0 0 10 40px"
        });

        me.fulfillmentTypePanel = Ext.create('Ext.form.FieldContainer', {
            dock: 'top',
            layout:"hbox",
            style: "border-bottom:1px solid #cccccc",
            items: [
                 me.directShipRadio,
                 me.inStorePickupRadio
            ]
        });

        me.dockedItems.push(me.fulfillmentTypePanel);

        
        

        // need to get location and locationInventory data for direct ship location

        
        var fulfillmentMethod = this.record.get("fulfillmentMethod");
        var fulfillmentLocationCode = this.record.get("fulfillmentLocationCode");


        



        this.directShipLocationPanel = Ext.create('Ext.container.Container', {
            title: "Direct Ship Location",
            
            cls: "taco-directshiplocationpanel",
            tpl: [
                '<tpl if="isLoading">',
                    'Loading...',
                '<tpl else>',
                    '<div>Location Name: {name}</div>',
                    '<div>Description: {description}</div>',
                    '<div>Code: {code}</div>',
                    '<div>Address:', 
                        '<div class="address">',
                            '<tpl if="address.address1">{address.address1} <br/></tpl>',
                            '<tpl if="address.address2">{address.address2} <br/></tpl>',
                            '<tpl if="address.address3">{address.address3} <br/></tpl>',
                            '<tpl if="address.address4">{address.address4} <br/></tpl>',
                            '{address.cityOrTown} {address.stateOrProvince} {address.postalOrZipCode} {address.countryCode}',
                        '</div>',
                    '</div>',

                    '<tpl if="phone">',
                        '<div>Phone Number: {phone}</div>',
                    '</tpl>',
                
                    '<div>Shipping Origin Contact:',
                        '<div class="shipping-origin-contact">',
                            '<tpl if="shippingOriginContact.comapnyOrOrganization">',
                                '<div>Company: {shippingOriginContact.comapnyOrOrganization}</div>',
                            '</tpl>',
                            '<tpl if="shippingOriginContact.firstName ||shippingOriginContact.middleNameOrInitial || shippingOriginContact.lastNameOrSurname ">',
                                '<div>Name: {shippingOriginContact.firstName} {shippingOriginContact.middleNameOrInitial} {shippingOriginContact.lastNameOrSurname}</div>',
                            '</tpl>',
                            '<tpl if="shippingOriginContact.email">',
                                '<div>Email: {shippingOriginContact.email}</div>',
                            '</tpl>',
                            '<tpl if="shippingOriginContact.phoneNumber">',
                                '<div>Phone Number: {shippingOriginContact.phoneNumber}</div>',
                            '</tpl>',
                        '</div>',
                    '</div>',
                '</tpl>'
            ],
            data: {
                isLoading: true
            }
        });

        //this.directShipLocationPanel.mask("Loading");
        

        this.directShipInventoryPanel = Ext.create('Ext.container.Container', {
            title: "Inventory at this location",
            cls: "taco-directshipinventorypanel",
            margin:"0 0 0 19",
            width: 200,
            dock:'right',
            tpl: [
                '<tpl if="isLoading">',
                    'Loading...',
                '<tpl else>',
                    '<div>Available: {stockAvailable}</div>',
                    '<div>On Reserve: {stockReserved}</div>',
                    '<div>On Hand: {stockOnHand}</div>',
                '</tpl>'
            ],
            data: {
                isLoading:true
            }
        });
        
        

        me.layout = "card";

        this.directShipPanel = Ext.create('Ext.panel.Panel', {
            layout: 'fit',
            dockedItems: [
                this.directShipInventoryPanel
            ],
            items: [
                this.directShipLocationPanel
            ]
        });

        
        

        
        this.inStorePickupPanel = Ext.create('Taco.view.order.widget.LocationPickupGrid', { record: me.record });
        this.inStorePickupPanel.on('selectionchange',function(grid, selected) {
            if (selected.length) {
                me.saveButton.enable();
            } else {
                me.saveButton.disable();
            }
        })
        
        me.layout = 'card';
        me.deferredRender = true

        me.items = [
            this.directShipPanel,
            this.inStorePickupPanel
        ];
        
        // set the correct panel to be active; Uses index position;
        me.activeItem = (me.record.get("fulfillmentMethod") == "Ship") ? 0 : 1;
        
        me.callParent(arguments);
        

        me.saveButton = me.down('#primaryAction');
        me.saveButton.disable();
        

    },
    
    initUI: function () {
        var me = this;
        
        // need to get the location data;
        if (!me.locationData && !me.locationDataLoading) {
            me.locationDataLoading = true;
            
            Taco.model.Location.load(me.shippingLocationCode, {
                success: function (record, o) {
                    me.locationData = record.data;
                    me.initUI();
                },
                failure: function () {

                },
                scope: this
            });
        }
        
        // need to get the locationInvetoryData
        if (!me.locationInventoryData && !me.locationInventoryDataLoading) {
            me.locationInventoryDataLoading = true;
            
            //Taco.store.LocationInventories
            
            

            var inventoryStore = Ext.create('Taco.store.LocationInventories', {
                autoLoad: false,
                listeners: {
                    load: {
                        fn: function (response) {
                            // default data; if no inventory is returned, it means there is no inventory available at the directShip location
                            var data = {
                                stockAvailable: 0,
                                stockOnHand: 0,
                                stockReserved: 0
                            };
                            // if there is location data, then there is inventory at the directship location;
                            if (response.getCount() && response.data.items[0].data) {
                                data = response.data.items[0].data;
                            }
                            
                            me.locationInventoryData = data;
                            me.initUI();
                        },
                        single: true,
                        scope: me
                    }
                }
            });
            
            inventoryStore.extraFilters.add([
                { id: "productCode", property: 'productCode', value: me.record.get("productCode") },
                { id: "locationCode", property: 'locationCode', value: me.shippingLocationCode }
            ]);
            
            inventoryStore.load();
            
        }
        
        // need to wait for the location and locationInventory data to load
        if (!me.locationData || !me.locationInventoryData) {
            return
        }

        /*

        var locationData = {
            name: "name here",
            description: "description here",
            code: "code here",
            phone: "555 555 5555",
            shippingOriginContact: "Shipping contact",
            "address": {
                "address1": "asdf",
                "address2": "asdf",
                "address3": "asdf",
                "address4": "asdf",
                "cityOrTown": "austin",
                "stateOrProvince": "tx",
                "countryCode": "us",
                "postalOrZipCode": "78731",
                "addressType": {},
                "addressIsValidated": false
            }
        };

        var locationInventoryData = {
            stockAvailable: 100,
            stockReserved: 100,
            stockOnHand: 100
        };

        */
        
        this.directShipLocationPanel.update(me.locationData);
        this.directShipInventoryPanel.update(me.locationInventoryData);

        me.saveButton.enable();
    },

    doSave: function () {
        var me = this,
            fulfillmentLocationCode = "";

        me.setLoading({
            msg: "Saving"
        }, me.body);

        var fulfillmentMethod = (me.inStorePickupRadio.checked) ? "Pickup" : "Ship";
        var selectedLocation = this.inStorePickupPanel.getSelectionModel().getSelection();
        if (me.inStorePickupRadio.checked && selectedLocation.length) {

            selectedLocation = selectedLocation[0];

            fulfillmentLocationCode = selectedLocation.get("locationCode");
        } else {
            fulfillmentLocationCode = me.locationData.code;
        }




        me.record.set("fulfillmentMethod", fulfillmentMethod);
        me.record.set("fulfillmentLocationCode", fulfillmentLocationCode);

        var orderId = me.orderRecord.get("id");

        me.orderRecord.editOrderItemFulfillmentMethod({
            jsonData: {
                orderId: orderId,
                orderItems: [
                    Ext.clone(me.record.data)
                ]
            },
            failure: function (response) {
                me.setLoading(false, me.body);
            },
            success: function (response) {
                var me = this;
                me.setLoading(false, me.body);

                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    return;
                }
                
                me.saveSuccess(json);
            },
            scope: this
        });
        

    }
});

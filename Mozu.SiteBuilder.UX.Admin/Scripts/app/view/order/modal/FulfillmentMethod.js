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
            failure: function () {

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

                        } else {
                            me.getLayout().setActiveItem(me.inStorePickupPanel);
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

        me.fullfillmentTypePanel = Ext.create('Ext.form.FieldContainer', {
            dock: 'top',
            layout:"hbox",
            style: "border-bottom:1px solid #cccccc",
            items: [
                 me.directShipRadio,
                 me.inStorePickupRadio
            ]
        });

        me.dockedItems.push(me.fullfillmentTypePanel);

        
        

        // need to get location and locationInventory data for direct ship location

        
        var fulfillmentMethod = this.record.get("fulfillmentMethod");
        var fulfillmentLocationCode = this.record.get("fulfillmentLocationCode");


        



        this.directShipLocationPanel = Ext.create('Ext.container.Container', {
            title: "Direct Ship Location",
            style:"border:1px solid #ccc; padding:19px",
            tpl: [
                '<div>name:{name}</div>',
                '<div>Description:{description}</div>',
                '<div>Code:{code}</div>',
                '<div>Address:{address1} {address2} {address3} {address4} {cityOrTown} {stateOrProvince} {postalOrZipCode} {countryCode} </div>',
                '<div>Phone Number:{phone}</div>',
                '<div>Shipping Origin Contact:{shippingOriginContact}</div>'
            ]
            //,data: locationData
        });
        
        

        this.directShipInventoryPanel = Ext.create('Ext.container.Container', {
            title: "Inventory at this location",
            style: "border:1px solid #ccc; padding:19px;border-left-width:1px !important",
            margin:"0 0 0 19",
            width: 200,
            dock:'right',
            tpl: [
                '<div>Available: {stockAvailable}</div>',
                '<div>On Reserve: {stockReserved}</div>',
                '<div>On Hand: {stockOnHand}</div>'
            ]
            //,data: locationInventoryData
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

        
        

        
        this.inStorePickupPanel = Ext.create('Taco.view.order.widget.LocationPickupGrid');
        
        me.layout = 'card';
        me.deferredRender = true

        me.items = [
            this.directShipPanel,
            this.inStorePickupPanel
        ];
        
        // set the correct panel to be active; Uses index position;
        me.activeItem = (me.record.get("fulfillmentMethod") == "Ship") ? 0 : 1;
        
        me.callParent(arguments);

        

        /*
        this.on({
            save: {
                scope: this,
                fn: 'save'
            }
        });

        this.storeCreditPanel.on({
           validitychange: {
               scope: this,
               fn: 'checkValidity'
           } 
        });

        this.grid.on({
           edit: {
                scope: this,
                fn: 'checkValidity'
            },
            viewready: {
                scope: this,
                fn: 'checkValidity'
            }
        });
    
        this.primaryAction = this.down('#primaryAction');
        */
    },
    
    initUI: function () {
        var me = this;
        
        // need to get the location data;
        if (!me.locationData && !me.locationDataLoading) {
            me.locationDataLoading = true;
            
            Taco.model.Location.load(me.shippingLocationCode, {
                success: function (record, o) {
                    me.locationData = record;
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
        
        this.directShipLocationPanel.update(locationData);
        this.directShipInventoryPanel.update(locationInventoryData);
    },
    
    save: function () {
        var me = this
        
        /*

        if (this.creditCardRadio.getValue()) {
            this.store.each(function (item) {
                if (item.get('amountToRefund') > 0) {
                    payments.push({
                        orderId: this.order.getId(),
                        returnId: this.record.getId(),
                        paymentType: 'CreditCard',
                        amount: item.get('amountToRefund'),
                        paymentId: item.get('id')
                    });
                }
            }, this);
        } else {
            //this.storeCreditPanel.getValues()['refundAmount']  
            payments.push({
                orderId: this.order.getId(),
                returnId: this.record.getId(),
                paymentType: 'StoreCredit',
                amount: this.storeCreditPanel.getValues()['refundAmount']
            });
        }
        
        this.record.performPaymentAction(payments, {
            success: function () {
                // me.setLoading(false, me.body);
            }
        });

        */
    }
});

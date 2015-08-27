/**
 * @class Taco.view.settings.shipping.subform.MethodsAndRates
 *
 */

Ext.define('Taco.view.settings.shipping.subform.MethodsAndRates', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.store.ShippingCarrierSettings',
        'Taco.view.settings.shipping.subform.Custom',
        'Taco.view.settings.shipping.subform.ShippingProvider'
    ],
    title: 'Shipping Methods and Rates',
    margin: "0 0 20 0",
    ui: "subform",
    width: "100%",
    enableStoreSyncTasks: true,
    initComponent: function () {
        var me = this;
        
        store = Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingCarrierSettings');


        this.custom = Ext.create('Taco.view.settings.shipping.subform.Custom', {
            record: this.record
        });


        this.tabs = Ext.create('Ext.tab.Panel', {
            width: "100%",
            height: 550,
            
            //border: '1px',
            style: {
                borderColor: '#cccccc',
                borderWidth: '1px',
                borderStyle: 'solid'
            },
            
            
            items: [
                this.custom
            ]
        });


        this.items = [this.tabs];
        this.callParent(arguments);

        if (store.isLoading()) {
            store.on('load', me.onStoreLoad, me);
        } else {
            me.onStoreLoad(store);
        }
    },
    onStoreLoad: function (store) {

        this.fedex = Ext.create('Taco.view.settings.shipping.subform.ShippingProvider', {
            record: store.getById('fedex'),

            title: 'FedEx',
            providerId: 'fedex',
            configureCopy: '<img src="http://images.fedex.com/images/c/t1/gh/logo-header-fedex.png"/> <div style="margin-top:15px">Please provide your FedEx account credentials.</div><div style="margin-top:50px; font-size: 85%">The FedEx service marks are owned by Federal Express Corporation and are used by permission.</div>',
            ratesCopy: '<img src="http://images.fedex.com/images/c/t1/gh/logo-header-fedex.png"/> <div style="margin-top:15px">Please provide your FedEx account credentials.</div><div style="margin-top:50px; font-size: 85%">The FedEx service marks are owned by Federal Express Corporation and are used by permission.</div>',
            customFileds: [
                {
                    xtype: 'textfield',
                    name: 'apiusername',
                    fieldLabel: 'API user name'
                },
                {
                    xtype: 'textfield',
                    name: 'apipassword',
                    fieldLable: 'API password',
                    fieldLabel: 'password'
                },
                {
                    xtype: 'textfield',
                    name: 'meternumber',
                    fieldLabel: 'meter number'
                },
                {
                    xtype: 'textfield',
                    name: 'accountnumber',
                    fieldLabel: 'account number'
                },
                {
                    xtype: 'selectfield',
                    name: 'pickuptype',
                    fieldLabel: 'pickup type',
                    valueField: 'id',
                    displayField: 'value',
                    //value: '',
                    allowBlank:true,
                    store: Ext.create('Ext.data.Store', {
                        fields: ['id', 'value'],
                        data: [
                            //{ "id": '', value: '' },
                            { "id": "BUSINESS_SERVICE_CENTER", "value": "Business Serivce Center" },
                            { "id": "DROP_BOX", "value": "Drop Box" },
                            { "id": "REGULAR_PICKUP", "value": "Regular Pickup" },
                            { "id": "REQUEST_COURIER", "value": "Request Courier" },
                            { "id": "STATION", "value": "Station" }
                        ]
                    })
                }
            ]
        });

        this.UPS = Ext.create('Taco.view.settings.shipping.subform.ShippingProvider', {
            record: store.getById('ups'),
            title: 'UPS',
            providerId: 'ups',
            configureCopy: '<img src="http://www.ups.com/img/glo_ups_brandmark.gif"/>',
            ratesCopy: '<img src="http://www.ups.com/img/glo_ups_brandmark.gif"/>',
            customFileds: [
                {
                    xtype: 'textfield',
                    name: 'apiusername',
                    fieldLabel: 'API user name'
                },
                {
                    xtype: 'textfield',
                    name: 'apipassword',
                    fieldLable: 'API password',
                    fieldLabel: 'password'
                },
                {
                    xtype: 'textfield',
                    name: 'licensekey',
                    fieldLabel: 'license key'
                },
                //erroring from service
                {  
                    xtype: 'textfield',
                    name: 'shippernumber',
                    fieldLabel: 'shipper number'
                }
            ]
        });


        this.USPS = Ext.create('Taco.view.settings.shipping.subform.ShippingProvider', {
            record: store.getById('usps'),
            title: 'USPS',
            providerId: 'usps',
            configureCopy: '<img src="https://www.usps.com/ContentTemplates/assets/images/global/usps_logo.gif"/> <div>Please provide your USPS account credentials.</div>',
            ratesCopy: '<img src="https://www.usps.com/ContentTemplates/assets/images/global/usps_logo.gif"/> <div>Please provide your USPS account credentials.</div>',
            customFileds: [
                {
                    xtype: 'textfield',
                    name: 'apiusername',
                    fieldLabel: 'API user name'
                },
                {
                    xtype: 'textfield',
                    name: 'apipassword',
                    fieldLable: 'API password',
                    fieldLabel: 'password'
                },
                {
                    xtype: 'textfield',
                    name: 'appid',
                    fieldLabel: 'app id'
                }
            ]
        });


        this.tabs.add([this.fedex, this.UPS, this.USPS]);


    }
});
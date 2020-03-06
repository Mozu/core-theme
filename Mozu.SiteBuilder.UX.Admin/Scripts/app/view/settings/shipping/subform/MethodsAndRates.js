/**
 * @class Taco.view.settings.shipping.subform.MethodsAndRates
 *
 */

Ext.define('Taco.view.settings.shipping.subform.MethodsAndRates', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.store.ShippingCarrierSettings',
        'Taco.view.settings.shipping.subform.Custom',
        'Taco.view.settings.shipping.subform.ShippingProvider',
        'Taco.store.States2',
        'Taco.store.CarrierAccounts',
        'Taco.store.CarrierCredentials',
        'Taco.model.CarrierAccountList'
    ],
    title: 'Shipping Methods and Rates',
    margin: "0 0 20 0",
    ui: "subform",
    width: "100%",
    enableSearchBarInHeader: false,
    enableStoreSyncTasks: true,
    initComponent: function () {
        var me = this;
        
        store = Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingCarrierSettings');
        //carrierAccountStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CarrierCredentials');
        carrierAccountStore = Ext.create('Taco.store.CarrierCredentials');
        carrierAccountStore.proxy.extraParams = { siteId: Taco.app.context.getSiteId() }


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

        var allStores = [store, carrierAccountStore];
        var loadedStores = 0;
          

        Ext.Array.each(allStores, function (storeCur, index, storearray) {


            storeCur.load({
                callback: function (r, options, success) {
                    if (success === true) {


                        loadedStores = loadedStores + 1;


                        if (loadedStores == allStores.length) {


                            me.onStoreLoad(store, carrierAccountStore);


                        }


                    }
                }
            });


        });

    
    },
    onStoreLoad: function (store, carrierAccountStore) {
        var stateStore = Ext.create('Taco.store.States2');

        this.fedexStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.CarrierAccountList',
            idProperty: 'code',
            storeId: 'fedextoreid',
            remoteFilter: true,
            remoteSort: false,
            pageSize: 15,
            storeManagerConfig: {
                clearFilters: true,
                clearSort: true,
                autoLoad: false
            },
            proxy: {
                type: 'ajax',
                api: {
                    read: '/admin/app/carriers/credentialsset/List?carrierId=fedex',
                },
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success',
                    messageProperty: "message"
                },
                writer: {
                    allowSingle: false,
                    type: 'json'
                }
            }
        });

        

        var getfedexRecord = carrierAccountStore.getById('fedex');
        var setfedexValue = "0"
        if (getfedexRecord) {
            setfedexValue = getfedexRecord.get('code')
        }

        var fedexCombo =  Ext.create('widget.combo', {
            //record: carrierAccountStore.getById('fedex'),
            //name: 'code',
            fieldLabel: 'Carrier Account',
            valueField: 'code',
            displayField: 'name',
            pageSize: 15,
            forceSelection: true,
            enableKeyboardPaging: true,
            record: carrierAccountStore.getById('fedex'),
            queryMode: 'remote',
            allowBlank: true,
            store: this.fedexStore,
            setValue: function (value, doSelect) {
                var copyArgs = arguments;

                var selectedValue = typeof (value) === 'object' ? value[0].get('code') : value
                if (selectedValue && !this.store.findRecord('code', selectedValue)) {
                    this.store.model.setProxy({
                        type: 'ajaxproxy',

                        api: {
                            read: '/admin/app/carriers/credentialsset/List?carrierId=fedex',
                        },
                        reader: {
                            type: 'json',
                            root: 'items',
                            successProperty: 'success',
                            messageProperty: "message"
                        },

                        writer: {
                            allowSingle: true,
                            type: 'json'
                        }
                    }),
                        
                    this.store.model.load(selectedValue, {                
                        scope: this,
                        success: function (record, operation) {
                            this.store.add(record);
                            this.setValue.apply(this, [selectedValue]);
                        }
                    });
                } else if (selectedValue) {
                    this.__proto__.setValue.apply(this, [selectedValue])
                }
            }
        });

        this.fedex = Ext.create('Taco.view.settings.shipping.subform.ShippingProvider', {
            record: store.getById('fedex'),
            title: 'FedEx',
            providerId: 'fedex',
            configureCopy: '<img src="http://images.fedex.com/images/c/t1/gh/logo-header-fedex.png"/> <div style="margin-top:15px">Please provide your FedEx account credentials.</div><div style="margin-top:50px; font-size: 85%">The FedEx service marks are owned by Federal Express Corporation and are used by permission.</div>',
            ratesCopy: '<img src="http://images.fedex.com/images/c/t1/gh/logo-header-fedex.png"/> <div style="margin-top:15px">Please provide your FedEx account credentials.</div><div style="margin-top:50px; font-size: 85%">The FedEx service marks are owned by Federal Express Corporation and are used by permission.</div>',
            customFileds: [
                fedexCombo
            ]
        });

        this.fedexStore.load({
            callback: function() { fedexCombo.setValue(setfedexValue) }
        });

        
        this.upsStore = Ext.create('Ext.data.Store', {
             model: 'Taco.model.CarrierAccountList',
            idProperty: 'code',
            storeId: 'upstoreid',
            remoteFilter: true,
            remoteSort: false,
            pageSize: 15,
            storeManagerConfig: {
                clearFilters: true,
                clearSort: true,
                autoLoad: true
            },
            proxy: {
                type: 'ajax',
                api: {
                    read: '/admin/app/carriers/credentialsset/List?carrierId=ups',
                },
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success',
                    messageProperty: "message"
                },
                writer: {
                    allowSingle: false,
                    type: 'json'
                }
                
            }
        });

        var upsCombo =  Ext.create('widget.combo', {
            xtype: 'combo',
            name: 'name',
            //fieldLabel: 'Carrier Account',
            fieldLabel: 'Carrier Account',
            valueField: 'code',
            displayField: 'name',
            record: carrierAccountStore.getById('ups'),
            pageSize: 15,
            forceSelection: false,
            enableKeyboardPaging: true,
            queryMode: 'remote',
            allowBlank: true,
            store: this.upsStore,
            setValue: function (value, doSelect) {
                var copyArgs = arguments;

                var selectedValue = typeof (value) === 'object' ? value[0].get('code') : value
                if (selectedValue && !this.store.findRecord('code', selectedValue)) {
                    this.store.model.setProxy({
                        type: 'ajaxproxy',

                        api: {
                            read: '/admin/app/carriers/credentialsset/List?carrierId=ups',
                        },
                        reader: {
                            type: 'json',
                            root: 'items',
                            successProperty: 'success',
                            messageProperty: "message"
                        },

                        writer: {
                            allowSingle: true,
                            type: 'json'
                        }
                    }),

                        this.store.model.load(selectedValue, {
                            scope: this,
                            success: function (record, operation) {
                                this.store.add(record);
                                this.setValue.apply(this, [selectedValue]);
                            }
                        });
                } else if (selectedValue) {
                    this.__proto__.setValue.apply(this, [selectedValue])
                }
            },
        });

        var getuspRecord = carrierAccountStore.getById('ups');
        var setuspValue = "0"
        if (getuspRecord) {
            setuspValue = getuspRecord.get('code')
        }

            this.UPS = Ext.create('Taco.view.settings.shipping.subform.ShippingProvider', {
            record: store.getById('ups'),
            title: 'UPS',
            providerId: 'ups',
            configureCopy: '<img src="http://www.ups.com/img/glo_ups_brandmark.gif"/>',
            ratesCopy: '<img src="http://www.ups.com/img/glo_ups_brandmark.gif"/>',
            customFileds: [
                upsCombo
            ],
            returnFields: [
            ]
        });

        this.upsStore.load({
            callback: function() { upsCombo.setValue(setuspValue) }
        });


        this.uspsStore = Ext.create('Ext.data.Store', {
             model: 'Taco.model.CarrierAccountList',
            idProperty: 'code',
            storeId: 'uspstoreid',
            remoteFilter: true,
            remoteSort: false,
            pageSize: 15,
            storeManagerConfig: {
                clearFilters: true,
                clearSort: true,
                autoLoad: true
            },
            proxy: {
                type: 'ajax',
                api: {
                    read: '/admin/app/carriers/credentialsset/List?carrierId=usps',
                },
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success',
                    messageProperty: "message"
                },
                writer: {
                    allowSingle: false,
                    type: 'json'
                }
            }
        });

        var uspsCombo =  Ext.create('widget.combo', {
            xtype: 'combo',
            name: 'name',
            editable: true,  
            record: carrierAccountStore.getById('usps'),
            fieldLabel: 'Carrier Account',
            valueField: 'code',
            displayField: 'name',
            pageSize: 15,
            forceSelection: true,
            //enableKeyboardPaging: true,
            queryMode: 'remote',
            allowBlank: true,
            store: this.uspsStore,
            setValue: function (value, doSelect) {
                var copyArgs = arguments;

                var selectedValue = typeof (value) === 'object' ? value[0].get('code') : value
                if (selectedValue && !this.store.findRecord('code', selectedValue)) {
                    this.store.model.setProxy({
                        type: 'ajaxproxy',

                        api: {
                            read: '/admin/app/carriers/credentialsset/List?carrierId=usps',
                        },
                        reader: {
                            type: 'json',
                            root: 'items',
                            successProperty: 'success',
                            messageProperty: "message"
                        },

                        writer: {
                            allowSingle: true,
                            type: 'json'
                        }
                    }),

                        this.store.model.load(selectedValue, {
                            scope: this,
                            success: function (record, operation) {
                                this.store.add(record);
                                this.setValue.apply(this, [selectedValue]);
                            }
                        });
                } else if (selectedValue) {
                    this.__proto__.setValue.apply(this, [selectedValue])
                }
            },
        });

        var getRecord = carrierAccountStore.getById('usps');
        var setUspsValue = "0"
        if (getRecord) {
            setUspsValue = getRecord.get('code')
        }
                    
        this.USPS = Ext.create('Taco.view.settings.shipping.subform.ShippingProvider', {
            record: store.getById('usps'),
            title: 'USPS',
            providerId: 'usps',
            configureCopy: '<img src="https://www.usps.com/ContentTemplates/assets/images/global/usps_logo.gif"/> <div>Please provide your USPS account credentials.</div>',
            ratesCopy: '<img src="https://www.usps.com/ContentTemplates/assets/images/global/usps_logo.gif"/> <div>Please provide your USPS account credentials.</div>',
            stateStore: stateStore,
            customFileds: [
                uspsCombo
            ]
        });


        this.uspsStore.load({
            callback: function() { uspsCombo.setValue(setUspsValue) }
        });

        //TODO:-We can add this code once CanadaPost changes add in Dev01 branch
        //this.uspsStore = Ext.create('Taco.store.Carriertypes', {
        //    storeId: 'canadapoststoreid',
        //    autoLoad: true
        //});
        //this.uspsStore.proxy.extraParams = { carrierId: 'canadapost' }
        //this.canadaPost = Ext.create('Taco.view.settings.shipping.subform.ShippingProvider', {
        //    record: store.getById('canadapost'),
        //    title: 'Canada Post',
        //    providerId: 'canadapost',
        //    configureCopy: '<img src="https://www.canadapost.ca/cpc/assets/cpc/uploads/logos/aboutus/cpc-main-logo.svg"/> <div>Please provide your Canada Post account credentials.</div>',
        //    ratesCopy: '<img src="https://www.canadapost.ca/cpc/assets/cpc/uploads/logos/aboutus/cpc-main-logo.svg"/> <div>Please provide your Canada Post account credentials.</div>',
        //    stateStore: stateStore,
        //    customFileds: [


        //        {
        //            xtype: 'selectfield',
        //            // name: 'name',
        //            record: carrierAccountStore.getById('canadapost'),
        //            fieldLabel: 'Carrier Account',
        //            valueField: 'code',
        //            displayField: 'name',
        //            pageSize: 25,
        //            //value: '',
        //            allowBlank: true,
        //            store: Ext.data.StoreManager.lookup('canadapoststoreid'),
        //            listeners: {
        //                scope: this,
        //                afterRender: function (me) {
        //                    var getRecord = carrierAccountStore.getById('canadapost');
        //                    if (getRecord) {
        //                        me.setValue(getRecord.get('code'));
        //                    }
        //                    else {
        //                        me.setValue('0');
        //                    }
        //                }
        //            },
        //            //  renderTo: Ext.getBody()
        //        }
        
        //    ]
        //});

        this.tabs.add([this.fedex, this.UPS, this.USPS]);


    },

    persistFormValues: function () {
        var me = this;
        me.fedex.record.data.areCredentialsSet = !(me.fedex.record.data.settings.apipassword === null || me.fedex.record.data.settings.apipassword === '');
        me.UPS.record.data.areCredentialsSet = !(me.UPS.record.data.settings.apipassword === null || me.UPS.record.data.settings.apipassword === '');
        me.USPS.record.data.areCredentialsSet = !(me.USPS.record.data.settings.apipassword === null || me.USPS.record.data.settings.apipassword === '');
      //  me.canadaPost.record.data.areCredentialsSet = !(me.canadaPost.record.data.settings.apipassword === null || me.canadaPost.record.data.settings.apipassword === '');
    }
});
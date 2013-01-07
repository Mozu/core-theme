/**
 * @class Taco.view.shipping.Index
 */
    Ext.define('Taco.view.shipping.Index', {
        extend: 'Taco.core.ux.form.Editor',
        requires: ['Taco.store.ShippingClasses', 'Taco.store.SiteShippingRegions', 'Taco.model.ShippingRate', 'Taco.store.UspsSharedShippingMethods', 'Taco.store.InternationalShippingRates', 'Taco.store.DomesticShippingRates', 'Taco.view.shipping.CountrySelector', 'Taco.model.ActiveRateProvider', 'Taco.view.shipping.UspsConfigurationEditor', 'Taco.model.SiteShippingRegion', 'Taco.model.SiteShippingOriginAddress', 'Taco.view.shipping.CustomRateEditor', 'Taco.view.shipping.OriginField', 'Taco.view.shipping.OriginStaticField', 'Taco.view.shipping.OriginEditor',  'Taco.core.ux.form.SelectField', 'Taco.core.ux.action.DirtyButton', 'Taco.core.ux.form.BoxSelect', 'Taco.core.ux.CountrySelector', 'Taco.core.ux.action.DirtyButton'],
        title: 'Shipping',
        model: 'Taco.model.ShippingRate',
        type: 'shipping',

        initComponent: function () {
            var me = this;

            me.on({
                load: {
                    fn: me.onLoad,
                    scope: me
                },
                beforesave: {
                    fn: me.onBeforeSave,
                    scope: me
                }
            });

            me.actions = [{
                xtype: 'secondarybutton',
                text: 'Cancel',
                eventName: 'cancel'
            }, {
                xtype: 'dirtybutton',
                text: 'Save',
                eventName: 'save'
            }];

            me.countrySelector = Ext.create('Taco.view.shipping.CountrySelector', {
                name: 'countryCodes',
                fieldLabel: 'Ship to countries',
                labelAlign: 'top'
            });

            me.countrySelector.setVisible(false);

            me.countrySelector.on({
                change: {
                    fn: me.countryChange,
                    scope: me
                }
            });

            me.domesticRateStore = Ext.create('Taco.store.DomesticShippingRates');
            me.intlRateStore = Ext.create('Taco.store.InternationalShippingRates');

            me.domesticRateEditor = Ext.create('Taco.view.shipping.CustomRateEditor', {
                name: 'domesticrate',
                sectionTitle: 'Domestic (United States)',
                model: 'Taco.model.DomesticShippingRate',
                store: me.domesticRateStore
            });

            // TODO: Temp until I can get form events working
            me.domesticRateEditor.on({
                dirtychange: {
                    fn: me.saveButtonCheck,
                    scope: me
                }
            });

            me.intlRateEditor = Ext.create('Taco.view.shipping.CustomRateEditor', {
                name: 'intlrate',
                sectionTitle: 'International',
                model: 'Taco.model.InternationalShippingRate',
                store: me.intlRateStore
            });

            me.intlRateEditor.on({
                dirtychange: {
                    fn: me.saveButtonCheck,
                    scope: me
                }
            });

            me.customRateContainer = Ext.create('Ext.container.Container', {
                visible: false,
                padding: '30 0 0 0',
                items: [
                me.domesticRateEditor, me.intlRateEditor]
            });

            me.customRateContainer.setVisible(false);

            me.uspsEditor = Ext.create('Taco.view.shipping.UspsConfigurationEditor', {
                trackResetOnLoad: false
            });
            me.uspsEditor.setVisible(false);

            Taco.model.UspsConfiguration.load(0, {
                scope: me,
                success: function (record, op) {

                    if (record) {
                        this.uspsEditor.getForm().loadRecord(record);
                    } else {
                        this.uspsEditor.getForm().loadRecord(Ext.create('Taco.model.UspsConfiguration', {
                            shippingMethods: new Array()
                        }));
                    }
                },
                failure: function (record, op) {
                    console.log("Some bad stuff happened");
                }
            });

            me.radioGroup = Ext.create('Ext.form.FieldContainer', {
                defaultType: 'radiofield',
                fieldLabel: 'Shipping rate',
                labelAlign: 'top',
                width: 400,
                height: 80,
                layout: 'hbox',
                items: [{
                    boxLabel: 'Custom rates',
                    padding: '0 10 0 0',
                    name: 'rb',
                    inputValue: 'custom',
                    //checked: true,
                    id: 'custom'
                }, {
                    boxLabel: 'USPS Live rates',
                    padding: '0 10 0 0',
                    name: 'rb',
                    inputValue: 'live',
                    //checked: true,
                    id: 'live'
                }]
            });

            me.radioGroup.setVisible(false);

            me.radioGroup.down('radiofield').on({
                change: me.onMethodChange,
                scope: me
            });

            me.tabs = [{
                title: 'Basic',
                trackResetOnLoad: false,
                items: [Ext.create('Taco.core.ux.form.Module', {
                    disabled: false,
                    model: 'Taco.model.ShippingRate',
                    allowCollapse: false,

                    form: {
                        layout: {
                            type: 'vbox',
                            border: true
                        },
                        defaults: {
                            labelAlign: 'top',
                            labelSeparator: ''
                        },
                        items: [{
                            xtype: 'originfield'
                        },
                        me.countrySelector, me.radioGroup, me.customRateContainer, me.uspsEditor]
                    }
                })]
            }];

            me.callParent(arguments);

            me.originField = me.down('originfield');
            me.originField.setVisible(false);

            me.on({
                afterrender: me.onAfterRender,
                scope: me
            });

            me.tabForm.getForm().on({
                dirtychange: {
                    fn: me.saveButtonCheck,
                    scope: me
                }
            });

            me.dirtyButton = this.down('dirtybutton');
        },

        countryChange: function () {
            var me = this;
            if (me.countrySelector.getValue().length == 1) {
                me.uspsEditor.toggleInternationalRates(false);
                Ext.each(me.intlRateStore.data.items, function (item, index, list) {
                    me.intlRateStore.remove(item);
                });

                me.intlRateEditor.setVisible(false);
            } else {
                me.uspsEditor.toggleInternationalRates(true);
                me.intlRateEditor.setVisible(true);
            }
        },

        onMethodChange: function (field, isCustom, isLive, opts) {
            var me = this;
            if (!isCustom) {
                me.uspsEditor.setVisible(true);
                me.customRateContainer.setVisible(false);
            } else {
                me.uspsEditor.setVisible(false);
                me.customRateContainer.setVisible(true);
            }
        },

        saveButtonCheck: function () {
            var me = this;
            var form = me.tabForm.getForm();
            me.dirtyButton.setDirty(form.isValid() && form.isDirty());
        },

        onLoad: function (record) {
            var me = this;

            Taco.model.ActiveRateProvider.load(0, {
                success: function (record, op) {
                    var val = (record.get("id") == 1) ? "custom" : "live";
                    var radio = me.radioGroup.down("radiofield");

                    me.radioGroup.down("#live").originalValue = (val == "live");
                    me.radioGroup.down("#live").setValue((val == "live"));

                    me.radioGroup.down("#custom").originalValue = (val == "custom");
                    me.radioGroup.down("#custom").setValue((val == "custom"));

                    //radio.originalValue = (val == "custom");
                    //radio.setValue(val);
                    me.radioGroup.setVisible(true);
                    me.countrySelector.setVisible(true);

                    if (val == "live") {
                        me.uspsEditor.setVisible(true);
                        me.customRateContainer.setVisible(false);
                    } else {
                        me.uspsEditor.setVisible(false);
                        me.customRateContainer.setVisible(true);
                    }

                    me.setLoading(false);
                },
                failure: function (record, op) {
                    console.log("Failed to retrieve active rate provider");
                }
            });

            me.originField = me.down('originfield');

            Taco.model.SiteShippingOriginAddress.load(1, {
                success: function (origin) {
                    me.originField.setValue(origin);
                    me.originField.setVisible(true);
                },
                failure: function () {
                    me.originField.setValue(null);
                    me.originField.setVisible(true);
                }
            });

            var countries = new Array();
            Ext.create('Taco.store.SiteShippingRegions').load(function (records, operation, success) {

                Ext.Array.each(records, function (record, index, list) {
                    countries.push(record.get('isoCountryCode'));
                });

                if (countries.length == 0) {
                    countries.push("US");
                }

                var c = new Array();
                for (var x in countries) {
                    c.push(countries[x]);
                }

                me.countrySelector.originalValue = c;
                me.countrySelector.setValue(countries);
            });
        },

        onAfterRender: function () {
            var me = this;
            me.setLoading(true);
        },

        onBeforeSave: function () {
            var me = this;

            me.setLoading(true);

            var usps = me.uspsEditor.getForm().getRecord();
            usps.set(me.uspsEditor.getForm().getValues());

            var origin = me.originField.getValue();
            var regionStore = Ext.create('Taco.store.SiteShippingRegions');

            Ext.each(me.countrySelector.getValue(), function (region, index, regionList) {
                var r = Ext.create('Taco.model.SiteShippingRegion');
                r.set('isoCountryCode', region);
                regionStore.add(r);
            });

            me.domesticRateEditor.commit(false);
            me.intlRateEditor.commit(true);
            //debugger;

            // Oh dear god...

            origin.save({
                failure: function () {
                    console.log("Failed to save shipping origin.");
                }
            });

            regionStore.sync({
                failure: function () {
                    console.log("Failed to save regions.");
                }
            });

            usps.save({
                success: function (record, op) {
                    console.log('USPS saved');
                    me.syncShippingMethods();
                },
                failure: function () {
                    console.log("Failed to save USPS Live rates.");
                }
            });

            me.domesticRateEditor.store.sync({
                success: function (record, op) {
                    console.log('Domestic custom rates saved');
                },
                failure: function () {
                    console.log("Failed to save domestic rates.");
                }
            });

            me.intlRateEditor.store.sync({
                success: function (record, op) {
                    console.log('Intl custom rates saved');
                },
                failure: function () {
                    console.log("Failed to save international rates.");
                }
            });
        },

        syncShippingMethods: function () {
            var me = this;

            var type = me.radioGroup.down('radiofield').getId();
            var selected = me.radioGroup.down('radiofield').getValue();

            if (type == "custom" && !selected) {
                type = "live";
            }
            
            Ext.Ajax.request({
                url: '/admin/app/shipping/methodsync',
                method: "GET",
                params: {
                    id: type
                },
                success: function (response) {
                    console.log("Successfuly synced shipping methods. Current active type is: " + type);
                }
            });

            var id = (type == "custom") ? 1 : 2;

            Ext.Ajax.request({
                url: '/admin/app/shipping/activerateprovider/set',
                method: "GET",
                params: {
                    id: id
                },
                success: function (response) {
                    me.setLoading(false);
                    me.dirtyButton.setDirty(false);
                    Taco.app.signalCacheFlush({ model: 'Taco.model.ThemeSettings' });
                    console.log("Successfuly switched active rate providers. Current active rate provider is: " + type + ". ID: " + id);
                },
                failure: function () {
                    me.setLoading(false);
                    me.dirtyButton.setDirty(false);
                    console.log("Failed to switch active rate providers.");
                }
            });
        },

        initSaveTasks: function (chain) {
            // Do none of this stuff
        }
    });

/**
 * @class Taco.view.settings.shipping.subform.MethodsAndRates
 *
 */

Ext.define('Taco.view.settings.shipping.subform.ShippingProvider', {
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    title: 'base Provider',
    layout: {
        type: 'card',
        manageOverflow: 2,
        reserveScrollbar: true
    },
    providerId: 'fedex',
    configureCopy: 'lorum jip',
    ratesCopy: 'blu blue blee',
    customFileds : [],
    padding: '10 10 10 10',
    initComponent: function () {
        var me = this;
        //p.getLayout().setActiveItem(1);


        this.allRates = Taco.core.data.StoreManager.getOrCreate({
            id: 'carrierRates' + me.providerId,
            model: 'Taco.model.KeyValuePair',
            autoLoad: true,
            proxy: {
                type: 'ajax',
                extraParams: {
                    id: me.providerId
                },
                api: {
                    read: '/admin/app/shipping/carrierRates'
                },
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success',
                    messageProperty: "message"
                }
            }
        });


        this.configFields = Ext.widget({
            
            xtype: 'formform',
            autoScroll: true,
         
            width: 400,
            layout: {
                type: 'vbox',
                align:'stretch'
            },
            items:me.customFileds
            
        });
        this.configFields.getForm().setValues(this.record.get("settings") || {});

        this.configContainer = Ext.widget({
            xtype: 'container',
            autoScroll: true,
            layout: {
                type: 'hbox'
            },
            items: [
                this.configFields,
                {
                    xtype: 'container',
                    padding: '40 40 40 40',
                    items: [
                        {
                            height: 340,
                            width: 240,
                            html:  me.configureCopy
                           
                        },
                        {
                            xtype: 'action',
                            text: 'Configure Rates',
                            click: function () {
                                me.getLayout().setActiveItem(1);
                            }
                        }
                    ]
                }
            ]
        });


        this.ratesSelect = Ext.widget({
            xtype: 'boxselect',
            name: 'rates',
            value: this.record.get('rates'),
            store: this.allRates,
            queryMode: 'local',
            width: 400,
            triggerOnClick: true,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: true,
            displayField: 'Value',
            fieldLabel: 'Select Shipping Methods',
            valueField: 'Key'
        });

        this.ratesContainer = Ext.widget({
            xtype: 'container',
            autoScroll: true,

            layout: {
                type: 'hbox'
            },
            items: [
                this.ratesSelect,
                {
                    xtype: 'container',
                    padding: '40 40 40 40',
                    items: [
                        {
                            height: 340,
                            width: 240,
                            html:me.ratesCopy
                            
                        },
                        {
                            xtype: 'action',
                            text: 'Configure Credentials',
                            click: function () {
                                me.getLayout().setActiveItem(0);
                            }
                        }
                    ]
                }
            ]
        });

        this.items = [
            this.configContainer,
            this.ratesContainer
        ];

        this.callParent(arguments);
        if (this.record.get('isConfigured')) {
            me.getLayout().setActiveItem(1);
        }
    },
    beforeSave: function () {
        if (this.configFields.isDirty() || this.ratesSelect.isDirty()) {
            var settings = this.configFields.getForm().getValues(false, false, false, true),
                rates = this.ratesSelect.getValue();
            this.record.set('settings', settings);
            this.record.set('rates', rates);
        }
    }
});
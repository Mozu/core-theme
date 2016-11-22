/**
 * @class Taco.view.settings.shipping.subform.MethodsAndRates
 *
 */

Ext.define('Taco.view.settings.shipping.subform.ShippingProvider', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.store.Countries',
        'Taco.core.ux.content.Tooltip'
    ],
    title: 'base Provider',
    layout: {
        type: 'card',
        manageOverflow: 2,
        reserveScrollbar: true
    },
    providerId: 'fedex',
    configureCopy: 'lorum jip',
    ratesCopy: 'blu blue blee',
    customFileds: [],
    padding: '10 10 10 10',
    initComponent: function () {
        var me = this;

        this.configFields = Ext.widget({
            xtype: 'formform',
            autoScroll: true,

            width: 400,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: me.customFileds
        });

        var key = 'shippingForReturns' + this.record.get('id');
        var isEnabled = this.record.get('enabledForReturns');


        this.on('beforeShow', function() {
            this.tooltip = Ext.create('Taco.core.ux.content.Tooltip', {
                elementId: key,
                hoverTarget: 'boxLabelEl',
                messageKey: 'shipping.enableForReturns',
                offsetLeft: -5,
                offsetTop: 90,
                delay: 100
            })
        })

        this.configFields.getForm().setValues(this.record.get("settings") || {});

        var enableForReturns = this.record.get('id') === 'fedex' 
            || this.record.get('id') === 'usps';

        var optionItems = [].concat(
            this.configFields, 
            [
                {
                    xtype: 'checkbox',  
                    name: 'enabled', 
                    boxLabel: 'Enable for Checkout'
                }
            ]
        );

        if (enableForReturns) {
            optionItems.push({
                xtype: 'checkbox',  
                name: 'enabledForReturns', 
                boxLabel: 'Enable for Returns',
                itemId: key,
                listeners: {
                    change: function(cmp) {
                        var checked = cmp.checked;
                        var form = me.down('#returnForm');
                        if (form) {
                            form[checked ? 'show' : 'hide']();
                        }
                    }
                }
            });
        }

        if (this.record.get('id') === 'usps') {
            this.returnItems = Ext.widget({
                xtype: 'formform',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                hidden: !isEnabled,
                width: 800,
                itemId: 'returnForm',
                items: [
                    {
                        xtype: 'panel',
                        title: 'Permit Information',
                        width: 400,
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        padding: '0 30 0 0',
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'permitnumber',
                                fieldLabel: 'Permit Number'
                            },
                            {
                                type: 'container',
                                width: 400,
                                layout: {
                                    type: 'hbox',
                                    align: 'stretch'
                                },
                                items: [
                                    {
                                        xtype: 'textfield',
                                        name: 'permitissuingcity',
                                        fieldLabel: 'Permit issuing PO City',
                                        padding: '0 80 0 0' 
                                    },
                                    {
                                        xtype: 'combobox',
                                        name: 'permitissuingstate',
                                        fieldLabel: 'Permit issuing PO State',
                                        store: this.stateStore,
                                        valueField: 'code',
                                        displayField: 'name'
                                    },
                                ]
                            },
                            {
                                xtype: 'textfield',
                                name: 'permitissuingzip5',
                                fieldLabel: 'Permit issuing PO Zip',
                            }
                        ]
                    },
                    {
                        xtype: 'panel',
                        title: 'Postage Due Unit (PDU) Information',
                        width: 400,
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'pduPOBox',
                                fieldLabel: 'PDU PO Box'
                            },
                            {
                                type: 'container',
                                width: 400,
                                layout: {
                                    type: 'hbox',
                                    align: 'stretch'
                                },
                                items: [
                                    {
                                        xtype: 'textfield',
                                        name: 'pduCity',
                                        fieldLabel: 'PDU City',
                                        padding: '0 120 0 0'   
                                    },
                                    {
                                        xtype: 'combobox',
                                        name: 'pduState',
                                        fieldLabel: 'PDU State',
                                        store: this.stateStore,
                                        valueField: 'code',
                                        displayField: 'name'
                                    }
                                ]
                            },
                            {
                                type: 'container',
                                width: 400,
                                layout: {
                                    type: 'hbox',
                                    align: 'stretch'
                                },
                                items: [
                                    {
                                        xtype: 'textfield',
                                        name: 'pduzip4',
                                        fieldLabel: 'PDU Zip',
                                        padding: '0 10 0 0'   
                                    }
                                ]
                            }
                        ]
                    }
                ]
            })
                    // {
                    //     xtype: 'container',
                    //     width: '50%',
                    //     items: [
                    //         {
                    //             xtype: 'textfield',
                    //             name: 'pduPOBox',
                    //             fieldLabel: 'PDU PO Box'
                    //         },
                    //         {
                    //             xtype: 'textfield',
                    //             name: 'pduCity',
                    //             fieldLabel: 'PDU City'  
                    //         },
                    //         {
                    //             xtype: 'textfield',
                    //             name: 'pduState',
                    //             fieldLabel: 'PDU State'
                    //         },
                    //         {
                    //             xtype: 'textfield',
                    //             name: 'pduZip',
                    //             fieldLabel: 'PDU Zip',
                    //         }
                    //     ]
                    // }
                // ]
            // });

            this.returnItems.getForm().setValues(this.record.get("settings") || {});
        }


        this.configContainer = Ext.widget({
            xtype: 'formform',
            autoScroll: true,
            layout: {
                type: 'vbox'
            },
            items: [
                {
                    xtype:'container',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'container',
                            items: optionItems
                        },
                        {
                            xtype: 'container',
                            items: [        
                                {
                                    height: 350,
                                    width: 240,
                                    html: me.configureCopy
                                }
                            ]
                        }
                    ]
                },
                this.returnItems
            ]
        });

        this.items = [
            this.configContainer
        ];

        this.callParent(arguments);

    },

    beforeSave: function () {
        if (this.configFields.isDirty() || this.configContainer.isDirty()) {
            var settings = this.configFields.getForm().getValues(false, false, false, true);
            
            if (this.returnItems) {
                var returnSettings = this.returnItems.getForm().getValues(false, false, false, true);
                settings = Ext.apply(settings, returnSettings);
            }

            this.record.set('settings', settings);

        }
    }

});
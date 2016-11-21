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
        //p.getLayout().setActiveItem(1);


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

        this.on('beforeShow', function() {
            this.tooltip = Ext.create('Taco.core.ux.content.Tooltip', {
                elementId: "shippingForReturns",
                hoverTarget: 'boxLabelEl',
                messageKey: 'shipping.enableForReturns',
                offsetLeft: -5,
                offsetTop: 90,
                delay: 100
            })
        })

        this.configFields.getForm().setValues(this.record.get("settings") || {});

        var isFedex = this.record.get('id') === 'fedex';

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

        if (isFedex) {
            optionItems.push({
                xtype: 'checkbox',  
                name: 'enabledForReturns', 
                boxLabel: 'Enable for Returns',
                itemId: 'shippingForReturns'
            });
        }

        this.configContainer = Ext.widget({
            xtype: 'formform',
            autoScroll: true,
            layout: {
                type: 'hbox'
            },
            items: [
                {
                    xtype:'container',
                    items: optionItems
                },
                {
                    xtype: 'container',
                    padding: '40 40 40 40',
                    items: [        
                        {
                            height: 400,
                            width: 240,
                            html: me.configureCopy
                        }
                    ]
                }
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
            this.record.set('settings', settings);

        }
    }

});
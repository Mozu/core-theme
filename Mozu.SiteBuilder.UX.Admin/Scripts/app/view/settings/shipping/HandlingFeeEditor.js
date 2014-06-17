/**
 * 
 */
Ext.define('Taco.view.settings.shipping.HandlingFeeEditor', {
    extend: 'Taco.core.ux.form.FullEditor',
    alias: 'widget.handlingfeeeditor',
    requires: [
        'Ext.ux.form.field.BoxSelect'
    ],
    formCls: 'Taco.core.ux.form.Form',
    //editorName: 'Taco.view.discount.Edit',
   // title: 'Shipping Methods',


    contextConfig: {
   //     supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },
    initComponent: function () {
        this.formCfg = {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },

            title: this.record.get('appliesTo') == 'product' ? 'Product Handling Fee Configuration' : 'Order Handling Fee Configuration',
            items: [
                {
                    xtype: 'boxselect',
                    name: 'shippingTargetRuleCodes',
                    valueField: 'code',
                    displayField: 'code',
                    fieldLabel: 'Shipping Zones',
                    store: Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingZones')
                },
                {
                    xtype: 'boxselect',
                    name: 'productTargetRuleCodes',
                    valueField: 'code',
                    displayField: 'code',
                    fieldLabel: 'Product Rules',
                    store: Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductRules')
                }, {
                    xtype: 'boxselect',
                    name: 'serviceTypes',
                    valueField: 'code',
                    displayField: 'name',
                    fieldLabel: 'Shipping Methods',
                    store: Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingMethods')

                },

               
                {
                    xtype: 'container',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'combo',
                            name: 'valueType',
                            fieldLabel: 'Fee Type',
                            allowBlank: false,
                            editable: false,
                            value: 'flatrate',
                            store: [
                                ['percentage', 'percentage'],
                                ['flatrate', 'flatrate']
                            ]

                        },
                        {
                            fieldLabel: 'Fee',
                            xtype: 'textfield',
                            hideTrigger: true,
                            name: 'value'
                        }
                    ]
                },
                {
                    fieldLabel: 'Priority',
                    hidden: this.record.phantom,
                    xtype: 'numberfield',
                    hideTrigger: true,
                    name: 'sequence',
                    value: 999
                }
            ]
        };
        this.callParent(arguments);
    },
    getIndexRoute: function () {
        return 'shipping';

    },

    getEditRoute: function () {
        if (this.record.get('appliesTo') == 'product') {
            return 'shipping/productHandlingFeeEdit';
        }
        return 'shipping/orderHandlingFeeEdit';
    },
});
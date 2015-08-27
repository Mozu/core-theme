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
        var appliesTo = this.record.get('appliesTo'),
            feeTypeStore = (appliesTo === 'product') ? [['flatrate', 'Flat Rate']] : [['flatrate', 'Flat Rate'], ['percentage', 'Order Percentage'], ['percentage_appliesToShippingRate', 'Shipping Percentage']];

        this.formCfg = {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },

            title: appliesTo == 'product' ? 'Product Handling Fee Configuration' : 'Order Handling Fee Configuration',
            items: [
                {
                    fieldLabel: 'Priority',
                    hidden: this.record.phantom,
                    xtype: 'numberfield',
                    hideTrigger: true,
                    name: 'sequence',
                    value: 999
                },
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
                            minWidth: 200,
                            value: 'flatrate',
                            readOnly: (appliesTo == 'product'),
                            store: feeTypeStore
                        },
                        {
                            fieldLabel: 'Fee',
                            xtype: 'textfield',
                            hideTrigger: true,
                            name: 'value',
                            minWidth: 200
                        }
                    ]
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
/**
 * 
 */
Ext.define('Taco.view.settings.shipping.ShippingMethodEditor', {
    extend: 'Taco.core.ux.form.FullEditor',
    alias: 'widget.shippingmethodeditor',
    requires: [
        'Ext.ux.form.field.BoxSelect'
      
    ],
    formCls: 'Taco.core.ux.form.Form',
    //editorName: 'Taco.view.discount.Edit',
    title: 'Shipping Methods',


    contextConfig: {
      //  supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },
    initComponent: function () {
        this.formCfg = {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            title: 'Shipping Methods',
            items: [
                {
                    fieldLabel: 'Priority',
                    xtype: 'numberfield',
                    hidden: this.record.phantom,
                    hideTrigger:true,
                    name: 'sequence',
                    value:999
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

                }
            ]
        };
        this.callParent(arguments);
    },
    getIndexRoute: function () {
        return 'shipping';

    },

    getEditRoute: function () {
        return 'shipping/shippingMethodEdit';
    },

});
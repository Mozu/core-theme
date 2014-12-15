/**
 * 
 */
Ext.define('Taco.view.settings.shipping.Form', {
    extend: 'Taco.core.ux.form.NavForm2',
    requires: [
        'Taco.view.settings.shipping.subform.ShippingFrom',
        'Taco.view.settings.shipping.subform.MethodsAndRates',
        'Taco.view.settings.shipping.subform.EligibleShippingAddressLocations'
    ],
    title: 'Shipping Settings',

    initComponent: function () {
        var me = this;
        
        me.shippingFrom = Ext.create('Taco.view.settings.shipping.subform.ShippingFrom', {
            record: me.record
        });
        
        me.methodsAndRates = Ext.create('Taco.view.settings.shipping.subform.MethodsAndRates', {
            record: me.record
        });

        me.eligibleShippingAddressLocations = Ext.create('Taco.view.settings.shipping.subform.EligibleShippingAddressLocations', {
            record: me.record
        });

        me.navStore = Ext.create('Ext.data.Store', {
            fields: ['title'],
            data: [me.shippingFrom, me.methodsAndRates, me.eligibleShippingAddressLocations]
        });

        me.mon(me.record,'afteredit', Ext.emptyFn, me); // used to check savable state here
        
        me.items = [
            me.shippingFrom,
            me.methodsAndRates,
            me.eligibleShippingAddressLocations
        ];

        this.callParent(arguments);
        this.loadNavItems();
    },
    isDirty: function () {

        var ret = this.callParent(arguments);
        return ret || this.record.dirty;
        
    }
});

















/**
 * The discount editor view
 */
Ext.define('Taco.view.settings.shipping.Form', {
    extend: 'Taco.core.ux.form.NavForm',
    requires: ['Taco.view.settings.shipping.subform.ShippingFrom',
               'Taco.view.settings.shipping.subform.MethodsAndRates',
               'Taco.view.settings.shipping.subform.ShippingPreferences' ],
    initComponent: function () {
        var me = this;

        me.shippingFrom = Ext.create('Taco.view.settings.shipping.subform.ShippingFrom', {
            record: me.record
        });
        me.methodsAndRates = Ext.create('Taco.view.settings.shipping.subform.MethodsAndRates', {
            record: me.record
        });
        me.shippingPreferences = Ext.create('Taco.view.settings.shipping.subform.ShippingPreferences', {
            record: me.record
        });

        me.navStore = Ext.create('Ext.data.Store', {
            fields: ['title'],
            data: [me.shippingFrom, me.methodsAndRates, me.shippingPreferences]
        });



        me.items = [me.shippingFrom,
                      me.methodsAndRates,
                      me.shippingPreferences];
        this.callParent(arguments);
    }
});
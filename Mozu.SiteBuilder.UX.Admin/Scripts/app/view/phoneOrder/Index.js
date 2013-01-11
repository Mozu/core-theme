/**
 * @class Taco.view.phoneOrder.Index
 * @author Michael Speed Elder
 */
Ext.define('Taco.view.phoneOrder.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.core.ux.form.Form', 'Taco.view.phoneOrder.CustomerSection', 'Taco.view.phoneOrder.ItemsSection', 'Taco.view.phoneOrder.ShippingSection', 'Taco.view.phoneOrder.BillingSection'],

    header: {
        title: 'Phone Orders'
    },

    initComponent: function () {
        var me = this,
            customerSection, itemsSection, shippingSection, billingSection;

        customerSection = Ext.create('Taco.view.phoneOrder.CustomerSection');
        itemsSection = Ext.create('Taco.view.phoneOrder.ItemsSection');
        shippingSection = Ext.create('Taco.view.phoneOrder.ShippingSection');
        billingSection = Ext.create('Taco.view.phoneOrder.BillingSection');

        this.form = Ext.create('Taco.core.ux.form.Form', {
            manageHeight: false,
            width: 860,
            defaults: {
                xtype: 'formeditor2',
                frameHeader: false,
                manageHeight: false,
                margin: '0 0 14 0',
                bodyPadding: '14 0 14 14'
            },
            items: [customerSection, itemsSection, shippingSection, billingSection]
        });

        this.formLinks = Ext.create('Ext.Component', {
            width: 180,
            margin: '0 20 0 0',
            cls: Taco.baseCSSPrefix + 'formeditor-links',
            html: '<ul style="position: fixed;"><li>Customer</li><li>Cart</li><li>Shipping</li><li>Billing</li></ul>'
        });

        Ext.apply(me.body, {
            layout: { type: 'hbox', align: 'stretchmax' },
            items: [me.formLinks, me.form]
        });

        this.callParent(arguments);
    }
});
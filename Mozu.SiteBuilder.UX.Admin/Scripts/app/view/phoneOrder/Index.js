/**
 * @class Taco.view.phoneOrder.Index
 * @author Michael Speed Elder
 */
Ext.define('Taco.view.phoneOrder.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.core.ux.form.Form', 'Taco.view.phoneOrder.CustomerSection', 'Taco.view.phoneOrder.ItemsSection', 'Taco.view.phoneOrder.ShippingSection', 'Taco.view.phoneOrder.BillingSection'],

    componentCls: Taco.baseCSSPrefix + "phone-order-form-container",

    header: {
        title: 'Phone Orders'
    },

    initComponent: function () {
        var me = this,
            customerSection = Ext.create('Taco.view.phoneOrder.CustomerSection'),
            itemsSection    = Ext.create('Taco.view.phoneOrder.ItemsSection'),
            shippingSection = Ext.create('Taco.view.phoneOrder.ShippingSection'),
            billingSection  = Ext.create('Taco.view.phoneOrder.BillingSection');

        this.form = Ext.create('Taco.core.ux.form.Form', {
            manageHeight: false,
            width: 860,
            defaults: {
                xtype: 'formeditor2',
                frameHeader: false,
                manageHeight: false,
                bodyCls: Taco.baseCSSPrefix  + "section-body"
            },
            items: [customerSection, itemsSection, shippingSection, billingSection]
        });

        this.formLinks = Ext.create('Ext.Component', {
            width: 180,
            cls: Taco.baseCSSPrefix + 'formeditor-links',
            html: '<ul><li>Customer</li><li>Cart</li><li>Shipping</li><li>Billing</li></ul>'
        });

        Ext.apply(me.body, {
            layout: { type: 'hbox', align: 'stretchmax' },
            items: [me.formLinks, me.form]
        });

        this.callParent(arguments);
    }
});
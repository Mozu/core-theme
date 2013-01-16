
/**
 * @class Taco.view.phoneOrder.Form
 * @author Michael Speed Elder
 */
Ext.define('Taco.view.phoneOrder.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.core.ux.form.Form',
       'Taco.view.phoneOrder.CustomerSection',
       'Taco.view.phoneOrder.ItemsSection',
       'Taco.view.phoneOrder.ShippingSection',
       'Taco.view.phoneOrder.BillingSection'
    ],

    title: 'Create Phone Order',
    width: 860,
    manageHeight: false,
    defaults: {
        xtype: 'formeditor2',
        frameHeader: false,
        manageHeight: false,
        width: 860,
        margin: '0 0 14 0',
        bodyPadding: '14 0 14 14'
    },

    createTitle: 'Create Phone Order',
    editTitle: 'Create Phone Order',

    initComponent: function () {
        var me = this,
            customerSection, itemsSection, shippingSection, billingSection;

        customerSection = Ext.create('Taco.view.phoneOrder.CustomerSection');
        itemsSection = Ext.create('Taco.view.phoneOrder.ItemsSection', {
            store: this.record.items()
        });
        shippingSection = Ext.create('Taco.view.phoneOrder.ShippingSection');
        billingSection = Ext.create('Taco.view.phoneOrder.BillingSection');

        this.items = [customerSection, itemsSection, shippingSection, billingSection];

        //this.formLinks = Ext.create('Ext.Component', {
        //    width: 180,
        //    margin: '0 20 0 0',
        //    cls: Taco.baseCSSPrefix + 'formeditor-links',
        //    html: '<ul style="position: fixed;"><li>Customer</li><li>Cart</li><li>Shipping</li><li>Billing</li></ul>'
        //});

        //Ext.apply(me.body, {
        //    layout: { type: 'hbox', align: 'stretchmax' },
        //    tabs: [me.formLinks, me.form]
        //});

        this.callParent(arguments);
    }
});
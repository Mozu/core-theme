

/**
 * @class Taco.view.order.Form
 */

Ext.define('Taco.view.order.Form', {
    extend: 'Taco.core.ux.form.NavForm2',

    topOffset: 38,

    requires: [
        'Taco.model.Order',
        'Taco.model.OrderPayment',
        'Taco.view.order.Header',
        'Taco.view.order.subform.Customer',
        'Taco.view.order.subform.Detail',
        'Taco.view.order.subform.Payment',
        'Taco.view.order.subform.Shipping'
    ],

    model: 'Taco.model.Order',

    initComponent: function () {        

        this.title = 'Order No. ' + this.record.get('orderNumber');

        this.callParent(arguments);

        this.buildForm();

    },

    buildForm: function () {
        var subformCfg = {
                record: this.record
            },
            items;

        items = [
            Ext.create('Taco.view.order.Header', subformCfg),
            Ext.create('Taco.view.order.subform.Detail', subformCfg),
            Ext.create('Taco.view.order.subform.Customer', subformCfg),
            Ext.create('Taco.view.order.subform.Payment', subformCfg),
            Ext.create('Taco.view.order.subform.Shipping', subformCfg)
        ];

        this.loadNavItems(items);
    }
})
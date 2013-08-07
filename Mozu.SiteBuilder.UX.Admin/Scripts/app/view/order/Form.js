

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

    editTitle: [
        'Order No. {number}',
        '<span class="taco-order-status {status}">',
            '{status}',
        '</span>'
    ],

    createTitle: [
        'Create Order No. {number}',
        '<span class="taco-order-status">',
            '{status}',
        '</span>'
    ],

    initComponent: function () {        

        this.titleData = {
            number: this.record.get('orderNumber'),
            status: this.record.get('orderStatus')
        };

        this.callParent(arguments);

        this.buildForm();

    },

    buildForm: function () {
        var subformCfg = {
                record: this.record
            },
            items;

        items = [
            Ext.create('Taco.view.order.Header', subformCfg)
        ];

        if (!this.isEdit()) {
            items.push(Ext.create('Taco.view.order.subform.Customer', subformCfg));
        }

        items.push(Ext.create('Taco.view.order.subform.Detail', subformCfg));

        if (!this.isEdit()) {
            items.push(Ext.create('Taco.view.order.subform.ShippingSimple', subformCfg));
        }

        items.push(Ext.create('Taco.view.order.subform.Payment', subformCfg));

        if (this.isEdit()) {
            items.push(Ext.create('Taco.view.order.subform.Shipping', subformCfg));
        }

        this.loadNavItems(items);
    },

    isEdit: function () {
        if (this._isEdit === undefined) {
            this._isEdit = this.record.get('orderStatus') !== 'Created';
        }
        return this._isEdit;
    }
})
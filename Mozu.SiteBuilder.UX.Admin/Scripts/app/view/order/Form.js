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
        'Taco.view.order.subform.Shipping',
        'Taco.view.order.subform.Return'
    ],

    model: 'Taco.model.Order',

    config: {
        customer: null
    },

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

        window.r = this.record;

        this.customer = {};

        this.titleData = {
            number: this.record.get('orderNumber'),
            status: this.record.get('orderStatus')
        };

        this.callParent(arguments);

        this.buildForm();
    },

    buildForm: function () {
        var subformCfg = {
                record: this.record,
                orderForm: this
            },
            items = [];

        if (this.isEdit()) {
            items.push(Ext.create('Taco.view.order.Header', subformCfg));
        }

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
            items.push(Ext.create('Taco.view.order.subform.Return', subformCfg)); 
        }

        this.loadNavItems(items);

        this.shippingForm = this.down('taco-odershippingsimple');
        this.customerForm = this.down('taco-ordercustomer');
    },

    isEdit: function () {
        if (this._isEdit === undefined) {
            this._isEdit = this.record.get('orderStatus') !== 'Created';
        }
        return this._isEdit;
    },

    isValid: function () {
        // Only validate when in create mode
        if (this.isEdit()) return false;
        
        // Check basic form fields
        if (!this.callParent(arguments)) return false;

        // Is customer valid?
        if (!this.customerForm.isValid()) return false;

        return true;

        // Is Order Item valid?
        if (!this.orderDetail.isValid()) return false;

        // Is Payment valid?
        if (!this.paymentForm.isValid()) return false;

        // Is Shipping Valid?
        if (!this.shippingForm.isValid()) return false;

        return true;
    }
})
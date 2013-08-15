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

        this.customerStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.CustomerAccount',
            //autoLoad: false
            proxy: 'memory'
        });
        debugger;
        console.log('CUSTOMER STORE', this.customerStore);

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
            items.push(Ext.create('Taco.view.order.subform.Return', subformCfg));
           
        }

        this.loadNavItems(items);
    },

    overwriteCustomer: function (record) {
        debugger;
        this.customerStore.removeAll();
        
        if (record) {
            this.customerStore.add(record);
            this.customer = record;
        } else {
            this.customer = null;
        }

        this.fireEvent('customerchanged', this, this.customer);
    },

    isEdit: function () {
        if (this._isEdit === undefined) {
            this._isEdit = this.record.get('orderStatus') !== 'Created';
        }
        return this._isEdit;
    }
})
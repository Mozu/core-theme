/**
 * @class Taco.view.order.widget.DiscountPickerField
 */
Ext.define('Taco.view.order.widget.ReusePaymentPickerField', {
    extend: 'Ext.form.field.ComboBox',
    requires: [
    ],

    config: {

    },

    model: 'Taco.model.OrderPayment',
    valueField: 'id',
    multiSelect: false,
    hideTrigger: false,
    emptyText: "Select a credit card",
    displayField: 'paymentDisplayField',
    selectOnFocus: true,
    //height: 24,
    listConfig: {
        loadingText: 'Loading...',
        cls: "reuse-payments-picker-menu",
        emptyText: 'No matching payments found.',
        // Custom rendering template for each item
        // Card type (Visa) Card Mask (****) exp (month/year)
        getInnerTpl: function () {
            return '{cardType} {cardNumber} exp {expireMonth}/{expireYear}';
        },
    },
    //pageSize: 30,

    initComponent: function (eOpts) {
        var me = this;
        
        me.callParent(arguments);
    },


});
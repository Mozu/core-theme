/**
 * @class Taco.view.order.widget.ReusePaymentPickerField
 */
Ext.define('Taco.view.order.widget.ReusePaymentPickerField', {
    extend: 'Ext.form.field.ComboBox',
    requires: [
        'Taco.model.OrderPayment'
    ],

    model: 'Taco.model.OrderPayment',
    valueField: 'id',
    multiSelect: false,
    hideTrigger: false,
    selectOnFocus: true,
    emptyText: 'Select a Credit Card',

    displayTpl: Ext.create('Ext.XTemplate', '<tpl for=".">{cardType} {cardNumber} exp {expireMonth}/{expireYear} <tpl if="isDefault">(Primary)</tpl></tpl>'),

    // This is the template that holds the display template.

    listConfig: {
        loadingText: 'Loading...',
        emptyText: 'No matching payments found.',
        // Custom rendering template for each item
        // Card type (Visa) Card Mask (****) exp (month/year)
        getInnerTpl: function() {
            return '<tpl for="."><div class="taco-payment-item<tpl if="isExpired"> taco-payment-item--disabled</tpl>"><span style="width:90px">{cardType}</span><span style="width:140px">{cardNumber}</span><span style="width:90px">exp {expireMonth}/{expireYear}</span>' +
                '<tpl if="isDefault"><span style="width:50px"><span class="x-column-content-pill x-column-content-pill-true taco-combo-pill">Primary</span></span></tpl><tpl if="isExpired">' +
                '<span style="width:50px"><span class="x-column-content-pill x-column-content-pill-false taco-combo-pill">Expired</span></span></tpl></div></tpl>';
        }
    },


    initComponent: function(eOpts) {
        var me = this;

        me.mon(this, 'beforeselect', function(combo, record, index) {
            return !record.get('isExpired');
        });

        me.callParent(arguments);
    }
});
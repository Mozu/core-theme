/*
 * @class Taco.view.settings.paymentTypes.subform.PurchaseOrderPaymentTermsGrid
 */

Ext.define('Taco.view.settings.paymentTypes.subform.PurchaseOrderPaymentTermsGrid', {
    extend: 'Taco.view.attribute.AttributeValueGrid',
    alias: 'widget.payment-terms-grid',
    requires: [
        'Taco.model.PurchaseOrderPaymentTerms'
    ],
    itemId: 'taco-grid-payment-terms-grid',

    initComponent: function() {
        var me = this;

        me.callParent(arguments);
        me.mon(Taco.app, 'added-payment-term-value', function (val) {
            var index = this.getPlacementIndex(val.position);
            val.sequenceNumber = index;
            var model = Ext.create('Taco.model.PurchaseOrderPaymentTerms', val);
                
            this.addRow(model, index);
        }, me);
    },

    removeRow: function (rec) {
        var me = this;
        Ext.MessageBox.show({
            title: 'Confirm',
            // pushes the buttons to the right to be consistant with our dialog ux.
            rightJustifyButtons: true,
            // reverses the order of the buttons
            reverseOrder: true,
            msg: 'This may be assigned to a customer, are you sure you want to delete this payment term?',
            closable: false,
            buttons: Ext.Msg.YESNO,
            fn: function (val) {
                if (val === 'yes') {
                    me.store.remove(rec);
                    me.refresh();
                    me.updateParentValues();
                }
            }
        });
    }


});
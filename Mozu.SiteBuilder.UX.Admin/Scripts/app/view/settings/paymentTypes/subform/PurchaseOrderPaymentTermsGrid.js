/*
 * @class Taco.view.settings.paymentTypes.subform.NetTermsGrid
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
    }


});
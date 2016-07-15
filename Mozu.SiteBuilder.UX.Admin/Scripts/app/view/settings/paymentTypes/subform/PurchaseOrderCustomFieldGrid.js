/*
 * @class Taco.view.settings.paymentTypes.subform.PurchaseOrderCustomFieldGrid
 */

Ext.define('Taco.view.settings.paymentTypes.subform.PurchaseOrderCustomFieldGrid', {
    extend: 'Taco.view.attribute.AttributeValueGrid',
    alias: 'widget.custom-field-grid',
    requires: [
        'Taco.model.PurchaseOrderPaymentTerms'
    ],
    itemId: 'taco-grid-custom-field-grid',

    initComponent: function () {
        var me = this;

        me.callParent(arguments);
        me.mon(Taco.app, 'added-custom-field-value', function (val) {
            var index = this.getPlacementIndex(val.position);
            val.isEnabled = true;
            val.isRequired = false;
            val.sequenceNumber = index;
            val.code = val.id;
            var model = Ext.create('Taco.model.PurchaseOrderCustomField', val);

            this.addRow(model, index);
        }, me);
    }


});
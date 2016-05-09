/*
 * @class Taco.view.settings.paymentTypes.subform.NetTermsGrid
 */

Ext.define('Taco.view.settings.paymentTypes.subform.NetTermsGrid', {
    extend: 'Taco.view.attribute.AttributeValueGrid',
    alias: 'widget.net-terms-grid',
    requires: [
        'Taco.model.NetTerms'
    ],
    itemId: 'taco-grid-net-terms-grid',

    initComponent: function() {
        var me = this;

        me.callParent(arguments);
        me.mon(Taco.app, 'added-net-term-value', function(val) {
            var model = Ext.create('Taco.model.NetTerms', val),
                index = this.getPlacementIndex(val.position);
            this.addRow(model, index);
        }, me);
    }
});
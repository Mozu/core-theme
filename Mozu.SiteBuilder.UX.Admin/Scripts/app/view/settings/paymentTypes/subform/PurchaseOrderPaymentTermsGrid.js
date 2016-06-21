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

    getActionItems: function() {
        var me = this;
        var actions = me.callParent(arguments);
        for (var i = 0; i < actions.length; ++i) {
            if (actions[i].text) {
                if (actions[i].text.toLowerCase() === 'remove') {
                    actions[i].menuColumnHandler = function(item, eventData) {
                        var record = eventData.record;
                        Ext.MessageBox.show({
                            title: 'Confirm',
                            // pushes the buttons to the right to be consistant with our dialog ux.
                            rightJustifyButtons: true,
                            // reverses the order of the buttons
                            reverseOrder: true,
                            msg: 'This may be assigned to a customer, are you sure you want to delete this payment term?',
                            closable: false,
                            buttons: Ext.Msg.YESNO,
                            fn: function(val) {
                                if (val === 'yes') {
                                    me.removeRow(record);
                                }
                            }
                        });
                    }

                } else if (actions[i].text.toLowerCase() === 'remove all') {
                    actions[i].menuColumnHandler = function() {
                        Ext.MessageBox.show({
                            title: 'Confirm',
                            // pushes the buttons to the right to be consistant with our dialog ux.
                            rightJustifyButtons: true,
                            // reverses the order of the buttons
                            reverseOrder: true,
                            msg: 'Some of these may be assigned to a customer, are you sure you want to delete all payment terms?',
                            closable: false,
                            buttons: Ext.Msg.YESNO,
                            fn: function(val) {
                                if (val === 'yes') {
                                    me.store.removeAll();
                                }
                            }
                        });
                    }
                }
            }
        }
        return actions;
    }


});
/**
 * @class Taco.view.inventory.QuantityEdit
 */
Ext.define('Taco.view.inventory.QuantityEdit', {
    extend: 'Taco.core.ux.form.Form',

    initComponent: function () {

        this.radioSet = Ext.create('Ext.form.FieldContainer', {
            defaultType: 'radiofield',
            cls: 'taco-stock-add-set',
            items: [{
                inputValue: 'add',
                boxLabel: 'Add',
                checked: true,
                name: 'add-set',
                listeners: {
                    change: this.updateResult,
                    scope: this
                }
            }, {
                inputValue: 'set',
                boxLabel: 'Set',
                name: 'add-set',
                listeners: {
                    change: this.updateResult,
                    scope: this
                }
            }]
        });

        this.quantity = Ext.create('Ext.form.field.Text', {
            name: 'quantity',
            emptyText: 'Quantity...',
            width: 100,
            enableKeyEvents: true
        });

        this.result = Ext.create('Ext.Component', {
            cls: 'taco-stock-add-set',
            tpl: 'New Quantity: {quantity}',
            data: {
                quantity: this.record.get('stockOnHand') || 'unlimited'
            }
        });

        this.items = [this.radioSet, this.quantity, this.result];

        this.callParent(arguments);

        this.quantity.on({
            keyup: this.updateResult,
            scope: this
        });
    },

    updateResult: function () {
        var text = this.getNewValue();

        if (text === null) {
            text = 'unlimited'
        }

        this.result.update({quantity: text});
    },

    getNewValue: function () {
        var values = this.getForm().getFieldValues(),
            current = this.record.get('stockOnHand'),
            num = parseInt(values.quantity),
            isAdd = values['add-set'] === 'add';

        if (isNaN(num)) {
            return null;
        }

        if (isAdd) {
            num += current || 0;
        }

        return num;
    },

    update: function () {
        this.record.set('stockOnHand', this.getNewValue());
    }
})
/**
 * @class Taco.view.inventory.QuantityEdit
 */
Ext.define('Taco.view.inventory.QuantityEdit', {
    extend: 'Ext.menu.Menu',
    requires: ['Taco.core.ux.form.Form'],

    cls: Taco.baseCSSPrefix + 'quantity-edit-menu',
    height: 100,
    layout: 'auto',
    plain: true,
    shadow: false,
    width: 300,

    initComponent: function () {
        var record = this.record,
            saveAction;

        saveAction = Ext.create('Ext.button.Button', {
            ui: 'action',
            scale: 'medium',
            text: 'Apply',
            scope: this,
            handler: this.updateQuantity
        });

        this.items = [{
            xtype: 'formform',
            itemId: 'form',
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: [{
                xtype: 'radiofield',
                name: 'addOrSet',
                inputValue: 'add',
                boxLabel: 'Add'
            }, {
                xtype: 'radiofield',
                name: 'addOrSet',
                inputValue: 'set',
                boxLabel: 'Set'
            }, {
                xtype: 'numberfield',
                name: 'quantity',
                emptyText: 'Quantity',
                width: 75,
                hideTrigger: true
            }, {
                xtype: 'component',
                itemId: 'preview',
                data: record.getData(),
                tpl: [
                    '<label>New Quantity: </label><span class="quantity">',
                        '{[Ext.Array.sum([values.stockOnHand, Ext.Number.from(values.stockOnHandAdjustment, 0)])]}',
                    '</span>'
                ]
            }]
        }, {
            xtype: 'container',
            cls: 'actions',
            items: [saveAction]
        }];

        this.callParent(arguments);
    },

    reconfigure: function (record) {
        var preview = this.down('#preview');

        this.record = record;
        preview.update(record.getData());

        return this;
    },

    updateQuantity: function () {
        var record = this.record,
            form = this.items.get('form').getForm(),
            formValues = form.getValues(),
            quantity = Ext.Number.from(formValues.quantity, 0),
            isAdd = formValues.addOrSet === 'add',
            stock = record.get('stockOnHand') || 0,
            //adjust = record.get('stockOnHandAdjustment') || 0,
            value;

        if (isAdd) {
            value = stock + quantity;
            record.set('stockOnHandAdjustment', {
                type: 'Delta',
                value: quantity
            });
        } else {
            value = quantity;
            record.set('stockOnHandAdjustment', {
                type: 'Absolute',
                value: quantity
            });

        }

        record.set('stockOnHand', value);

        form.reset();
        this.hide();
    }
});
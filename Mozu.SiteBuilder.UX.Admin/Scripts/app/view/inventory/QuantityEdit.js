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

        saveAction = Ext.create('Taco.core.ux.action.Action', {
            text: 'Apply'
        });

        this.items = [{
            xtype: 'formform',
            itemId: 'form',
            items: [{
                xtype: 'formflexbox',
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
            }]
        }, {
            xtype: 'container',
            cls: 'actions',
            items: [saveAction]
        }];

        this.callParent(arguments);

        saveAction.on('click', this.updateQuantity, this);
    },

    reconfigure: function (record) {
        var preview = this.down('#preview');

        this.record = record;
        console.log(record.getData());
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
            adjust = record.get('stockOnHandAdjustment') || 0,
            value;

        if (isAdd) {
            value = quantity + adjust;
        } else {
            value = quantity - stock;
        }
        record.set('stockOnHandAdjustment', value);

        form.reset();
        this.hide();
    }

    // initComponent: function () {

    //     this.radioSet = Ext.create('Ext.form.FieldContainer', {
    //         defaultType: 'radiofield',
    //         cls: 'taco-stock-add-set',
    //         items: [{
    //             inputValue: 'add',
    //             boxLabel: 'Add',
    //             checked: true,
    //             name: 'add-set',
    //             listeners: {
    //                 change: this.updateResult,
    //                 scope: this
    //             }
    //         }, {
    //             inputValue: 'set',
    //             boxLabel: 'Set',
    //             name: 'add-set',
    //             listeners: {
    //                 change: this.updateResult,
    //                 scope: this
    //             }
    //         }]
    //     });

    //     this.quantity = Ext.create('Ext.form.field.Text', {
    //         name: 'quantity',
    //         emptyText: 'Quantity...',
    //         width: 100,
    //         enableKeyEvents: true
    //     });

    //     this.result = Ext.create('Ext.Component', {
    //         cls: 'taco-stock-add-set',
    //         tpl: 'New Quantity: {quantity}',
    //         data: {
    //             quantity: this.record.get('stockOnHand') || 'unlimited'
    //         }
    //     });

    //     this.items = [this.radioSet, this.quantity, this.result];

    //     this.callParent(arguments);

    //     this.quantity.on({
    //         keyup: this.updateResult,
    //         scope: this
    //     });
    // },

    // updateResult: function () {
    //     var text = this.getNewValue();

    //     if (text === null) {
    //         text = 'unlimited'
    //     }

    //     this.result.update({quantity: text});
    // },

    // getNewValue: function () {
    //     var values = this.getForm().getFieldValues(),
    //         current = this.record.get('stockOnHand'),
    //         num = parseInt(values.quantity),
    //         isAdd = values['add-set'] === 'add';

    //     if (isNaN(num)) {
    //         return null;
    //     }

    //     if (isAdd) {
    //         num += current || 0;
    //     }

    //     return num;
    // },

    // update: function () {
    //     this.record.set('stockOnHand', this.getNewValue());
    // }
})
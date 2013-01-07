/**
 * @class Taco.view.shipping.CustomRateField
 */
Ext.define('Taco.view.shipping.CustomRateField', {
    alias: 'widget.customratefield',
    extend: 'Ext.container.Container',
    requires: ['Taco.core.ux.form.CurrencyField'],
    data: null,

    mixins: {
        field: 'Ext.form.field.Field'
    },

    border: false,
    layout: {
        type: 'hbox'
        //columns: 3,

    },

    initComponent: function () {
        var me = this,
            initialSelection, price, isFlatRate;

        me.nameField = Ext.create('Ext.form.field.Text', {
            labelAlign: 'top',
            width: 210,
            padding: '0 10 0 0',
            //colspan: 1,
            name: 'name',
            fieldLabel: 'Name this method',
            value: me.data.get('content').name,
            listeners: {
                dirtychange: me.notifyDirty,
                scope: me
            }
        });

        if (me.data.get('flatPerItemShippingRate').price && me.data.get('flatPerItemShippingRate').price.isAmountPercent) {
            initialSelection = 2;
        } else {
            initialSelection = 1;
        }

        me.rateCombo = Ext.create('Ext.form.field.ComboBox', {
            name: 'rateType',
            fieldLabel: 'Rate type',
            labelAlign: 'top',
            width: 170,
            //colspan: 1,
            padding: '0 10 0 0',
            queryMode: 'local',
            displayField: 'type',
            valueField: 'id',
            store: Ext.create('Ext.data.Store', {
                fields: ['id', 'type'],
                data: [{
                    id: 1,
                    type: 'Flat-rate per item'
                }, {
                    id: 2,
                    type: 'Percent per order'
                }]
            }),
            value: initialSelection
        });

        me.rateCombo.on({
            select: function (combo, records) {
                var isFlatRate = (combo.getValue() === 1);
                
                me.rateField.emptyText = isFlatRate ? '$' : '%';
                me.rateField.currencySign = isFlatRate ? '$' : '%';
                me.rateField.currencyAtEnd = !isFlatRate;
                me.rateField.setValue(0);
            }
        });

        price = me.data.get('flatPerItemShippingRate').price;
        isFlatRate = (me.rateCombo.getValue() === 1);

        me.rateField = Ext.create('Taco.core.ux.form.CurrencyField', {
            labelAlign: 'top',
            emptyText: isFlatRate ? '$' : '%',
            currencySign: isFlatRate ? '$' : '%',
            currencyAtEnd: !isFlatRate,
            width: 120,
            //colspan: 1,
            padding: '0 10 0 0',
            name: 'rate',
            fieldLabel: 'Rate',
            value: (price) ? price.amount : 0,
            listeners: {
                dirtychange: me.notifyDirty,
                scope: me
            }
        });

        me.deleteAction = Ext.create('Ext.Component', {
            padding: '55 0 0 0',
            html: '<a>X</a>',
            listeners: {
                click: {
                    element: 'el',
                    fn: me.onDeleteRate,
                    scope: me
                }
            }
        });

        me.items = [
            me.nameField,
            me.rateCombo,
            me.rateField,
            me.deleteAction
        ];

        me.callParent(arguments);
    },

    onDeleteRate: function () {
        var me = this;
        var store = me.data.store;
        store.remove(me.data);
        me.destroy();
    },

    notifyDirty: function (field, isDirty, opts) {
        var me = this;
        //console.log('CustomRateField is dirty: ' + isDirty);
        me.fireEvent("dirtychange", me);
    },

    isDirty: function () {
        var me = this;
        //console.log('CustomRateField dirty check: ', me.rateField.isDirty() || me.nameField.isDirty());
        return me.rateField.isDirty() || me.nameField.isDirty();
    },

    // Need the country list passed in here
    commit: function (isInternational) {
        var me = this;
        var nameValue = me.nameField.getValue();
        var boolFlag = (me.rateCombo.getValue() == 2);
        var rate = me.rateField.getValue();
        var content = me.data.get('content');

        if (!me.data.get('flatPerItemShippingRate').price) {
            me.data.get('flatPerItemShippingRate').price = {
                amount: 0,
                isAmountPercent: false,
                isoCurrencyCode: 'usd'
            };
        }

        if (content.name != nameValue) {
            content.name = nameValue;
            me.data.set('content', content);
            me.data.setDirty();
        }

        var rateType = me.data.get('flatPerItemShippingRate');

        if (rateType.price.isAmountPercent != boolFlag) {
            rateType.price.isAmountPercent = boolFlag;
            me.data.set('flatPerItemShippingRate', rateType);
            me.data.setDirty();
        }

        if (rateType.price.amount != rate) {
            rateType.price.amount = rate;
            me.data.set('flatPerItemShippingRate', rateType);
            me.data.setDirty();
        }

        if (isInternational) {
            me.data.set('isInternational', true);
            me.data.setDirty();
        }

        if (me.data.dirty) {
            console.log(me.data);
        }
    }
});
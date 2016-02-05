///**
// * @class  Taco.view.priceList.widget.OverrideField
// */
//
//Ext.define('Taco.view.priceList.widget.OverrideField', {
//    extend: 'Ext.panel.Panel',
//    alias: 'widget.taco-override-field',
//    requires: ['Taco.core.ux.form.CurrencyField'],
//    layout: {
//        type: 'hbox',
//        align: 'bottom'
//    },
//    width: '50%',
//    fieldName: 'price',
//    fieldLabel: 'Price',
//    currencyCode: 'USD',
//    enabledFieldName: 'isPriceEnabled',
//    record: null,
//    initComponent: function () {
//        var me = this;
//
//        this.priceField = Ext.widget('currencyfield', {
//            name: me.fieldName,
//            itemId: me.fieldName,
//            fieldLabel: me.fieldLabel,
//            currencyCode: me.currencyCode,
//            allowBlank: true,
//            hideTrigger: true,
//            margin: '0 30 0 0',
//            flex: 9,
//            required: false,
//            disabled: true
//        });
//
//        this.items = [
//            this.priceField,
//            {
//                xtype: 'checkbox',
//                name: me.enabledFieldName,
//                flex: 1,
//                checked: (me.record && !me.record.phantom) ? (me.record.get(me.enabledFieldName)) : false,
//                listeners: {
//                    change: function(cmp, newVal) {
//                        me.priceField.setDisabled(!newVal);
//                    },
//                    scope: me
//                }
//
//            }
//        ];
//    }
//});
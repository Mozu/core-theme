///**
// * @class Taco.view.shipping.CustomRateEditor
// */
//Ext.define('Taco.view.shipping.CustomRateEditor', {
//    extend: 'Ext.container.Container',
//    isFormField: true,
//    alias: 'widget.customrateeditor',
//    requires: ['Taco.view.shipping.CustomRateField'],
//    mixins: {
//        field: 'Ext.form.field.Field'
//    },
//    sectionTitle: null,
//    store: null,
//    border: false,
//    padding: '0 0 10 0',
//    layout: {
//        type: 'vbox'
//    },

//    initComponent: function () {
//        var me = this;

//        me.RateFields = new Ext.util.MixedCollection();

//        me.items = [{
//            xtype: 'container',
//            html: '<i>' + me.sectionTitle + '</i>',
//            cls: 'edittitle',
//            border: 0,
//            padding: '0 0 5 0',
//            width: 200
//        }, {
//            xtype: 'container',
//            cls: 'fieldcontainer'
//        }, {
//            xtype: 'action',
//            text: '+ Add another method',
//            click: function () {
//                me.addNew();
//            }
//        }];

//        me.callParent(arguments);

//        me.store.load({
//            scope: this,
//            callback: function (records, operation, success) {
//                me.bind(records);
//            }
//        });

//        me.store.on({
//            add: function (store, records, index, opts) {
//                me.bind(records);
//            },
//            remove: function (store, records, index, opts) {
//                me.notifyDirty();
//            }
//        });
//    },

//    bind: function (records) {
//        var me = this;
//        var fieldcontainer = me.down('container[cls="fieldcontainer"]');

//        for (var key in records) {
//            var field = Ext.create('Taco.view.shipping.CustomRateField', { data: records[key] });
//            field.on({
//                dirtychange: me.notifyDirty,
//                scope: me
//            });
//            me.RateFields.add(records[key].id, field);
//        }

//        fieldcontainer.add(me.RateFields.items);
//    },

//    isDirty: function () {
//        var me = this;

//        var isdirty = false;

//        Ext.Array.each(me.RateFields.items, function (item, index, items) {
//            if (item.isDirty()) {
//                isdirty = true;
//                return false;
//            }
//        });

//        isdirty = me.store.removed.length > 0;

//        return isdirty;
//    },

//    notifyDirty: function () {
//        var me = this;
//        me.fireEvent("dirtychange", me);
//    },

//    addNew: function () {
//        var me = this;

//        if (!me.shippingClassId) {
//            Ext.create('Taco.store.ShippingClasses').load(function (records, operation, success) {
//                Ext.Array.each(records, function (record, index, list) {
//                    if (record.get("internalName") == "Custom rates") {
//                        me.shippingClassId = record.get("shippingClassId");
//                        me.createModel();
//                    }
//                });
//            });
//        } else {
//            me.createModel();
//        }
//    },

//    createModel: function () {
//        var me = this;

//        var model = Ext.create(me.model, {
//            content: {
//                contentLocaleCode: 'en-US',
//                name: ''
//            },
//            flatPerItemShippingRate: {
//                price: {
//                    amount: 0,
//                    isAmountPercent: false,
//                    isoCurrencyCode: 'usd'
//                }
//            },
//            regions: [{ isoCountryCode: "US"}],
//            isActive: true,
//            shippingClassId: me.shippingClassId
//        });

//        me.store.add(model);
//    },

//    setValue: function (record) {
//        var me = this;
//        return me.mixins.field.setValue.call(me, record);
//    },

//    commit: function (isInternational) {
//        var me = this;

//        for (var key in me.RateFields.items) {
//            me.RateFields.items[key].commit(isInternational);
//        }
//    }
//});
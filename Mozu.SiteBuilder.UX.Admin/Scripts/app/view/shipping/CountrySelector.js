///**
// * @class Taco.view.shipping.CountrySelector
// */
//Ext.define('Taco.view.shipping.CountrySelector', {
//    extend: 'Taco.core.ux.form.BoxSelect',
//    requires: ['Taco.store.CountryComboBox'],
//    width: 550,
//    value: null,
//    minChars: 2,
//    queryMode: 'local',
//    cls: 'taco-boxselect',
//    store: null,
//    displayField: 'name',
//    valueField: 'countryCode',
//    shortField: 'name',
//    triggerOnClick: false,
//    pinList: false,

//    initComponent: function () {
//        var me = this;

//        me.store = Ext.create('Taco.store.CountryComboBox');

//        me.callParent(arguments);
//    },

//    removeByListItemNode: function (itemEl) {
//        var me = this,
//            rec = me.getRecordByListItemNode(itemEl);

//        if (rec && rec.get("countryCode") != "US") {
//            me.valueStore.remove(rec);
//            me.setValue(me.valueStore.getRange());
//        } else {
//            Ext.Msg.alert('Status', 'This country cannot be removed.');
//        }
//    },

//    onTriggerClick: function () {
//        var me = this;
//        var countryModal = Ext.create('Taco.core.ux.modal.ContentWithActions', {
//            combobox: me,
//            autoShow: true,
//            autoSize: true,
//            isValid: true,
//            isDirty: true,
//            title: 'Select Countries',
//            listeners: {
//                save: function () {
//                    var s = this.down('gridpanel').getSelectionModel().getSelection();
//                    this.combobox.setValue(Ext.Array.pluck(s, 'internalId'));
//                    this.hide();
//                }
//            },
//            items: [{
//                xtype: 'gridpanel',
//                height: 400,
//                selModel: Ext.create('Ext.selection.CheckboxModel', {
//                    checkOnly: true
//                }),
//                store: Ext.create('Taco.store.CountryComboBox'),
//                columns: [{
//                    header: 'Country',
//                    dataIndex: 'name',
//                    flex: 1
//                }],
//                listeners: {
//                    viewready: function () {
//                        var countries = new Array();
//                        var selected = me.getValue();
//                        var store = this.getStore();

//                        Ext.Array.each(selected, function (countryCode, index, list) {
//                            var c = store.getById(countryCode);
//                            if (c) {
//                                countries.push(c);
//                            }
//                        });

//                        if (countries.length > 0) {
//                            this.getSelectionModel().select(countries, true, true);
//                        }
//                    }
//                }
//            }]
//        });
//    }
//});
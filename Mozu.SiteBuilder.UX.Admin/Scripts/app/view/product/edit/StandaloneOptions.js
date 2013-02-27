///**
// * @class Taco.view.product.edit.StandaloneOptions
// */
//Ext.define('Taco.view.product.edit.StandaloneOptions', {
//    extend: 'Taco.core.ux.form.Module',
//    requires: ['Taco.core.ux.BoxReorderer', 'Taco.core.ux.OptionComboBox'],

//    productOptionValueStores: [],
//    model: 'Taco.model.ProductOption',
//    useModuleFrame: true,
//    closed: true,

//    initComponent: function () {
//        this.optionGrids = [];
//        this.optionSummaries = [];

//        this.header = [{
//            xtype: 'component',
//            html: 'Standalone Options'
//        }];

//        this.footer = [{
//            xtype: 'action',
//            text: '+ Use Existing',
//            margin: '0 0 0 20',
//            click: function () {
//                this.useExisingOption();
//            },
//            scope: this
//        }, {
//            xtype: 'action',
//            text: '+ Create New',
//            margin: '0 0 0 20',
//            click: function () {
//                this.createNewOption();
//            },
//            scope: this
//        }];

//        this.callParent(arguments);
//    },

//    loadRecord: function (data) {
//        var me = this;
//        this.data = data;
//        if (this.data.phantom) {
//            this.data.on({
//                idchanged: this.loadValues,
//                scope: this
//            });
//        } else {
//            this.loadValues();
//        }
//    },

//    loadValues: function () {
//        var me = this;
//        if (!this.store) {
//            this.store = this.data.productOptions();
//            this.store.on({
//                datachanged: this.onStoreChange,
//                update: this.onStoreChange,
//                scope: this
//            });
//        }
//        this.store.load({
//            callback: function () {
//                this.onRecordStoreLoad(this.store);
//            },
//            scope: this
//        });
//    },

//    onRecordStoreLoad: function (store) {
//        var me = this;

//        store.each(function (option, idx, total) {
//            var isLast, valStore;

//            isLast = !!(idx === total - 1);
            
//            valStore = Ext.create('Ext.data.Store', {
//                model: 'Taco.model.ProductOptionValue',
//                filters: [{
//                    property: 'option_id',
//                    value: option.get('id')
//                }, {
//                    property: 'productCode',
//                    value: option.get('productCode')
//                }],
//                modelDefaults: [{
//                    property: 'option_id',
//                    value: option.get('id')
//                }, {
//                    property: 'productCode',
//                    value: option.get('productCode')
//                }],
//                listeners: {
//                    datachanged: me.onStoreChange,
//                    update: me.onStoreChange,
//                    scope: me
//                }
//            });

//            valStore.load({
//                callback: function () {
//                    me.onOptionStoreLoad(option, valStore, isLast);
//                }
//            });
//        });
//    },

//    onOptionStoreLoad: function (option, store, isLast) {
//        var me = this,
//            grid, summary;

//        me.productOptionValueStores.push(store);

//        grid = Ext.create('Taco.core.ux.BaseGrid', {
//            store: store,
//            cls: Taco.baseCSSPrefix + 'form-module-grid',
//            reorderable: true,
//            selType: 'cellmodel',
//            plugins: [{
//                ptype: 'cellediting', clicksToEdit: 1
//            }],
//            columns: [{
//                xtype: 'removablecolumn',
//                dataIndex: 'internalValue',
//                text: option.get('internalName'),
//                resizable: false,
//                sortable: false,
//                draggable: false,
//                flex: 1,
//                listeners: {
//                    headerclick: function (ct, column, e, t, eOpts) { }
//                }
//            }, {
//                dataIndex: 'deltaPrice',
//                text: 'Cost',
//                width: 78,
//                resizable: false,
//                sortable: false,
//                draggable: false,
//                align: 'right',
//                editor: {
//                    xtype: 'numberfield',
//                    cls: [
//                        Taco.baseCSSPrefix + 'grid-editor-textfield',
//                        Taco.baseCSSPrefix + 'grid-editor-numberfield'],
//                    decimalPrecision: 2,
//                    hideTrigger: true,
//                    keyNavEnabled: false,
//                    mouseWheelEnabled: false,
//                    allowBlank: false
//                },
//                renderer: function (value) {
//                    return '$' + (value ? value : 0);
//                }
//            }],
//            listeners: {
//                removeoption: function () {
//                    console.log('an option should have been removed');
//                    option.store.remove(option);
//                    this.destroy();
//                }
//            }
//        });

//        summary = Ext.create('Ext.Component', {
//            xtype: 'component',
//            html: '<span class="option">' + option.get('internalName') +
//                ': </span><span class="values">' +
//                store.collect('internalValue').join(', ') + '</span>'
//        });

//        Ext.Array.include(me.optionGrids, grid.getId());
//        Ext.Array.include(me.optionSummaries, summary.getId());

//        if (isLast) {
//            me.main.removeAll();
//            me.summary.removeAll();

//            Ext.Array.each(me.optionGrids, function (cmpId) {
//                me.main.add(Ext.getCmp(cmpId));
//            });
//            Ext.Array.each(me.optionSummaries, function (cmpId) {
//                me.summary.add(Ext.getCmp(cmpId));
//            });
//        }
//    },

//    onStoreChange: function () {
//        this.fireEvent('dirtychange');
//    },

//    isDirty: function () {
//        var ret = false,
//            me = this;

//        if (!me.store) {
//            return false;
//        }
//        if (!!(me.store.getNewRecords().length || me.store.getUpdatedRecords().length || me.store.getRemovedRecords().length)) {
//            return true;
//        }
//        Ext.Array.each(me.productOptionValueStores, function (povStore) {
//            if (!!(povStore.getNewRecords().length || povStore.getUpdatedRecords().length || povStore.getRemovedRecords().length)) {
//                ret = true;
//            }
//        });

//        return ret;
//    },
//    resetOriginalValues: function () {
//        if (!this.store) {
//            return false;
//        }
//        this.store.rejectChanges();
//        Ext.Array.each(this.productOptionValueStores, function (povStore) {
//            povStore.rejectChanges();
//        });
//    },

//    initSaveTasks: function (chain) {
//        var me = this;

//        if (!me.store) {
//            return;
//        }
//        chain.addSyncStoreTask({
//            key: 'standAloneOption',
//            depends: [],
//            store: me.store
//        });

//        Ext.Array.each(me.productOptionValueStores, function (povStore, idx) {
//            chain.addSyncStoreTask({
//                key: 'standAloneOption_' + idx,
//                depends: [],
//                store: povStore
//            });
//        });
//    },

//    useExisingOption: function () {
//        var modal,
//            recordId;
        
//        modal = Ext.create('Taco.core.ux.modal.Modal', {
//            autoShow: true,
//            items: [{
//                name: 'boo',
//                xtype: 'optioncombobox',
//                fieldLabel: 'Option name',
//                listeners: {
//                    select: function (combo, records, opts) {
//                        recordId = combo.getValue();
//                        modal.down('#okButton').setDisabled(false);
//                    }
//                }
//            }, {
//                xtype: 'button',
//                text: 'ok',
//                disabled: true,
//                itemId: 'okButton',
//                handler: function () {
                    
//                    modal.hide();
//                    var value =modal.down('optioncombobox').value;
                   
//                    this.loadOptionRecord(value);
//                },
//                scope: this
//            }, {
//                xtype: 'button',
//                text: 'cancel',
//                handler: function () {
//                    modal.hide();
//                    return;
//                }
//            }]
//        });
//    },
//    getOptionStore: function () {
//        var store = Taco.app.getStore('Taco.store.Options');
//        if (!store.lastOptions) {
//            store.load();
//        }
//        return store;
//    },
//    createNewOption: function () {
//        var newOpt = this.getOptionStore().add({})[0];
//        this.launchLoadedEditor(newOpt);
//    },
    
    

//    loadOptionRecord: function (record) {
//        if (record.isModel && record.modelName == 'Taco.model.Option') {
//            var valStore = record.optionValues();

//            if (valStore.isLoading()) {
//                valStore.on('load', function () { this.launchLoadedEditor(record); }, this, { single: true });
//                return;
//            }
//            this.launchLoadedEditor(record);
//            return;
//        }
//        Ext.Error.raise('wrong stuff sent in');
//        //Taco.model.Option.load(recordId, {
//        //    success: function (record) {
//        //        var valStore = record.optionValues();

//        //        if (valStore.isLoading()) {
//        //            valStore.on('load', function () { this.launchLoadedEditor(record); }, this, { single: true });
//        //            return;
//        //        }

//        //        this.launchLoadedEditor(record);
//        //    },
//        //    failure: function () {
//        //        console.log('failed to load option model recordId', recordId);
//        //    },
//        //    scope: this
//        //});
//    },

//    launchLoadedEditor: function (record) {
//        var me = this;

//        oEdit = Ext.create('Taco.view.option.Edit', {
//            recordId: record,
//            optionType: 'standalone',
//            listeners: {
//                afterrender: function () {
//                    if (oEdit.recordId) {
//                        var db = oEdit.up('contentmodal').down('dirtybutton');
//                        if (db) {
//                            db.dirtyState = true;
//                            db.setDirty = Ext.emptyFn;
//                        }
//                    }
//                },
//                save: function () {
//                    var store = Ext.create('Ext.data.Store', {
//                        model: 'Taco.model.ProductOptionValue'
//                    });

//                    oEdit.data.optionValues().each(function (item) {
//                        if (!item.phantom) {
//                            var mdm = Ext.create('Taco.model.ProductOptionValue');
//                            mdm.set('productCode', me.data.get("productCode"));
//                            mdm.set('option_id', oEdit.data.getId());
//                            mdm.set('id', item.getId());
//                            mdm.set('intention', 'standAlone');
//                            //pants
//                            store.add(mdm);
//                        }
//                    }, me);

//                    store.sync({
//                        callback: function () {
//                            modal.hide();

//                            me.store.load({
//                                callback: function () {
//                                    var ogs = Ext.ComponentQuery.query('basegrid', me);

//                                    Ext.Array.each(ogs, function (og) {
//                                        me.form.remove(og);
//                                    });
//                                    me.loadValues();
//                                }
//                            });

//                        }
//                    });
//                },
//                cancel: function () {
//                    modal.hide();
//                },
//                scope: me
//            }
//        });

//        modal = Ext.create('Taco.core.ux.modal.Content', {
//            items: [oEdit],
//            autoShow: true
//        });


//    }
//});
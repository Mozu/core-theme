/**
 * @class Taco.view.product.edit.ConfigurableOptions
 */
Ext.define('Taco.view.product.edit.ConfigurableOptions', {
    extend: 'Taco.core.ux.form.Module',
    requires: ['Taco.view.product.edit.ConfigurableOptionsGrid', 'Taco.core.ux.OptionComboBox'],

    model: 'Taco.model.ProductVariation',
    bubbleEvents: ['inventorycontrolchange'],
    useModuleFrame: true,
    closed: true,

    initComponent: function() {

        this.header = [{
            xtype: 'component',
            html: 'Configurable Options'
        }];

        this.footer = [{
                xtype: 'action',
                text: '+ Use Existing',
                margin: '0 0 0 20',
                click: function() {
                    this.useExistingOption();
                },
                scope: this
            }, {
                xtype: 'action',
                text: '+ Create New',
                margin: '0 0 0 20',
                click: function() {
                    this.createNewOption();
                },
                scope: this
            }];

        this.callParent(arguments);
    },

    loadRecord: function(data) {
        this.data = this.record = data;
        this.loadValues();
    },

    loadValues: function() {
        if (!this.store) {
            this.store = this.data.productVariations();
            this.store.on({
                datachanged: this.onStoreChange,
                update: this.onStoreChange,
                scope: this
            });
        }

        this.store.load({
            callback: function(store) {
                this.onRecordStoreLoad(this.store);
            },
            scope: this
        });
    },

    onRecordStoreLoad: function(store) {
        var summaries = [],
            md = store.getProxy().getReader().metaData,
            optionsCount = md ? md.options.length : 0,
            summary, grid;

        this.fireEvent('inventorycontrolchange', 'configurableoptions', !(optionsCount));


        // build summaries
        for (var i = 0; i < optionsCount; i++) {
            summary = Ext.create('Ext.Component', {
                xtype: 'component',
                renderTpl: [
                    '<span class="option">{caption}: </span>',
                    '<span class="values">{fieldName}</span>'
                ],
                renderData: md.options[i],
                renderSelectors: {
                    optionEl: 'span.option',
                    valuesEl: 'span.values'
                },
                listeners: {
                    afterrender: function(cmp) {
                        var fieldName = cmp.valuesEl.getHTML();
                        cmp.valuesEl.setHTML(this.store.collect(fieldName).join(', '));
                    },
                    scope: this
                }
            });
            summaries.push(summary);
        }

        // build grid
        grid = Ext.create('Taco.view.product.edit.ConfigurableOptionsGrid', {
            record: this.record,
            itemId:'configurableOptionsGrid',
            store: store,
            listeners: {
                optiondelete: this.onRecordStoreLoad,
                scope: this
            }
        });

        this.main.removeAll();
        this.main.add(grid);

        this.summary.removeAll();
        this.summary.add(summaries);
    },

    onStoreChange: function() {
        this.fireEvent('dirtychange');
    },

    isDirty: function() {
        if (!this.store) {
            return false;
        }
        return !!(this.store.getNewRecords().length || this.store.getUpdatedRecords().length || this.store.getRemovedRecords().length);
    },
    resetOriginalValues: function() {
        if (!this.store) {
            return false;
        }
        this.store.rejectChanges();
    },

    initSaveTasks: function(chain) {
        if (!this.store) {
            return;
        }
        chain.addSyncStoreTask({
            key: 'configurationOption',
            depends: [],
            store: this.store
        });
    },

    useExistingOption: function() {
        var modal, record;

        modal = Ext.create('Taco.core.ux.modal.Modal', {
            autoShow: true,
            items: [{
                    name: 'boo',
                    xtype: 'optioncombobox',
                    isConfigurable: true,
                    fieldLabel: 'Option name',
                    listeners: {
                        select: function(combo, records, opts) {
                            record = records[0];
                            modal.down('#okButton').setDisabled(false);
                        }
                    }
                }, {
                    xtype: 'button',
                    text: 'ok',
                    disabled: true,
                    itemId: 'okButton',
                    handler: function() {
                        modal.hide();
                        this.loadOptionRecord((record.modelName == "Taco.model.Option") ? record : record.getId());

                    },
                    scope: this
                }, {
                    xtype: 'button',
                    text: 'cancel',
                    handler: function() {
                        modal.hide();
                        return;
                    }
                }]
        });

    },
    getOptionStore: function() {
        var store = Taco.app.getStore('Taco.store.Options');
        if (!store.lastOptions) {
            store.load();
        }
        return store;
    },
    createNewOption: function () {
        var newOpt = this.getOptionStore().add(Ext.create('Taco.model.Option'))[0];
        this.launchLoadedEditor(newOpt);
    },

    loadOptionRecord: function (record) {
        if (record.isModel && record.modelName == 'Taco.model.Option') {
            var valStore = record.optionValues();

            if (valStore.isLoading()) {
                valStore.on('load', function () { this.launchLoadedEditor(record); }, this, { single: true });
                return;
            }
            this.launchLoadedEditor(record);
            return;
        }
        Ext.Error.raise('wrong stuff sent in');
        //Taco.model.Option.load(recordId, {
        //    success: function (record) {
        //        var valStore = record.optionValues();
                
        //        if (valStore.isLoading()) {
        //            valStore.on('load', function () { this.launchLoadedEditor(record); }, this, { single: true });
        //            return;
        //        }

        //        this.launchLoadedEditor(record);
        //    },
        //    failure: function () {
        //        console.log('failed to load option model recordId', recordId);
        //    },
        //    scope: this
        //});
    },

    launchLoadedEditor: function (record) {
        // var me = this;
        
        // oEdit = Ext.create('Taco.view.option.Edit', {
        //     optionType: 'configurable',
        //     recordId: record,
        //     listeners: {
        //         afterrender: function () {
        //             if (oEdit.recordId) {
        //                 var db = oEdit.up('contentmodal').down('dirtybutton');
        //                 if (db) {
        //                     db.dirtyState = true;
        //                     db.setDirty = Ext.emptyFn;
        //                 }
        //             }
        //         },
        //         save: function () {
        //             var store = Ext.create('Ext.data.Store', {
        //                 model: 'Taco.model.ProductOptionValue'
        //             });

        //             oEdit.data.optionValues().each(function (item) {
        //                 if (!item.phantom) {
        //                     var mdm = Ext.create('Taco.model.ProductOptionValue');
        //                     mdm.set('productCode', me.data.getId());
        //                     mdm.set('option_id', oEdit.data.getId());
        //                     mdm.set('id', item.getId());
        //                     mdm.set('intention', 'configuration');
        //                     //pants off
        //                     store.add(mdm);
        //                 }
        //             }, me);

        //             store.sync({
        //                 callback: function () {
        //                     modal.hide();
        //                     me.loadValues();
        //                 }
        //             });
        //         },
        //         cancel: function () {
        //             modal.hide();
        //         },
        //         scope: me
        //     }
        // });

        // modal = Ext.create('Taco.core.ux.modal.Content', {
        //     items: [oEdit],
        //     autoShow: true
        // });
        // 
        console.log('launchLoadedEditor');
        Ext.create('Taco.view.option.EditModal', {
            autoShow: true,
            record: record
        });
    }
});
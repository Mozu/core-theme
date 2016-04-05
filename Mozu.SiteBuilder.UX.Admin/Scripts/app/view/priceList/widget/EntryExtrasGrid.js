/**
 * @class  Taco.view.priceList.widget.EntryExtrasGrid
 * @description The grid panel to edit price list entry extras
 */
Ext.define('Taco.view.priceList.widget.EntryExtrasGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.taco-pricelist-entry-extras-grid',
    cls: 'taco-variant-grid',

    requires: [
        'Taco.model.PriceListEntryExtra'
    ],

    
    mixins: {
        pageable: 'Taco.core.ux.mixins.Pageable',
        rowEditable: 'Taco.core.ux.mixins.RowEditable',
        deleteFromGrid: 'Taco.core.ux.mixins.DeleteFromGrid'
    },
    showActionsColumn: true,
    enablePaging: true,
    //stateful: true,
    stateId: 'statefulPriceListEntryExtrasGrid',
    hideSearchToolbar: true,

    enableAutoSelect: false,

    record: null,

    viewConfig: {
        enableTextSelection: false,
        stripeRows: false
    },

    initComponent: function () {
        var me = this;
        this.columns = this.getColumnConfig();

        if (this.showActionsColumn) {
            var actionColumn = this.getActionColumn();
            if (actionColumn) {
                this.columns.push(actionColumn);
            }
        }

        // initialize the delete mixin
        this.mixins.deleteFromGrid.init.apply(this);

        //this.rowEditor = Ext.create('Ext.grid.plugin.RowEditing', {
        //    clicksToMoveEditor: 1,
        //    clicksToEdit: 1,
        //    autoCancel: false,
        //    errorSummary: false,
        //    listeners: {
        //        edit: this.onRowEdit,
        //        canceledit: this.onRowCancelEdit,
        //        scope: this
        //    }
        //});

        this.mon(this, 'beforeedit', function (editorPlugin, e, eOpts) {
            
            var editor = e.column.getEditor(),
                record = e.record;

            if (editor.onEditorShow) {
                return editor.onEditorShow(editor, record)
            }
            return true;
        }, this);

        this.store = this.getStore();

        if (me.enablePaging) {
            // initialize the grid paging toolbar mixin
            this.mixins.pageable.constructor.apply(this);
        }
        
        if (!this.plugins) {
            this.plugins = [];
        } else {
            this.plugins = Ext.clone(this.plugins);
        }

        // this plugin will auto select the first record in the grid and manage re-selection of the selected item after a store load
        if (this.enableAutoSelect !== false) {            
            this.plugins.push("autoselect");
        }

        this.plugins.push(
            Ext.create('Ext.grid.plugin.CellEditing', {
            pluginId: "cellEditing",
            clicksToEdit: 1
        }));

        this.callParent(arguments);

        this.getView().getRowClass = function (record) {
            return record.get('isActive') ? '' : 'invalid-record';
        };

        // me.mon(me.view, 'itemcontextmenu', function (cmp, record, item, index, e) {
        //     var menu = new Ext.menu.Menu({
        //         plain: true,
        //         shadow: false,
        //         cls: Taco.baseCSSPrefix + 'grid-row-menu',
        //         items: [{
        //             text: "Enable All",
        //             handler: function () {
        //                 me.enableAll(record)
        //             }
        //         }, {
        //             text: "Disable All",
        //             handler: function () {
        //                 me.disableAll(record)
        //             }
        //         }]
        //     });
        //
        //     //e.preventDefault();
        //     e.stopEvent();
        //     menu.showAt(e.xy);
        // }, me);


    },

    getColumnConfig: function() {
        var columns = [
            {
                xtype: 'gridcolumn',
                dataIndex: 'attributeCode',
                stateId: 'code',
                text: 'Code',
                hideable: true,
                flex: 1,
                sortable: false
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'attributeName',
                stateId: 'name',
                text: 'Name',
                hideable: true,
                flex: 2,
                sortable: false
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'value',
                stateId: 'value',
                text: 'Value',
                hideable: true,
                flex: 1,
                sortable: false
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'catalogPrice',
                stateId: 'catalogPrice',
                text: 'Catalog Price',
                hideable: false,
                flex: 1,
                sortable: false,
                renderer: function(catPrice) {
                    return (catPrice || catPrice === 0) ? Taco.app.context.getCurrent().formatCurrency(catPrice) : '';
                }
            }, {
                text: 'Override Price',
                dataIndex: 'overridePrice',
                stateId: 'overridePrice',
                flex: 1,
                editor: {
                    xtype: 'currencyfield',
                    currencyCode: this.record.get('currencyCode'),
                    allowBlank: true,
                    decimalPrecision: 2,
                    showBorder: true,
                    selectOnFocus: true,
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false,
                    msgTarget: "qtip"
                },
                renderer: function(value) {
                    return (value || value === 0) ? Taco.app.context.getCurrent().formatCurrency(value) : 'Default';
                }
            }
        ];
        return columns;
    },

    getActionColumn: function () {
        var me = this,
            actionColumn = null,
            actions = this.getActionItems();

        // as long as we have actions;
        if (actions.length) {
            actionColumn = {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                onMenuShow: me.onActionMenuShow,
                menuItems: actions
            };
        }

        return actionColumn;
    },

    getActionItems: function () {
        var me = this,
            result = [];
        
        return result;
    },

    onActionMenuShow: function (menu, eventData) {
        var previewAction = menu.items.get('preview'),
            liveAction = menu.items.get('live'),
            defaults = eventData.header.menuItemDefaults,
            mc = Taco.app.context.getMasterCatalog();

        if (previewAction) {
            previewAction.menu.removeAll();
        }
        liveAction.menu.removeAll();
        Ext.Array.each(mc.sites, function (site) {
            if (site.isMozuRendered && (eventData.grid.priceListRecord.get('validForAllSites')
                || Ext.Array.indexOf(eventData.grid.priceListRecord.get('validSites'), site.id) !== -1)) {

                if (mc.productPublishingMode === 'Pending') {
                    previewAction.menu.add(Ext.applyIf({
                        text: site.name,
                        menuColumnHandler: function (item, eventData) {
                            window.open('/_gosite/' + site.id
                                + '?environment=preview&redir='
                                + encodeURIComponent('/p/'
                                    + eventData.record.get('productCode')
                                    + '?mz_pricelist='
                                    + eventData.record.get('priceListCode'))
                            );
                        }
                    }, defaults));
                }

                liveAction.menu.add(Ext.applyIf({
                    text: site.name,
                    menuColumnHandler: function (item, eventData) {
                        window.open('/_gosite/' + site.id + '?environment=live&redir=' + encodeURIComponent('/p/' + eventData.record.get('productCode')));
                    }
                }, defaults));
            }
        });
    },

    getStore: function (autoLoad) {
        var me = this,
            autoLoad = (autoLoad !== false);

        if (me.priceListEntryExtrasStore) {
            return me.priceListEntryExtrasStore;
        }

        me.priceListEntryExtrasStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.PriceListEntryExtra',
            data: me.record.get('extras'),
            pageSize: 10,
            autoLoad: true,
            proxy: 'memory'
        });

        me.mon(me.priceListEntryExtrasStore, 'update', function (view, record, operation, modifiedFieldNames) {
            // need to cache any modifications before reloading the store data;
            //me.cacheModifiedRecords([record]);
        }, me);

        me.mon(me.priceListEntryExtrasStore, 'beforeload', function (store, records, successful) {

        }, me);

        /*
         me.mon(me.productVariationStore, 'beforeload', function (store) {
         // need to cache any modifications before reloading the store data;

         me.cacheModifiedRecords();
         },me)
         */
        me.mon(me.priceListEntryExtrasStore, 'load', function (store, records,successful) {
            // need to recover any cached modifications and apply them if they are present in the store.;
            //me.applyModifiedRecords();
        }, me);

        //params = {};

        return this.priceListEntryExtrasStore;
    },

    doSave: function () {
        var me = this;
        // update the cache;
        //me.cacheModifiedRecords();

        // update the product.options store with the current version;
        // todo change the options modal to be a helper modal that returns the options data rather than sets it on the product.options.store;

        // update the the product model with any changes to the options and variations.
        // var store = this.product.getVariations();
        //
        // // need to load the entire set of variations so I can update them with the new modiifed values;        
        // this.mon(store, 'load', function (store) {
        //    
        //     me.applyModifiedRecords(store);
        //    
        //     me.fireEvent('savesuccess', this);
        //    
        // }, { single: true })
        //
        // store.load();

        

    },





    // // gets latest version of the modified records; returns a mixed collection;
    // getModifiedRecords : function (){
    //     var me=this;
    //     //me.cacheModifiedRecords();
    //     return me.modifiedRecords;
    // },
    //
    // // cache a copy of every modification the user has made to the variants. this will span pages and data loads;
    // cacheModifiedRecords: function (records) {
    //     var me = this,
    //         modifiedRecords = records || me.store.getModifiedRecords()
    //
    //     // need to process all previously added modified records; this is required because we may have cached a change
    //
    //
    //     Ext.Array.each(modifiedRecords, function (record) {
    //         var modRec = me.modifiedRecords.getByKey(record.internalId);
    //         if (modRec) {
    //             Ext.apply(modRec, record.data);
    //         } else {
    //             me.modifiedRecords.add(record.internalId, Ext.clone(record.data));
    //         }
    //     })
    // },

    // reapplies the cached modified records after a store load has happened;
    // applyModifiedRecords: function (store) {
    //     var me = this,
    //         priceMode = me.pricingMode,
    //         store = store || this.store;
    //
    //
    //     me.modifiedRecords.each(function (item) {
    //         var record = store.getById(item.key);
    //         // check to see if the record still exists in the data set; could have been removed due to option change or beccause of page change;
    //         if (record) {
    //             record.set(item);
    //             if (record.get('variationPricingMethod') !== priceMode) {
    //                 record.set('variationPricingMethod', priceMode);
    //             }
    //         }
    //     })
    // },

    
    onRowEdit: function (editor, e) {
        
    },

    onRowCancelEdit: function (e) {

    },

    // addSaveTasks: function (tasks, updateRecord, saveRecord) {
    //
    //
    //     this.callParent(arguments);
    //     var storeTask = tasks.tasks.findBy(function (innerTask) {
    //         return innerTask.store == this.store;
    //     }, this);
    //
    //     storetask.dependencyFilter(function (innerTask) {
    //         return innerTask.saveRecord == this.product;
    //     }, this);
    //     return tasks;
    // }
});
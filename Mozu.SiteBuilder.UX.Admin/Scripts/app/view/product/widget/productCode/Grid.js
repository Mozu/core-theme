/**
 * @class  Taco.view.product.variant.Grid
 * @author Travis Johnson
 * @description The grid panel to edit and enable variants
 */
Ext.define('Taco.view.product.widget.productCode.Grid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.taco-product-variant-grid',
    cls: 'taco-variant-grid',

    requires: [
        'Ext.selection.CellModel',
        'Ext.grid.column.Check'
    ],

    // optional data from grid's store that can be passed in when creating this grid to reload unpersisted data. This occurs when user updates records in the store and then updates the options. the update options use case blows the grid and store away and starts from scratch. 
    redrawData : null,

    optionsData : null,
    
    mixins: {
        pageable: 'Taco.core.ux.mixins.Pageable'
    },

    enablePaging: true,
    stateful: true,
    stateId: 'statefulProductOptionsGrid',
    hideSearchToolbar: true,
    pricingMode: 'Fixed',
    pricingModeChanged: false,

    enableAutoSelect: false,

    viewConfig: {
        emptyText: '<div class="empty-grid-message">No varients to display</div>',
        deferEmptyText: false,
        stripeRows: false
    },

    initComponent: function () {
        var me = this;


        // if editing variations from a previous session, you will need to pass in those modifications;
        me.modifiedRecords = new Ext.util.MixedCollection();

        // // need to get a copy of any unsaved modifications from the product entities version of the variations store;
        var unsavedModifications = this.product.productVariationStore.getModifiedRecords();
        // cache those changes locally; they will be applied when the internal store loads its data;
        Ext.Array.each(unsavedModifications, function (record) {            
            me.modifiedRecords.add(record.internalId, record.data);
        });
        
        this.selModel = Ext.create('Ext.selection.CellModel', {
            enableFieldTabbing: true,
            // this disables support for tabbing into the grid when not editable;
            enableKeyNav: true
        });        
        
        this.columns = this.rebuildColumns(me.pricingMode);


        
        




        this.mon(this, 'beforeedit', function (editorPlugin, e, eOpts) {
            var editor = e.column.getEditor(),
                record = e.record;
            editor.invalidValue = record.get("productCode");
            return true;
        }, this);

        //this.store = this.product.getVariations();
        this.store = this.getVariationStore();
        
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

//        this.plugins.push(this.rowEditor);


        this.plugins.push(
            Ext.create('Ext.grid.plugin.CellEditing', {
            pluginId: "cellEditing",
            clicksToEdit: 1
        }))

        //need to modify all records if pricing mode changed so that they get marked as modified.
        if (this.pricingModeChanged) {
            this.mon(this.store, 'load', function () {
                var variantPricingMode = me.pricingMode;
                me.store.each(function (item) {
                    item.set('variationPricingMethod', variantPricingMode);
                });
            });
        }
        
        // we shouldn't be making the load call if we have no options selected. the call throws ajax exception
        var hasOptions = this.product.getOptions().count();

        if (hasOptions) {
            this.loadVariations();
        }        

        this.callParent(arguments);

        this.getView().getRowClass = function (record) {
            return record.get('isActive') ? '' : 'invalid-record';
        };

    },

    getColumnConfig: function () {
        var optionColumns = [],
            staticColumns;

        this.product.getOptions().each(function (option, index) {
            var attribute = this.findAttribute(option),
                attributeText = attribute.get('adminName'),
                attributeValues = attribute.get('selectedValues'),
                attributeId = attribute.getId();


            optionColumns.push({
                //flex: 1,
                text: attributeText,
                dataIndex: 'options',
                sortable: false,
                renderer: function (values) {


                    var value = Ext.Array.findBy(values, function (v) {
                        return v.attributeFQN == attributeId
                    });

                    var attributeValue = Ext.Array.findBy(attributeValues, function (item) {
                        return typeof item.id !== 'undefined' && (item.id.toString() === value.value.toString());
                    });

                    if (!attributeValue) {
                        return value.value;
                    }
                    return attributeValue.value;
                }
            });
        }, this);


        staticColumns = [
            { text: 'Current Product Code', dataIndex: 'productCode', width: 250 },
            {
                text: 'New Product Code', dataIndex: 'newProductCode',
                width: 250,
                editor: {
                    validator: function (value) {
                        return (value && value == this.invalidValue) ? "The new and current product code cannot be the same" : true
                    },
                    emptyText: "Enter New Product Code",
                    xtype: 'textfield',
                    showBorder: true,
                    msgTarget: "qtip"
                }

            }

        ]

        return staticColumns.concat(optionColumns);
    },

    rebuildColumns: function (pricingMode) {
        // replaced this function for legacy code compat
        return this.getColumnConfig(pricingMode);
    },

    doSave: function () {
        var me = this;
        // update the cache;
        //me.cacheModifiedRecords();

        // update the product.options store with the current version;
        // todo change the options modal to be a helper modal that returns the options data rather than sets it on the product.options.store;

        // update the the product model with any changes to the options and variations.
        var store = this.product.getVariations();

        // need to load the entire set of variations so I can update them with the new modiifed values;        
        this.mon(store, 'load', function (store) {
            
            me.applyModifiedRecords(store);
            
            me.fireEvent('savesuccess', this);
            
        }, { single: true })

        store.load();
    },

    onOptionChange: function (optionsData) {
        var me = this;
        

        me.optionsData = optionsData

        var columns = this.rebuildColumns()

        // reconfigure the columns and load new variations
        this.reconfigure(null, columns);

        

        // load new variations
        this.loadVariations()
    },

    loadVariations: function () {
        var me = this,
            proxy,
            params = {};

        

        params.options = [];

        //var optionsData = me.getOptions();
        
        // mixed collection
        me.optionsData.each(function (option) {
            params.options.push({
                attributeFQN: option.attributeFQN,
                values: option.values
            });
        })

        params.tempProductCode = me.product.data.tempProductCode;
        params.productTypeId = me.product.get('productTypeId');
        params.options = Ext.JSON.encode(params.options);

        // need to make a load call initially and ajax call with merge logic after initialization. 

        proxy = me.productVariationStore.getProxy();

        if (!proxy.extraParams) {
            proxy.extraParams = {};
        }
        proxy.extraParams.productCode = this.product.getId();

        proxy.extraParams.tempProductCode = params.tempProductCode;
        proxy.extraParams.productTypeId = params.productTypeId;
        proxy.extraParams.options = params.options;


        // if the store has modifications we don't want to call load since we will loose 


        me.productVariationStore.load({
            //params: params,
            callback: function (records, operation, success) {
                if (!success) {
                    var error = operation.error;
                    var json = Ext.decode(operation.error.responseText, true);
                    var msg = json.message;
                    Taco.app.fireEvent('setmessage', msg, 'error');
                    return
                }
            }
        });

    },

    // gets latest version of the modified records; returns a mixed collection;
    getModifiedRecords : function (){
        var me=this;
        return me.modifiedRecords;
    },

    // cache a copy of every modification the user has made to the variants. this will span pages and data loads;
    cacheModifiedRecords: function (records) {
        var me = this,
            modifiedRecords = records || me.store.getModifiedRecords()

        // need to process all previously added modified records; this is required because we may have cached a change 


        Ext.Array.each(modifiedRecords, function (record) {
            var modRec = me.modifiedRecords.getByKey(record.internalId);            
            if (modRec) {
                Ext.apply(modRec, record.data);
            } else {
                me.modifiedRecords.add(record.internalId, Ext.clone(record.data));
            }
        })
    },

    // reapplies the cached modified records after a store load has happened;
    applyModifiedRecords: function (store) {
        var me = this,
            priceMode = me.pricingMode,
            store = store || this.store;


        me.modifiedRecords.each(function (item) {
            var record = store.getById(item.key);
            // check to see if the record still exists in the data set; could have been removed due to option change or beccause of page change;
            if (record) {
                record.set(item);
                if (record.get('variationPricingMethod') !== priceMode) {
                    record.set('variationPricingMethod', priceMode);
                }
            }
        })
    },

    getVariationStore: function (autoLoad) {
        var me = this;

        if (me.productVariationStore) {
            return me.productVariationStore;
        }
        me.productVariationStore = me.store || me.createVariationStore()

        
        me.mon(me.productVariationStore, 'update', function (view, record, operation, modifiedFieldNames) {
            // need to cache any modifications before reloading the store data;            
            me.cacheModifiedRecords([record]);
        }, me)

        me.mon(me.productVariationStore, 'beforeload', function (store, records, successful) {
            // check to make sure we have the prerequesites for loading the variations data; this happens when you click the refresh button on the paging toolbar with no options selected;

            // need options;            
            if (!this.optionsData.length) {
                return false;
            }
        }, me)

        me.mon(me.productVariationStore, 'load', function (store, records,successful) {
            // need to recover any cached modifications and apply them if they are present in the store.;
            me.applyModifiedRecords();
        }, me)

        if (autoLoad) {
            me.productVariationStore.load();
        }

        return me.productVariationStore;
    },

    createVariationStore: function() {
        return Ext.create('Ext.data.Store', {
            fields: [
                "productCode",
                "newProductCode",
                {
                    name: 'options',
                    type: 'any',
                    defaultValue: []
                }
            ],
            autoLoad: false,
            pageSize: 1000,
            filters: [
                function (item) {
                    return item.get("productCode");
                }
            ],
            proxy: {
                type: 'ajax',
                // changed for issue with long URI on GET request
                api: {
                    read: '/admin/form-to-get/app/productVariation/list'
                },
                actionMethods: {
                    create: 'POST',
                    read: 'POST',
                    update: 'POST',
                    destroy: 'POST',
                    duplicate: 'POST'
                },
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success'
                },
                writer: {
                    allowSingle: false,
                    type: 'json'
                },
                extraParams: {
                    productCode: this.product.getId()
                }
            }
        });
    },

    onRowEdit: function (editor, e) {
        
    },

    onRowCancelEdit: function (e) {

    },

    findAttribute: function (record) {
        return this.productType.getOptions().findRecord('attributeFQN', record.get('attributeFQN'), 0, false, false, true);
    },
});
/**
 * @class  Taco.view.product.variant.Grid
 * @author Travis Johnson
 * @description The grid panelt to edit and enable variants
 */
Ext.define('Taco.view.product.variant.Grid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.taco-product-variant-grid',
    //requires:['Taco.view.product.variant.Modal'],
    cls: 'taco-variant-grid',

    requires: [
        //'Ext.grid.plugin.RowEditing'
        'Ext.selection.CellModel',
        'Ext.grid.column.Check'
    ],

    //disableSelection: true,

    // optional data from grid's store that can be passed in when creating this grid to reload unpersisted data. This occurs when user updates records in the store and then updates the options. the update options use case blows the grid and store away and starts from scratch. 
    redrawData : null,

    optionsData : null,
    
    mixins: {
      //  launcheditor: 'Taco.core.ux.mixins.LaunchEditor',
//        navHeader: 'Taco.core.ux.mixins.NavHeader',
        
//        searchable: 'Taco.core.ux.mixins.Searchable',
        //rowEditable: 'Taco.core.ux.mixins.RowEditable',
        pageable: 'Taco.core.ux.mixins.Pageable'
    },

    enablePaging: true,

    hideSearchToolbar: false,

    enableAutoSelect: true,

    viewConfig: {
        enableTextSelection: false,
        stripeRows: false
    },

    initComponent: function () {
        var me = this,
            //optionColumns = [],
            //staticColumns,
            //tplColumnHeader,            
            goodsType = this.productType.get('goodsType'),
            isPhysical = (goodsType === 'Physical'),
            isDigitalCredit = (goodsType === 'DigitalCredit'),
            fulfillmentData = (isPhysical) ? [{
                "id": "DirectShip",
                "name": "Direct Ship"
            }, {
                "id": "InStorePickup",
                "name": "In Store Pickup"
            }] : [{
                "id": "Digital",
                "name": "Email"
            }];

        

        // if editing variataions from a previous session, you will need to pass in those modifications;
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

        var fulfillmentTypeData = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: fulfillmentData
        });

        this.fulfillmentEditor = {
            xtype: "combobox",
            triggerAction: 'all',
            queryMode: 'local',
            displayField: 'name',
            valueField: 'id',
            showBorder:true,
            autoSelect: true,
            forceSelection: true,
            store: fulfillmentTypeData,
            multiSelect: true
        };


        
        
        this.columns = this.rebuildColumns()


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

            

            //fields[i], editor, context

            if (editor.onEditorShow) {
                return editor.onEditorShow(editor, record)
            }

            //if (editor.$className == "Taco.view.order.widget.FulfillmentPickerField") {


            //    // prevent the user from editing the fulfillment method of an electronic download since we don't support that yet.
            //    if (record.data.fulfillmentMethod == "Digital") {
            //        return false
            //    }

            //    // neeed to set the productCode on the fulfillmentCombo editor so that the store can use it in its filter when opened;
            //    var productCode = record.get("productCode"),
            //        parentProductCode = record.get("parentProductCode"),
            //        fulfillmentConfig;

            //    // if we have a parentProductCode, that means our productCode is really the code for the product varient; need to remamp these so that the service is happy.
            //    if (parentProductCode) {
            //        fulfillmentConfig = {
            //            productCode: parentProductCode,
            //            variationProductCode: productCode
            //        }
            //    } else {
            //        fulfillmentConfig = {
            //            productCode: productCode,
            //            variationProductCode: null
            //        }
            //    }

            //    //editor.setProductCode(productCode);
            //    editor.setProductConfig(fulfillmentConfig);
            //}

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

        // this plugin will auto select the first record in the grid and manage reselection of the selected item after a store load
        if (this.enableAutoSelect !== false) {            
            this.plugins.push("autoselect");
        }

//        this.plugins.push(this.rowEditor);


        this.plugins.push(
            Ext.create('Ext.grid.plugin.CellEditing', {
            pluginId: "cellEditing",
            clicksToEdit: 1
        }))

        


        if (isDigitalCredit) {
            this.mon(this.store, 'load', function () {
                me.store.each(function (item) {
                    item.set('fulfillmentTypesSupported', ['Digital']);
                });
            });
        }

        
        // we shouldnt be making the load call if we have no options selected. the call throws ajax exception
        var hasOptions = this.product.getOptions().count();

        



        if (hasOptions) {

            this.loadVariations();

            //if (this.loadWithUpdatedOptions) {
            //    this.store.loadFromOptions();
            //} else {
            //    this.store.load();
            //}
        }        
        

        //if (!this.store.hasLoaded() && !this.product.phantom) {
        //    this.store.load();
        //} else if (!this.store.count()){
        //    this.store.loadFromOptions();
        //}

        this.callParent(arguments);

        this.getView().getRowClass = function (record) {
            return record.get('isActive') ? '' : 'invalid-record';
        };

        me.mon(me.view, 'itemcontextmenu', function (cmp, record, item, index, e) {
            var menu = new Ext.menu.Menu({
                plain: true,
                shadow: false,
                cls: Taco.baseCSSPrefix + 'grid-row-menu',
                items: [{
                    text: "Enable All",
                    handler: function () {
                        me.enableAll(record)
                    }
                }, {
                    text: "Disable All",
                    handler: function () {
                        me.disableAll(record)
                    }
                }]
            });

            //e.preventDefault();
            e.stopEvent();
            menu.showAt(e.xy);
        }, me);


    },

    rebuildColumns: function () {
        var me = this;
        var isActiveColumn = [this.getIsActiveColumn()]
        var summaryColumn = [this.getSummaryColumn()]
        var optionColumns = this.getOptionColumns();
        var staticColumns = this.getStaticColumns();
        
        
        return Ext.Array.union(isActiveColumn, summaryColumn, optionColumns, staticColumns)
    },

    getIsActiveColumn :function (){
        return {
            text: 'Enabled',
            dataIndex: 'isActive',
            xtype: "checkcolumn",
            width: 60,
            resizeable: false,
            hideable: false,
            //align: 'center',
            //renderer: function (value) {
            //    return value ? '<div class="check"></div>' : '';
            //},
            editor: {
                xtype: 'checkbox',
                showBorder: false
            }
        }
    },

    getSummaryColumn : function (){
        var me = this;

        var summaryTpl = new Ext.XTemplate(
                '<tpl for="options">',
                    '<div style="padding-bottom:5px;">',
                    '{[this.getAttributeLabel(values)]} : {value}',
                    '</div>',
                '</tpl>',
                {
                    getAttributeLabel: function (values) {
                        var name = me.findAttributeName(values.attributeFQN);
                        return name
                    }
                }
            );




        return {
            text: 'Option Summary',
            dataIndex: 'isActive',
            xtype: "templatecolumn",
            hidden: true,
            width: 260,
            tpl: summaryTpl
        }

    },

    getOptionColumns: function () {
        var me = this,
            optionColumns = [];
        
        me.optionsData.each( function (option) { 

        


        //this.product.getOptions().each(function (option, index) {

            
            var attribute = this.findAttribute(option.attributeFQN),
                attributeText = attribute.get('attributeName'),
                attributeValues = attribute.get('selectedValues'),
                attributeId = attribute.getId(),
                optionHasValuesSelected = option.values.length;

            
            // only add a column for options that have values selected;
            if (optionHasValuesSelected) {
                optionColumns.push({
                    //flex: 1,
                    text: attributeText,
                    dataIndex: 'options',
                    hidden: false,
                    "type": "text",
                    name: "'options' + index",
                    sortable: false,
                    renderer: function (values) {

                        var value = Ext.Array.findBy(values, function (v) {
                            return v.attributeFQN == attributeId
                        });

                        // option has no values selected;
                        if (!value) {
                            return "";
                        }

                        var attributeValue = Ext.Array.findBy(attributeValues, function (item) {
                            return typeof item.id !== 'undefined' && (item.id.toString() === value.value.toString());
                        });

                        if (!attributeValue) {
                            return value.value;
                        }
                        return attributeValue.value;
                    }
                });
            }
        }, this);

        return optionColumns
    },

    getStaticColumns: function () {
        var me = this,
            goodsType = this.productType.get('goodsType'),
            isPhysical = (goodsType === 'Physical'),
            isDigitalCredit = (goodsType === 'DigitalCredit');

        return [{
            text: 'Product Code',
            xtype:"templatecolumn",
            dataIndex: 'productCode',
            width: 200,
            tpl : [
                '<tpl if="values.productCode">',
                '{productCode}',
                '<tpl else>',                
                '<span style="color:#ccc">Auto-generated by system</span>',
                '</tpl>'
            ],
            editor: {
                onEditorShow: function (field,record) {
                    
                    if (record.get('exists') === true) {
                       return false
                    } else {
                        return true
                    }
                },
                selectOnFocus: true,
                showBorder: true,
                xtype: 'textfield',
                msgTarget: "qtip"
            }
        }, {
            text: 'Extra Price',
            dataIndex: 'deltaPrice',
            editor: {
                xtype: 'currencyfield',
                currencyCode: this.product.getCurrencyCode(),
                allowBlank: !isDigitalCredit,
                decimalPrecision: 2,
                showBorder: true,
                selectOnFocus: true,
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false,
                msgTarget: "qtip"
            }
        }, {
            text: 'Extra Cost',
            dataIndex: 'deltaCost',
            hideable: true,
            hidden: true,
            editor: {
                xtype: 'currencyfield',
                currencyCode: this.product.getCurrencyCode(),
                decimalPrecision: 2,
                showBorder: true,
                selectOnFocus: true,
                hideTrigger: true,
                selectOnFocus: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false
            }
        }, {
            text: 'MSRP',
            dataIndex: 'deltaMsrp',
            hideable: true,
            hidden: true,
            editor: {
                xtype: 'currencyfield',
                currencyCode: this.product.getCurrencyCode(),
                decimalPrecision: 2,
                selectOnFocus: true,
                showBorder: true,
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false
            }
        }, {
            text: 'Gift Card/Credit Value',
            dataIndex: 'creditValue',
            hideable: isDigitalCredit,
            hidden: !isDigitalCredit,
            required: !isDigitalCredit,
            width: 185,
            editor: {
                xtype: 'currencyfield',
                currencyCode: this.product.getCurrencyCode(),
                showBorder: true,
                allowBlank: !isDigitalCredit,
                selectOnFocus: true,
                decimalPrecision: 2,
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false,
                msgTarget: "qtip"
            }
        }, {
            text: 'Extra Weight',
            dataIndex: 'deltaWeight',
            hideable: true,
            hidden: isDigitalCredit,
            width: 120,
            editor: {
                xtype: 'numberfield',
                showBorder: true,
                decimalPrecision: 2,
                selectOnFocus: true,
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false
            }
        }, {
            text: 'Fulfillment Types',
            dataIndex: 'fulfillmentTypesSupported',
            hideable: true,
            hidden: true,
            width: 185,
            editor: this.fulfillmentEditor

        }, {
            text: 'Mfg Part #',
            dataIndex: 'mfgPartNumber',
            hideable: true,
            hidden: true,
            editor: {
                xtype: 'textfield',
                maxLength: 30,
                selectOnFocus: true,
                showBorder: true,
                enforceMaxLength: true
            }
        }, {
            text: 'UPC',
            dataIndex: 'upc',
            hideable: true,
            hidden: true,
            editor: {
                xtype: 'textfield',
                maxLength: 128,
                selectOnFocus: true,
                showBorder: true,
                enforceMaxLength: true
            }
        }, {
            text: 'Dist Part #',
            dataIndex: 'distPartNumber',
            hideable: true,
            hidden: true,
            editor: {
                xtype: 'textfield',
                maxLength: 30,
                selectOnFocus: true,
                showBorder: true,
                enforceMaxLength: true
            }
        }];
    },

    

    doSave: function () {
        var me = this;
        // update the cache;
        //me.cacheModifiedRecords();

        // upadate the product.options store with the current version;
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
    //getOptions : function (){
    //    var me = this,
    //        optionsStore = me.product.getOptions(),
    //        optionsData = [];

    //    optionsStore.each(function (option) {
    //        optionsData.push({
    //            data: Ext.clone(option.data)
    //        });
    //    });

    //    return optionsData;
    //},

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

        //Ext.Array.each(optionsData, function (option) {
        //    params.options.push({
        //        attributeFQN: option.data.attributeFQN,
        //        values: option.data.values
        //    });
        //});

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
        //me.cacheModifiedRecords();
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

    // reapplies the cached modified records after a store load has happend;
    applyModifiedRecords: function (store) {
        var me = this;

        store = store || this.store;

        me.modifiedRecords.each(function (item) {
            var record = store.getById(item.key)
            // check to see if the record still exists in the data set; could have been removed due to option change or beccause of page change;
            if (record) {
                record.set(item);
            }
        })
    },

    getVariationStore: function (autoLoad) {
        var me = this,            
            autoLoad = (autoLoad !== false);

        if (me.productVariationStore) {
            return me.productVariationStore;
        }
        
        me.productVariationStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.ProductVariation',
            autoLoad: false,
            pageSize: 50
        });

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

        /*
        me.mon(me.productVariationStore, 'beforeload', function (store) {           
            // need to cache any modifications before reloading the store data;
            
            me.cacheModifiedRecords();
        },me)
        */
        me.mon(me.productVariationStore, 'load', function (store, records,successful) {
            // need to recover any cached modifications and apply them if they are present in the store.;
            me.applyModifiedRecords();
        }, me)

        //params = {};

        return this.productVariationStore;
    },

    enableAll: function () {
        Ext.suspendLayouts();
        this.store.each(function (record) {
            record.set("isActive", true)
        })

        Ext.resumeLayouts(true);
    },

    disableAll: function () {
        Ext.suspendLayouts();
        this.store.each(function (record) {
            record.set("isActive", false)
        })
        Ext.resumeLayouts(true);
    },

    onRowEdit: function (editor, e) {
        
    },

    onRowCancelEdit: function (e) {

    },

    findAttribute: function (attributeFQN) {
        return this.productType.getOptions().findRecord('attributeFQN', attributeFQN, 0, false, false, true);
    },

    findAttributeName: function (attributeFQN) {        
        var attribute = this.productType.getOptions().findRecord('attributeFQN', attributeFQN, 0, false, false, true);        
        var name = attribute.get("attributeName");
        return name
    },

    addSaveTasks: function (tasks, updateRecord, saveRecord) {


        this.callParent(arguments);
        var storeTask = tasks.tasks.findBy(function (innerTask) {
            return innerTask.store == this.store;
        }, this);

        storetask.dependencyFilter(function (innerTask) {
            return innerTask.saveRecord == this.product;
        }, this)
        return tasks;
    }
});
/**
 * @class Taco.view.location.inventory.Index
 */
Ext.define('Taco.view.location.inventory.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
  
    requires: [
        'Taco.shared.view.field.ProductPickerField',
        'Taco.shared.view.field.LocationPickerField',
        'Taco.model.LocationInventory',
        'Taco.store.LocationInventories'
    ],

    // used by create button
    typeName: 'Location Inventory',




    contextConfig: {
        supportedLevels: ['m','c'],
        requiresContextOfType: ['m', 's', 'c']
    },
    
    gridHeaderLabel: 'Inventory',
    
    // turn on the row editing feature for inline grid editing and inline grid creation.  typically used for simple entities with several fields.
    enableRowEditing: true,
    
    // optional prevalidation check for row create
    beforeRowCreate: function (editor, store) {
        var filters = store.filters,
            locationCode = null,
            locationFilter = store.extraFilters.getByKey("locationCode");
        
        if (!locationFilter) {
            Taco.app.fireEvent('setmessage', "A location selection is required", 'error');
            return false;
        }
        return true;
    },
    
    modelName: 'Taco.model.LocationInventory',
    
    initComponent : function() {


        this.store = Ext.create('Taco.store.LocationInventories', {
            autoLoad:false
        });

        this.loadSecondToolbar();
        
        this.callParent(arguments);
    },

/*    
    store: {
        type: 'Taco.store.LocationInventories',
        createOnly: true,
        autoLoad:false
    },
    
    */

    useTilePanel: false,
    
    loadSecondToolbar: function () {
        var me = this;

        this.locationPicker = Ext.widget("taco-locationpickerfield", {
            emptyText: "Choose a location",
            flex: null,
            width: 300,
            forceSelection: true,
            editable: false,
            extraFilters: [{ id: "status", property: 'status', value: 'all'}],
            listeners: {
                select: {
                    fn: function (combo, records, eOpts) {
                        var record = records[0],
                            itemBrowser = this.up("itembrowser"),
                            gridPanel = itemBrowser.gridPanel,
                            store = gridPanel.store,
                            code = record.get('code');

                        if (record.get('isDisabled')) {
                            this.fireEvent('locationchange', this, true);
                        } else {
                            this.fireEvent('locationchange', this, false);
                        }

                        // an extra filter to be added to each service call. note this will not be cleared when you clear the filters;
                        // adding a filter with the same id will be treated like an update
                        store.extraFilters.add({ id: "locationCode", property: 'locationCode', value: code });
                        store.load();
                    }
                }
            }
        });

        this.mon(this.locationPicker, 'locationchange', me.onLocationChange, me);

        this.secondToolbarItems = [
            {
                xtype: "component",
                html: 'Inventory for: ',
                margin: '0 10 0 0',
                padding: '2 0 0 0'
            },
            this.locationPicker
        ];
    },
    
    filterFormConf: {
        width: 600,
        cls: Taco.baseCSSPrefix + 'combofilter-form orders',
        items: [{
            xtype: 'container',
            justify: false,
            defaults: {
                xtype: 'textfield',
                width: 560
            },
            items: [
            
                {
                    name: 'productName',
                    fieldLabel: 'Product Name',
                    flex:1
                
                },
            
                {
                    name: 'productCode',
                    fieldLabel: 'Product Code',
                    flex: 1
                }

            ]
        }]
    },

    filterProperties: [
        {
            property: 'all',
            text: 'All',
            isDefault: true
        },
        
        {
            property: 'productName',
            text: 'Product Name'
        },
        {
            property: 'productCode',
            // make it startsWith
            comparison: "sw",
            text: 'Product Code'
        }

    ],

    /*
    header: {
        actions:[]
    },
    */
    

    gridPanelConf: {
        
        viewConfig: {
            deferEmptyText: false,            
            emptyText: "No products with inventory at this location."
        },
        selModel: {},
        enableColumnHide: false,
        sortableColumns: false,
        stateful: true,
        stateId: 'statefulLocationInventoriesGrid',
        columns: [
            {
                dataIndex: 'productCode',
                stateId: 'productCode',
                width: 100,
                text: 'Product Code',
                menuDisabled: true,
                
                editor: {
                    // readonly field for display only. Note: the editor is required to allow for the field to be automatically persisted with the save call;
                    xtype: "displayfield",
                    allowBlank: false
                }

            }, {
                dataIndex: 'productName',
                stateId: 'productName',
                flex:1,
                text: 'Product Name',
                
                menuDisabled: true,
                // product selector
                editor: {
                    xtype: "taco-productpickerfield",
                    editableOnCreateOnly: true,
                    msgTarget: "qtip",
                    allowBlank: false,
                    productType: 'inventory',
                    onEditorShow: function (field, editor, context) {
                        // need to add the locationCode to the locationInventory;
                        var store = editor.grid.store,
                            locationFilter = store.extraFilters.getByKey("locationCode"),
                            locationCode;
                        
                        if (!locationFilter) {
                            return false;
                        }
                    
                        locationCode = locationFilter.value;
                        context.record.set("locationCode", locationCode);
                    },
                    listeners: {
                        select: {
                            fn: function (combo, records, eOpts) {                                
                                var record = records[0],
                                    rowEditor = combo.up('roweditor'),
                                    productCodeField = rowEditor.form.findField("productCode"),
                                    grid = combo.up('grid'),
                                    store = grid.store,
                                    productCode = record.get("productCode"),
                                    existingRecord = store.findRecord('productCode', productCode),
                                    // the column to set focus in when opening the editor;
                                    columnHeader = grid.getTopLevelVisibleColumnManager().getHeaderById("stockOnHand");
                            
                                // check to see if a record already exists in the current store data with this product code;
                                // note that this does not check the service for an existing record that is not loaded in the current page of the store;
                                // the service is expected to return an error when persisting a new record with the same productCode;
                                if (existingRecord) {
                                    // cancel the create and select the existing record and start editing it;
                                    combo.collapse();
                                    grid.editingPlugin.cancelEdit();                                    
                                    grid.editingPlugin.startEdit(existingRecord, columnHeader);
                                } else {
                                    productCodeField.setValue(productCode);
                                    combo.setValue(record.get("productName"));
                                }
                            }
                        }
                    }
                }

            }, {
                width: 100,
                text: "Available",
                stateId: 'available',
                menuDisabled: true,
                
                dataIndex: 'stockAvailable'
                
                /*
                ,editor: {
                    emptyText: "Available",
                    msgTarget: "qtip",
                    xtype: "numberfield",
                    hideTrigger: true,
                    mouseWheelEnabled: false,
                    selectOnFocus: true,
                    allowBlank: false
                }
                */
            }, {
                width: 100,
                text: 'On Reserve',
                stateId: 'onReserve',
                menuDisabled: true,
                
                dataIndex: 'stockReserved'
                /*,
                editor: {
                    emptyText: "On Reserve",
                    msgTarget: "qtip",
                    xtype: "numberfield",
                    hideTrigger: true,
                    mouseWheelEnabled: false,
                    selectOnFocus: true,
                    allowBlank: false
                }
                */
            }, {
                dataIndex: 'stockOnHand',
                itemId: "stockOnHand",
                stateId: 'onReserve',
                width: 100,
                menuDisabled: true,
                
                text: 'On Hand',
                editor: {
                    emptyText: "On Hand",
                    msgTarget: "qtip",
                    xtype: "numberfield",
                    hideTrigger: true,
                    defaultValue: 0,
                    mouseWheelEnabled: false,
                    selectOnFocus: true,
                    allowBlank: false
                }
            }, {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                menuDisabled: true,                
                menuItems: [
                    {
                        text: 'Remove Inventory',
                        /*
                        requiredBehaviors: {
                            model: 'Taco.model.LocationInventory',
                            behavior:'destroy'
                        },
                        */
                        //menuColumnHandler: 'destroyMenuColumnHandler',
                        menuColumnHandler: function(item, eventData) {
                            var record = eventData.record,
                                store = eventData.grid.store;
                            
                            Taco.model.LocationInventory.removeInventory({
                                records: [record],
                                store: store
                            });
                        }
                    }, {
                        text: 'Edit Product',
                        /*
                        requiredBehaviors: {
                            model: 'Taco.model.Product',
                            behavior: 'update'
                        },
                        */
                        menuColumnHandler: function(item, eventData) {
                            var record = eventData.record;                            
                            var code = record.get("parentProductCode") || record.get("productCode")
                            Ext.defer(function () {                                
                                Taco.core.StateManager.attemptNavigate('products/edit/' + code);
                            }, 1, this);
                        }
                    }
                ]
            }
        ]
        
    },

    onLocationChange: function (locationPicker, isDisabled) {
        var createBtn = Ext.ComponentQuery.query('button[itemId=createActionButton]');
        if (!createBtn || createBtn.length === 0) {
            return;
        }
        if (isDisabled) {
            createBtn[0].disable();
        } else {
            createBtn[0].enable();
        }
    },

    onRowEditorUpdate : function() {
        this.callParent(arguments);
    }
});

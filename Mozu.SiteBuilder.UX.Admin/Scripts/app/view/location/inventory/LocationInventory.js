/**
 * @class Taco.view.location.inventory.Index
 */
Ext.define('Taco.view.location.inventory.LocationInventory', {
    extend: 'Taco.core.ux.browser.SearchList',
  
    requires: [
        'Taco.shared.view.field.ProductPickerField',
        'Taco.shared.view.field.LocationPickerField',
        'Taco.model.LocationInventory',
        'Taco.store.LocationInventories'
    ],

    // used by create button
    typeName: 'Location Inventory',
    
    contextConfig: {
        supportedLevels: ['m', 'c'],
        requiresContextOfType: ['m', 's', 'c']
    },
    
    gridHeaderLabel: 'Location',
    
    // turn on the row editing feature for inline grid editing and inline grid creation.  typically used for simple entities with several fields.
    enableRowEditing: true,
    
    enableSearch: false,

    sortableColumns:false,
    
    modelName: 'Taco.model.LocationInventory',
    
    store: { type: 'Taco.store.LocationInventories' },
    
    showProductColumns: false,
    showLocationColumns: true,
    
    enableAutoSelect: false,

    stateful: true,
    stateId: 'statefulLocationInventoryGrid',

    secondToolbarItems: [
        {
            xtype:"component",
            html: 'Inventory for: ',
            margin: '0 10 0 0',
            padding: '2 0 0 0'
        }, {
            xtype: "taco-Locationpickerfield",
            emptyText: "Choose a location",
            //width: 300,
            flex: 1,
            minWidth:150,
            listeners: {
                select: {
                    fn: function (combo, records, eOpts) {
                        var record = records[0],
                            gridPanel = this.up('grid'),
                            store = gridPanel.store;

                        store.extraFilters.add([{ id:"locationCode", property: 'locationCode', value: record.get('code') }]);
                    }
                }
            }
        }
    ],
    
   
    
    viewConfig: {
        deferEmptyText:false,
        emptyText: "No products with inventory at this location."
    },
    
    //selModel: {},
    
    initComponent: function () {
        var me = this;
        
        this.initColumnConfig();

        me.callParent(arguments);
        
    },

    initColumnConfig: function () {
        var me = this;
        
        this.columns = [
            {
                width: 100,
                text: "Available",
                stateId: 'stockAvailable',
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
                dataIndex: 'stockReserved',
                stateId: 'stockReserved',
                renderer: function (value) {
                    return value || 0;
                }
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
                width: 100,
                itemId: "stockOnHand",
                stateId: 'stockOnHand',
                text: 'On Hand',
                editor: {
                    emptyText: "On Hand",
                    msgTarget: "qtip",
                    xtype: "numberfield",
                    hideTrigger: true,
                    defaultValue: 0,
                    minValue:0,
                    mouseWheelEnabled: false,
                    selectOnFocus: true,
                    allowBlank: false
                }
            }, {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                menuDisabled: true,
                stateId: 'actionsColumn',
                sortable: false,
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
                        text: 'Edit Location',
                        /*
                        requiredBehaviors: {
                            model: 'Taco.model.Product',
                            behavior: 'update'
                        },
                        */
                        menuColumnHandler: function(item, eventData) {
                            var record = eventData.record;

                            Ext.defer(function() {
                                Taco.core.StateManager.attemptNavigate('locations/edit/' + record.get("locationCode"));
                            }, 1, this);

                        }
                    }
                ]
            }
        ];
        
        //if (me.showProductColumns) {

            this.columns.unshift(
                {
                    dataIndex: 'productCode',
                    width: 100,
                    hidden: !me.showProductColumns,
                    stateId: 'productCode',
                    text: 'Product Code',
                    editor: {
                        // readonly field for display only. Note: the editor is required to allow for the field to be automatically persisted with the save call;
                        xtype: "displayfield",
                        allowBlank: false
                    }
                }, {
                    dataIndex: 'productName',
                    flex: 1,
                    stateId: 'productName',
                    hidden: !me.showProductColumns,
                    text: 'Product Name',
                    // product selector
                    editor: {
                        xtype: "taco-productpickerfield",
                        editableOnCreateOnly: true,
                        productType:'inventory',
                        msgTarget: "qtip",
                        allowBlank: true,
                        onEditorShow: function(field, editor, context) {
                            // need to add the locationCode to the locationInventory;
                            var filters = editor.grid.store.filters,
                                locationCode = null,
                                locationFilter = filters.findBy(function(item, index) {
                                    return (item.property == "locationCode")
                                });

                            if (!locationFilter) {
                                return false;
                            }

                            locationCode = locationFilter.value;
                            context.record.set("locationCode", locationCode);
                        },
                        listeners: {
                            select: {
                                fn: function(combo, records, eOpts) {
                                    var record = records[0],
                                        rowEditor = combo.up('roweditor'),
                                        productCodeField = rowEditor.form.findField("productCode");

                                    productCodeField.setValue(record.get("productCode"));
                                    combo.setValue(record.get("productName"));
                                }
                            }
                        }
                    }
                }
            );
        //}
        
        if (me.showLocationColumns) {
            this.columns.unshift(
                {
                    dataIndex: 'locationCode',
                    width: 150,
                    text: 'location Code',
                    stateId: 'locationCode',
                    editor: {
                        // readonly field for display only. Note: the editor is required to allow for the field to be automatically persisted with the save call;
                        xtype: "displayfield",
                        allowBlank: false
                    }
                }, {
                    dataIndex: 'locationName',                    
                    flex:1,
                    text: 'Location Name',
                    stateId: 'locationName',
                    editor: {
                        xtype: "taco-locationpickerfield",
                        editableOnCreateOnly: false,
                        autoSelectFirstRecord: false,
                        forceSelection: true,
                        editable: false,
                        msgTarget: "qtip",                        
                        allowBlank: false,
                        onEditorShow: function (field, editor, context) {
                            // need to add the locationCode to the locationInventory;
                            
                            var filters = editor.grid.store.filters,
                                locationCode = null,
                                locationFilter = filters.findBy(function (item, index) {
                                    return (item.property == "locationCode")
                                });

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
                                    locationCodeField = rowEditor.form.findField("locationCode");
                                    grid = combo.up('grid'),
                                    store = grid.store,
                                    locationCode = record.get("code"),
                                    existingRecord = store.findRecord('locationCode', locationCode),
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
                                        locationCodeField.setValue(locationCode);
                                        combo.setValue(record.get("name"));
                                    }
                                }
                            }
                        }
                    }
                }
            );
        }
    },
        
        // optional prevalidation check for row create
    beforeRowCreate: function (editor, store) {
        var productCode = store.extraFilters.getByKey("productCode");
        if (!productCode) {
            Taco.app.fireEvent('setmessage', "A product selection is required", 'error');
            return false;
        }
        return true;
    },
     
    onRowEditorUpdate : function() {
        this.callParent(arguments);
    }
});

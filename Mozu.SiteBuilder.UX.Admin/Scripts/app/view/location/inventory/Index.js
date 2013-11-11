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
    
    requiresContextOfType: ['c', 's'],
    
    gridHeaderLabel: 'Inventory',
    
    // turn on the row editing feature for inline grid editing and inline grid creation.  typically used for simple entities with several fields.
    enableRowEditing: true,
    
    // optional prevalidation check for row create
    beforeRowCreate: function (editor, store) {
        var filters = store.filters,
            locationCode = null,
            locationFilter = filters.findBy(function (item, index) {
                return (item.property == "locationCode")
            });
        
        if (!locationFilter) {
            Taco.app.fireEvent('setmessage', "A location selection is required", 'error');
            return false;
        }
        return true;
    },
    
    modelName: 'Taco.model.LocationInventory',
    
    store: {
        type: 'Taco.store.LocationInventories',
        createOnly: true,
        // todo: figure out why the autoLoad Config is being ignored;
        autoLoad:false
    },
    
    useTilePanel: false,
    
    
    secondToolbarItems: [
        {
            xtype:"component",
            html: 'Inventory for: ',
            margin: '0 10 0 0',
            padding: '2 0 0 0'
        }, {
            xtype: "taco-locationpickerfield",
            emptyText: "Choose a location",
            flex:null,
            width: 300,
            listeners: {
                select: {
                    fn: function (combo, records, eOpts) {
                        var record = records[0],
                            itemBrowser = this.up("itembrowser"),
                            gridPanel = itemBrowser.gridPanel,
                            store = gridPanel.store;
                        
                        store.clearFilter(true);
                        store.filter({ property: 'locationCode', value: record.get('code') });
                    }
                }
            }
        }
    ],
    
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
                
                }, {
                    name: 'productCode',
                    fieldLabel: 'Product Code',
                    flex: 1
                }, {
                    name: 'locationName',
                    fieldLabel: 'Location Name',
                    flex: 1
                }, {
                    name: 'locationCode',
                    fieldLabel: 'Location Code',
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
            name: 'productName',
            text: 'Product Name'
        },
        {
            name: 'productCode',
            text: 'Product Code'
        },
        {
            name: 'locationName',
            text: 'location Name'
        },
        {
            name: 'locationCode',
            text: 'Location Code'
        }
    ],

    /*
    header: {
        actions:[]
    },
    */
    

    gridPanelConf: {
        
        viewConfig: {
            deferEmptyText:false,
            emptyText: "No products with inventory at this location."
        },
        selModel: {},
        columns: [{
            dataIndex: 'productCode',
            width: 100,
            text: 'Product Code',
            editor: {
                // readonly field for display only. Note: the editor is required to allow for the field to be automatically persisted with the save call;
                xtype: "displayfield",
                allowBlank: false
            }

        }, {
            dataIndex: 'productName',
            flex:1,
            text: 'Product Name',
            // product selector
            editor: {
                xtype: "taco-productpickerfield",
                editableOnCreateOnly: true,
                msgTarget: "qtip",
                allowBlank: true,
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

        }, {
            width: 100,
            text: "Available",
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
            width: 100,
            text: 'On Hand',
            editor: {
                emptyText: "On Hand",
                msgTarget: "qtip",
                xtype: "numberfield",
                hideTrigger: true,
                defaultValue:0,
                mouseWheelEnabled: false,
                selectOnFocus: true,
                allowBlank: false
            }
        }
        
        /*
        , {
            xtype: 'taco.menucolumn',
            text: 'Actions',
            menuItems: [
                {
                    text: 'Delete',
                    requiredBehaviors: {
                        model: 'Taco.model.Product',
                        behavior:'destroy'
                    },
                    menuColumnHandler: 'destroyMenuColumnHandler'
                }, {
                    text: 'Edit',
                    requiredBehaviors: {
                        model: 'Taco.model.Product',
                        behavior: 'update'
                    },
                    menuColumnHandler: function (item, eventData) {
                        var page = eventData.grid.getParentPage(),
                            record = eventData.record,
                            metaData = { id: record.getId() };

                        page.launchEditor(record, metaData);
                   
                    }
                }]
            }
            */
        
        ]
        
    },
    
    onRowEditorUpdate : function() {
        this.callParent(arguments);
    }
});

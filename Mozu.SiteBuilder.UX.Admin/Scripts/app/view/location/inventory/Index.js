/**
 * @class Taco.view.location.inventory.Index
 */
//uuguy
Ext.define('Taco.view.location.inventory.Index', {
    extend: 'Taco.core.ux.browser.SearchListPageless',

    requires: [
        'Taco.shared.view.field.ProductPickerField',
        'Taco.shared.view.field.LocationPickerField',
        'Taco.model.LocationInventory',
        'Taco.store.LocationInventories',
        'Taco.view.location.inventory.InventoryStockColumns',
        'Taco.store.Locations',
        'Taco.view.location.inventory.AdvancedSearchForm'
    ],

    cls: 'taco-locationiventory',

    // used by create button
    typeName: 'Location Inventory',
    enableSearchBarInHeader: true,
    createButtonEnabled: true,
    createButtonText: 'Create New Location Inventory',
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    contextConfig: {
        supportedLevels: ['m', 'c'],
        requiresContextOfType: ['m', 's', 'c']
    },
    addContentViewPadding: true,
    enableAutoSelect: false,
    enableNavHeader: true,
    title: 'Inventory',
    gridHeaderLabel: 'Inventory',

    // turn on the row editing feature for inline grid editing and inline grid creation.  typically used for simple entities with several fields.
    enableRowEditing: true,
    enableSearch: false,

    advancedSearchConfig: {
        defaultFieldName: 'productCodeFilter',
        disableAdvancedSearch: false,
        advancedFormCls: 'Taco.view.location.inventory.AdvancedSearchForm',
        emptySearchText: 'Product Code'
    },

    stateful: true,
    stateId: 'statefulInventoryGrid',

    // optional prevalidation check for row create
    beforeRowCreate: function (editor, store) {
        var locationCode = null,
            locationFilter = store.extraFilters.getByKey("locationCode");

        if (!locationFilter) {
            Taco.app.fireEvent('setmessage', "A location selection is required", 'error');
            return false;
        }
        return true;
    },

    modelName: 'Taco.model.LocationInventory',

    initComponent: function () {
        var me = this;
        this.store = Ext.create('Taco.store.LocationInventories', {
            autoLoad: false
        });

        this.initGridPanelConf();

        this.locationCombo = Ext.widget({
            xtype: 'taco-locationpickerfield',
            itemId: 'inventory-dropdown',
            forceSelection: true,
            labelWidth: 95,
            minWidth: 300,
            listeners: {
                select: function (combo, records, eOpts) {
                    var selectedRecord = records[0];
                    if (selectedRecord && selectedRecord.internalId) {
                        me.onIventoryChange(combo, selectedRecord.internalId);
                    }
                },
                scope: this
            },
            listConfig: {
                cls: "location-picker-menu",
                maxWidth: "400",
                minWidth: "300",
                // Custom rendering template for each item
                getInnerTpl: function () {
                    return "<span class='name'>{name}</span>";
                },

                // this is an override that hides the paging toolbar when the list only contains a single page of results;
                refresh: function () {
                    var me = this,
                        toolbar = me.pagingToolbar;

                    Ext.view.View.prototype.refresh.call(me);
                    if (me.rendered && toolbar && toolbar.rendered && !me.preserveScrollOnRefresh) {
                        me.el.appendChild(toolbar.el);
                        if (me.getStore().getTotalCount() <= me.pageSize) me.el.last().hide();
                        else me.el.last().show();
                    }
                }
            }
        })

        this.secondToolbarItems = [
            {
                xtype: 'panel',
                layout: 'hbox',
                padding: '0 0 10 0',
                items: [{
                    xtype: 'label',
                    text: 'Inventory for: ',
                    margin: '5 10 0 0'
                }, {
                    xtype: 'panel',
                    cls: '',
                    items: [
                        this.locationCombo
                    ]
                }
                ]
            }
        ];

        this.moreButtonCfg = {
            itemId: 'moreButton',
            menu: {
                cls: 'taco-ellipsis-split-button',
                items: [
                    {
                        //cls: 'call-to-action override',
                        text: 'Adjustment Mode'
                    },
                    {
                        xtype: 'menucheckitem',
                        text: 'Add',
                        itemId: 'adjustmentModeAdd',
                        group: 'adjustmentMode',
                        checked: true
                    },
                    {
                        xtype: 'menucheckitem',
                        text: 'Set',
                        itemId: 'adjustmentModeSet',
                        group: 'adjustmentMode'
                    }
                ]
            }
        };

        this.callParent(arguments);
    },

    onIventoryChange: function (cmp, code) {
        var record = cmp.store.findRecord('code', code, 0, false, false, true);
        if (record) {
            if (record && record.get('isDisabled')) {
                this.fireEvent('locationchange', this, true);
            } else if (record) {
                this.fireEvent('locationchange', this, false);
            }

            // an extra filter to be added to each service call. note this will not be cleared when you clear the filters;
            // adding a filter with the same id will be treated like an update
            this.store.extraFilters.add({ id: "locationCode", property: 'locationCode', value: record.get('code') });

            if (this.store.currentPage) {
                this.store.currentPage = 1;
            }

            this.store.load({
                callback: function (records, operation, success) {
                    params: { start: 0; page:1 };
                    if (!success)
                        Taco.app.fireEvent('setmessage', 'Error occurred while fetching inventory', 'error');
                }
            });
        }
    },

    insertMenu: function (id, records, handler) {
        var me = this;
        var dropdown = me.down('#' + id);
        var menuItems = Ext.Array.map(records, function (rec) {
            return {
                xtype: 'menuitem',
                text: rec.get('name'),
                handler: handler.bind(me, rec)
            };
        });

        dropdown.menu.add(menuItems);

    },

    useTilePanel: false,

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
                    flex: 1

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

    initGridPanelConf: function () {
        var me = this;
        var gridColumns = [];
        if (Taco.tenantSettings.catalogDisabled == true) {
            gridColumns = [
                {
                    dataIndex: 'productCode',
                    stateId: 'productCode',
                    flex: 0.7,
                    text: 'Product Code',
                    menuDisabled: true,
                    //width: 100,
                    cls: 'inventorygridheader',
                    sortable: false,
                    hideable: false,
                    editor: {
                        // readonly field for display only. Note: the editor is required to allow for the field to be automatically persisted with the save call;
                        xtype: "taco-productpickerfield",
                        allowBlank: false,
                        editableOnCreateOnly: true,
                        msgTarget: "qtip",
                        productType: 'inventory',
                        onEditorShow: function (field, editor, context) {
                            // need to add the locationCode to the locationInventory;
                            var store = editor.grid.store,
                                locationFilter = store.extraFilters.getByKey("locationCode");

                            if (!locationFilter) {
                                return false;
                            }
                            //this.maxWidth = field.column.getWidth();
                            me.freezeColumns(editor.grid, true);

                            var locationCode = locationFilter.value;
                            context.record.set("locationCode", locationCode);
                        },
                        listeners: {
                            select: {
                                fn: function (combo, records) {
                                    var record = records[0],
                                        rowEditor = combo.up('roweditor'),
                                        productCodeField = rowEditor.form.findField("productCode"),
                                        grid = combo.up('grid'),
                                        store = grid.store,
                                        productCode = record.get("productCode"),
                                        existingRecord = store.findRecord('productCode', productCode);
                                    var columnHeader = grid.getTopLevelVisibleColumnManager().getHeaderById("stockOnHand");

                                    if (existingRecord) {
                                        combo.collapse();
                                        grid.editingPlugin.cancelEdit();
                                        grid.editingPlugin.startEdit(existingRecord, columnHeader);
                                    } else {
                                        productCodeField.setValue(productCode);
                                        combo.setValue(record.get("productCode"));
                                    }
                                }
                            }
                        }
                    }

                }
            ];
        }
        else {
            gridColumns = [
                {
                    dataIndex: 'productCode',
                    stateId: 'productCode',
                    width: 150,
                    text: 'Product Code',
                    menuDisabled: true,
                    sortable: false,
                    hideable: false,
                    flex: 0.7,
                    editor: {
                        // readonly field for display only. Note: the editor is required to allow for the field to be automatically persisted with the save call;
                        xtype: "displayfield",
                        allowBlank: false
                    }

                }, {
                    dataIndex: 'productName',
                    stateId: 'productName',
                    flex: 1,
                    text: 'Product Name',
                    sortable: false,
                    menuDisabled: true,
                    hideable: false,
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
                            //tfs #54780
                            this.maxWidth = field.column.getWidth();
                            me.freezeColumns(editor.grid, true);

                            locationCode = locationFilter.value;
                            context.record.set("locationCode", locationCode);
                        },
                        listeners: {
                            select: {
                                fn: function (combo, records) {
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

                }
            ];

        }

        gridColumns = gridColumns.concat(Taco.view.location.inventory.InventoryStockColumns.getInventoryStockColumns('productCode'));

        gridColumns.push({
            xtype: 'taco.menucolumn',
            //menuDisabled: Taco.tenantSettings.catalogDisabled == true ? false : true,
            menuItems: [
                {
                    text: 'Remove Inventory',
                    /*
                requiredBehaviors: {
                    model: 'Taco.model.LocationInventory',
                    behavior:'destroy'
                },
                */
                    menuColumnHandler: function (item, eventData) {
                        var record = eventData.record,
                            store = eventData.grid.store;

                        Taco.model.LocationInventory.removeInventory({
                            records: [record],
                            store: store
                        });
                    }
                }, {
                    text: 'Edit Base Product',
                    /*
                requiredBehaviors: {
                    model: 'Taco.model.Product',
                    behavior: 'update'
                },
                */
                    menuColumnHandler: function (item, eventData) {
                        var record = eventData.record;
                        var code = record.get("baseProductCode") || record.get("productCode");
                        Ext.defer(function () {
                            Taco.core.StateManager.attemptNavigate('products/edit/' + code);
                        }, 1, this);
                    }
                }
            ]
        });

        // this.gridPanelConf = {
        //     viewConfig: {
        //         deferEmptyText: false,
        //         emptyText: "No products with inventory at this location."
        //     },
        //     selModel: {},
        //     enableColumnHide: false,
        //     sortableColumns: false,
        //     //stateful: true,
        //     //stateId: 'statefulLocationInventoriesGrid',
        //     columns: gridColumns
        // };

        this.columns = gridColumns;

        this.viewConfig = {
            deferEmptyText: false,
            emptyText: "No products with inventory at this location."
        };

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

    freezeColumns: function (grid, isFrozen) {
        Ext.Array.each(grid.columns, function (col) {
            col.resizable = !isFrozen;
            col.draggable = !isFrozen;
        });
    },

    onRowEditorUpdate: function (editor, context) {
        var locInvRecord = context.record,
            adjustmentTypeAdd = this.navHeader && this.navHeader.down('#adjustmentModeAdd') ? this.navHeader.down('#adjustmentModeAdd') : null,
            adjustmentType = adjustmentTypeAdd && adjustmentTypeAdd.checked ? 'Delta' : 'Absolute';

        locInvRecord.set('adjustmentType', adjustmentType);

        if (adjustmentType === 'Delta') {
            Taco.view.location.inventory.InventoryStockColumns.removeDeltaListener(editor);
        }
        this.freezeColumns(editor.grid, false);
        this.callParent(arguments);
    },

    onRowEditorCancel: function (editor, context) {
        this.freezeColumns(editor.grid, false);
        this.callParent(arguments);
    },

    doCreate: function () {
        this.onRowEditorCreate();
    }
});

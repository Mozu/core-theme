/**
 * @class Taco.view.productType.Grid
*/
Ext.define('Taco.view.productType.Grid', {
    extend: 'Taco.core.ux.browser.SearchList',
    requires: [
        'Taco.model.ProductType',
        'Taco.store.ProductTypesGrid',
        'Taco.view.productType.AdvancedSearchForm',
        'Ext.form.Panel',
        'Taco.view.productType.Edit',
        'Taco.core.ux.FilterableDataView',
        'Taco.core.ux.grid.MenuColumn'
    ],

    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['m', 's', 'c']
    },
    
    launchEditorOnClick:true,
    
    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.ProductType',

    enableNavHeader: true,

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,
    enableSearch: true,
    enablePaging: true,
    enableRowEditing: false,
    enableAutoSelect: true,
    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    createButtonText: "Create New Product Type",

    showActionsColumn: true,

    hideSearchToolbar: false,
    
    title: "Product Types",

    store: { type: 'Taco.store.ProductTypesGrid' },  

    autoScroll: true,

    enableQuickFilters:false,

    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.productType.AdvancedSearchForm',
        quickFilterData: []
    },

    onCreate: Ext.emptyFn,

    stateful: true,
    stateId: 'statefulProductTypeGrid',

    statics: {
        
    },
        
    initComponent: function () {
        var me = this;

        this.columns = this.getColumnConfig();
        
        me.callParent(arguments);
    },
    
    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this,
            columns = [
                {
                    dataIndex: 'id',
                    stateId: "id",
                    text: 'ID',
                    width: 100
                }, {
                    dataIndex: 'name',
                    stateId: "name",
                    text: 'Name',
                    flex: 1,
                    minWidth: 120
                }, {
                    dataIndex: 'numberOfProducts',
                    sortable: false,
                    stateId: "numberOfProducts",
                    text: 'No. of Products',
                    width: 120
                }, {
                    xtype: 'templatecolumn',
                    stateId: "attributes",
                    text: 'Attributes',
                    width: 240,
                    sortable: false,
                    allowNavigation: true,
                    tpl: new Ext.XTemplate(
                        '<tpl if="this.hasAttributes(options)"><div>',
                        '<span class="label">Options: </span>',
                        '<span>{[Ext.Array.pluck(values.options, "adminName").join(",")]}</span>',
                        '</div></tpl>',
                        '<tpl if="this.hasAttributes(extras)"><div>',
                        '<span class="label">Extras: </span>',
                        '<span>{[Ext.Array.pluck(values.extras, "adminName").join(",")]}</span>',
                        '</div></tpl>',
                        '<tpl if="this.hasAttributes(properties)"><div>',
                        '<span class="label">Properties: </span>',
                        '<span>{[Ext.Array.pluck(values.properties, "adminName").join(", ")]}</span>',
                        '</div></tpl>',
                        {
                            hasAttributes: function(attributeType) {
                                return !Ext.isEmpty(attributeType);
                            }
                        }
                    )
                }, {
                    dataIndex: 'modifiedDate',
                    sortable: false,
                    stateId: "modifiedDate",
                    text: 'Modified Date',
                    width: 120,
                    renderer: function(value) {
                        return !Ext.isEmpty(value) ? Ext.Date.format(value, 'm/d/y') : '--';
                    }
                }, {
                    xtype: 'taco.menucolumn',
                    text: 'Actions',
                    onMenuShow : function(menu, eventData) {
                        // need to disable the delete menu option when the record is the base product type.
                        var deleteMenuItem = menu.down("#deleteMenuItem");
                        if (eventData.record.data.isBase) {
                            deleteMenuItem.hide();
                        } else {
                            deleteMenuItem.show();
                        }
                    },
                    menuItems: [
                        {
                            text: 'Edit',
                            requiredBehaviors: {
                                model: 'Taco.model.Category',
                                behavior: 'update'
                            },
                            menuColumnHandler: function (item, eventData) {
                                var record = eventData.record;
                                me.launchEditor(record);
                            }
                        }, {
                            text: 'Delete',
                            itemId: "deleteMenuItem",
                            // deleteMenuColumnHandler can be found in Taco.core.ux.mixins.DeleteFromGrid
                            menuColumnHandler:"deleteMenuColumnHandler",
                            scope:me
                        },
                        {
                            text: 'Duplicate',
                            requiredBehaviors: {
                                model: 'Taco.model.ProductType',
                                behavior: 'create'
                            },
                            menuColumnHandler: function (item, eventData) {
                                var record = eventData.record,
                                    metaData = {
                                        id: record.getId()
                                    };

                                Taco.app.StateManager.attemptNavigate('producttypes/duplicate/' + record.getId(), metaData);
                            }
                        }
                    ]
                }
            ];
        
        
        

        return columns;
    },

    onItemClick: function (view, record, elm, index, e) {
        // console.log(e.target);
        if (e.target.className === 'taco-launch-editor') {
            e.preventDefault();
            this.launchEditor(record);
            Taco.app.StateManager.addState('producttypes/edit/' + record.getId(), { id: record.getId() });
        }
    },

    doCreate : function () {
        var controller = "producttypes";
        Taco.app.StateManager.attemptNavigate(controller + '/create');
    },

    launchEditor: function (record) {
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate('producttypes/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
        return;
    }

});
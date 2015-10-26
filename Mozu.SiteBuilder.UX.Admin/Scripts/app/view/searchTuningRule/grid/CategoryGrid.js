/**
 * @class Taco.view.searchTuningRule.grid.categoryGrid
*/

Ext.define('Taco.view.searchTuningRule.grid.CategoryGrid', {
    extend: 'Taco.core.ux.grid.Panel',
    requires: [
        'Ext.ux.data.PagingMemoryProxy',
        'Taco.model.SearchTuningRule',
        'Taco.core.ux.grid.plugins.AutoSelect',
        'Taco.model.Category',
        'Taco.store.Categories'

    ],

    minHeight: 240,
    
    launchEditorOnClick:false,

    enableNavHeader: true,

    addContentViewPadding: false,

    multiSelect: true,

    enableSearch: false,
    enablePaging: true,
    enableRowEditing: true,
    defaultRowEditingData: {},
    enableAutoSelect: false,
    createButtonEnabled: false,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    showActionsColumn: true,

    hideSearchToolbar: true,
    
    title: false,

    pageSize: 5,

    autoScroll: true,

    enableQuickFilters: false,

    advancedSearchConfig : {
        disableAdvancedSearch: true
    },

    disableAdvancedSearch: true,

    onCreate: Ext.emptyFn,

    stateful: false,

    mixins: {
        deleteFromGrid: 'Taco.core.ux.mixins.DeleteFromGrid',
        pageable: 'Taco.core.ux.mixins.Pageable',
        searchable: 'Taco.core.ux.mixins.Searchable',
        gridcontextmenu: 'Taco.core.ux.mixins.GridContextMenu'
    },

    statics: {
        
    },
        
    initComponent: function () {
        var me = this;

        this.columns = Ext.Array.clone(this.getColumnConfig());

        this.store = Ext.create('Taco.store.Categories');

        me.callParent(arguments);

        // this.mixins.gridcontextmenu.constructor.apply(this);

    },

    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this;
        return [
            {
                xtype: 'gridcolumn',
                dataIndex: 'name',
                text: 'Name',
                hideable: false,
                flex: 1,
                minWidth: 100,
                editor: {},
                sortable: false
            }, 
            {
                xtype: 'gridcolumn',
                dataIndex: 'categoryType',
                text: 'Type',
                hideable: false,
                minWidth: 100,
                sortable: false
            },
            {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                menuItems: [
                    {
                        text: 'Delete',
                        itemId: 'deleteMenuItem',
                        menuColumnHandler: 'deleteMenuColumnHandler',
                        scope: me
                    }
                ]
            }
        ];
    }
    
});
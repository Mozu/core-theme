/**
 * @class Taco.view.productRanking.grid.categoryGrid
*/

Ext.define('Taco.view.productRanking.grid.Category', {
    extend: 'Taco.core.ux.grid.Panel',
    requires: [
        'Ext.ux.data.PagingMemoryProxy',
        'Taco.model.ProductRanking',
        'Taco.core.ux.grid.plugins.AutoSelect',
        'Taco.model.Category',
        'Taco.store.Categories'

    ],

    minHeight: 225,
    
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

    autoScroll: false,

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


        if (!this.catStore) {
            console.warn('A Category is expected to be passed into this component!');
        }

        if (!this.filterProperty) {
             console.warn('A filterProperty is expected to be passed into this component!');
        }

        //the property for which the grid will add/update the store
        this.filterProperty = this.filterProperty || 'categoryCode';

        this.columns = Ext.Array.clone(this.getColumnConfig());

        this.store = this.getStore();

        if (this.enablePaging) {
            // initialize the grid paging toolbar mixin
            this.mixins.pageable.constructor.apply(this);
        }

        this.loadPreviousRecords();

        this.callParent(arguments);

        
        this.mixins.gridcontextmenu.constructor.apply(this);

    },

    listeners: {

        recordadded: function(records) {

            var me = this,
                findFunc = function(rec) {
                    return me.store.find(me.filterProperty, rec.get(me.filterProperty)) === -1;
                }, 
                recordsToAdd =[];

            if (!records) {
                console.warn('No record found!');
                return false;
            }

            if (Ext.isArray(records)) {
                Ext.Array.each(records, function(rec) {
                    if (findFunc(rec)) {
                        recordsToAdd.push(rec);
                    }
                });
            }

            else { 
                if (findFunc(records)) {
                    recordsToAdd.push(records);
                }
            }

            this.store.add(recordsToAdd);
        }

    },

    loadPreviousRecords: function() {
        var me = this,
            filters = this.record.get('filters'),
            filterIds;


        // once the passed in category store loads, if we have categoryFilters
        // we will load the store with those records

        if (this.record && filters && filters.length > 0 && this.catStore) {

            filterIds = filters.map(function(rec) { return rec.value; });

            this.catStore.on('load', function(store) {
            
                store.each(function(rec) {
                    if (rec.get(me.filterProperty) && filterIds.indexOf(rec.get(me.filterProperty)) != -1)  {
                        me.store.add(rec);
                    }
                });
            });
        }
    },

    doDelete: function(record) {
        this.store.remove(record);
    },

    getStore: function () {
        return Ext.create('Ext.data.Store', {
            fields:  ['nameAndCode', 'type'],
            data: []
        });
    },

    getValues: function () {
        return this.store.data.items;
    },

    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this;
        return [
            {
                xtype: 'gridcolumn',
                dataIndex: 'nameAndCode',
                text: 'Name',
                hideable: false,
                flex: 3,
                minWidth: 100,
                editor: {},
                sortable: false
            }, 
            {
                xtype: 'gridcolumn',
                dataIndex: 'categoryType',
                text: 'Type',
                hideable: false,
                flex:1,
                minWidth: 150,
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
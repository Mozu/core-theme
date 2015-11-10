/**
 * @class Taco.view.productRanking.grid.categoryGrid
*/

Ext.define('Taco.view.productRanking.grid.Category', {
    extend: 'Taco.core.ux.grid.Panel',
    requires: [
        //'Taco.core.ux.store.PagingMemoryStore',
        //'Ext.ux.data.PagingMemoryProxy',
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
        var me = this;

        me.store = me.getNewStore([]);
        
        if (!this.catStore) {
            console.warn('A Category is expected to be passed into this component!');
        }

        if (!this.filterProperty) {
             console.warn('A filterProperty is expected to be passed into this component!');
        }

        //the property for which the grid will add/update the store
        this.filterProperty = this.filterProperty || 'categoryCode';

        this.columns = Ext.Array.clone(this.getColumnConfig());

        this.loadPreviousRecords();



        if (me.enablePaging) {
            // initialize the grid paging toolbar mixin
        //    this.mixins.pageable.constructor.apply(this);
        }


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
            
            this.getStore().add(recordsToAdd);
        }

    },

    loadPreviousRecords: function() {
        var me = this,
            records = [],
            filters = this.record.get('filters'),
            newStore,
            filterIds;


        // once the passed in category store loads, if we have categoryFilters
        // we will load the store with those records

        if (this.record && filters && filters.length > 0 && this.catStore) {

            filterIds = filters.map(function(rec) { return rec.value; });

            this.catStore.on('load', function(store) {

                store.each(function(rec) {
                    if (rec.get(me.filterProperty) && filterIds.indexOf(rec.get(me.filterProperty)) != -1)  {
                        records.push(rec);
                    }
                });

                //newStore = me.getNewStore(records);
                
                me.store.loadData(records);

                //me.gridPager = Ext.create('Ext.toolbar.Paging', {
                //    componentCls: 'x-grid-paging-toolbar',
                //    store: newStore,
                //    displayInfo: true,
                //    dock: 'bottom',
                //    inputItemWidth: 45,
                //    border: '0 1 1'
                //});

                //me.addDocked(me.gridPager);

                me.reconfigure(me.store);
            });
        } 
    },

    removeAll: function () {
        var me = this;
        me.store.removeAll();
        me.store.loadPage(1);
    },

    doDelete: function (records) {
        var me = this;
        
        Ext.Array.each(records, function (rec) {
            me.store.remove(rec);
        });

        this.getView().refresh();
        this.onDeleteSuccess();
        this.record.setDirty();

    },

    onDeleteSuccess: function () {
        
    },

    getNewStore: function (data) {
        //return Ext.create('Taco.core.ux.store.PagingMemoryStore', {
        return Ext.create('Ext.data.Store', {            
            fields:  ['nameAndCode', 'type'],
            data: data,
            //pageSize: this.pageSize,
            autoLoad: false
        });
    },

    getValues: function () {
        return this.store.data.items
        //var allData = this.store.getValues();
        //return allData.items;
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
                        text: 'Remove',
                        itemId: 'removeMenuItem',
                        menuColumnHandler: 'deleteMenuColumnHandler',
                        scope: me
                    },
                    {
                        text: 'Remove All',
                        itemId: 'removeAllMenuItems',
                        menuColumnHandler: function() {
                            me.removeAll()
                        },
                        scope: me
                    }
                ]
            }
        ];
    }
    
});
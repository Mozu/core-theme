/**
 * @class Taco.view.searchTuningRule.Keyword
*/
Ext.define('Taco.view.searchTuningRule.grid.Keyword', {
    extend: 'Taco.core.ux.grid.Panel',
    requires: [
        'Ext.ux.data.PagingMemoryProxy',
        'Taco.model.SearchTuningRule',
        'Taco.core.ux.grid.plugins.AutoSelect'
    ],

    minHeight: 260,
    useWhiteContainer:true,
    
    launchEditorOnClick:false,

    enableNavHeader: true,

    emptyText:'No Keywords',

    // adds the 'taco-content-navcontainer-padding' class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: false,

    multiSelect: true,

    enableSearch: true,
    enablePaging: true,
    enableRowEditing: false,
    defaultRowEditingData: {
    },
    enableAutoSelect: false,
    createButtonEnabled: false,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    showActionsColumn: true,

    hideSearchToolbar: false,

    title: false,

    pageSize: 5,

    autoScroll: false,

    enableQuickFilters:false,

    confirmDelete: false,

    advancedSearchConfig : {
        disableAdvancedSearch: true
    },

    disableAdvancedSearch: true,

    onCreate: Ext.emptyFn,
    stateful: false,
    record: null,

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

        Ext.define('KeywordModel', {
            extend: 'Ext.data.Model',
            fields: [{
                name: 'keyword',
                type: 'string'
            }]
        });

        this.store = this.getKeywordStore();

        me.dockedItems = me.dockedItems || [];
        me.mixins = me.mixins || [];

        this.columns = Ext.Array.clone(this.getColumnConfig());

        // this plugin will auto select the first record in the grid and manage reselection of the selected item after a store load
        if (this.enableAutoSelect !== false) {
            this.plugins = this.plugins || [];
            this.plugins.push(Ext.create('Taco.core.ux.grid.plugins.AutoSelect'));
        }


        // initialize the delete mixin
        this.mixins.deleteFromGrid.init.apply(this);
        

        // initialize the search toolbar mixin
        //if (me.enableSearch) {
        //    this.mixins.searchable.constructor.apply(this);
        //    me.dockedItems.push(me.createSearchToolbar());
        //}

        if (me.enablePaging) {
            // initialize the grid paging toolbar mixin
            this.mixins.pageable.constructor.apply(this);
        }

        
        me.initQuickAddBar();

        me.callParent(arguments);

        this.mixins.gridcontextmenu.constructor.apply(this);

        me.addDocked(me.quickAddBar, 'top');

    },

    onQuickAdd: function () {
        var me = this,
            field = this.getQuickAddField(),
            value = field.getValue().trim(),
            // split the value on comma and space and turn into an array.
            valueArray = (value) ? value.split(/[ ,]+/) : [];
        // remove any empty strings;
        valueArray = Ext.Array.clean(valueArray);
        //

        if (valueArray.length === 0) {
            return;
        }

        Ext.Array.forEach(valueArray, function(val){
            var exists = me.store.findRecord('keyword', val);
            if (!exists){
                me.store.insert(0, {'keyword':val});
                me.record.setDirty();
            }
        });
    },
    getQuickAddField: function () {
        var me = this;
        if (!me.quickAddField) {
            me.quickAddField = Ext.widget({
                xtype: 'textfield',
                flex: 1,
                margin: '0 10 0 0',
                emptyText: 'Type keywords here and press ENTER or click Add button',
                listeners: {
                    scope: me,
                    specialkey: function (field, e) {
                        if (e.getKey() == e.ENTER) {
                            me.onQuickAdd();
                        }
                    }
                }
            });
        }
        return me.quickAddField;
    },

    initQuickAddBar: function () {
        var me = this;

        me.quickAddButton = Ext.widget({
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            text: 'Add',
            handler: me.onQuickAdd,
            scope: me
        });

        me.quickAddBar = Ext.create('Ext.toolbar.Toolbar', {
            dock: 'top',
            layout: 'hbox',
            cls: 'taco-content-navcontainer-white',
            padding: {
                top: 0,
                left: 0,
                right: 0,
                bottom:5
            },
            items: [
                me.getQuickAddField(),
                me.quickAddButton
            ]
        });

    },
    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this;
        return [
            {
                xtype: 'gridcolumn',
                dataIndex: 'keyword',
                text: 'Keyword',
                hideable: false,
                flex: 3,
                minWidth: 100,
                sortable: true
            }, {
                xtype: 'taco.menucolumn',
                flex: 1,
                text: 'Actions',
                menuItems: [
                    {
                        text: 'Remove',
                        itemId: 'removeMenuItem',
                        // deleteMenuColumnHandler can be found in Taco.core.ux.mixins.DeleteFromGrid
                        menuColumnHandler: 'deleteMenuColumnHandler',
                        //requiredBehaviors: {
                        //    model: 'Taco.model.Discount',
                        //    behavior: 'delete'
                        //},
                        scope: me
                    }, {
                        text: 'Remove All',
                        itemId: 'removeAllMenuItems',
                        menuColumnHandler: function() {
                            me.store.getProxy().data.items = [];
                            me.store.removeAll();
                            me.store.loadPage(1);
                        },
                        scope: me
                    }
                ]
            }
        ];
    },

    onDeleteSuccess: function () {
        this.getView().refresh();
        this.record.setDirty();
    },

    launchEditor: Ext.emptyFn,

    getValues: function() {
        var result = [];
        this.store.each(function(row){
            result.push(row.get('keyword'));
        }, this);
        return result;
    },

    getKeywordStore: function () {
        var me = this;
        return Ext.create('Ext.data.Store', {
            storeId: 'keywordStore',
            autoLoad: true,
            model: 'KeywordModel',
            sorters: ['keyword'],
            fields: ['keyword'],

            //autoLoad: false,
            pageSize: this.pageSize,
            remoteSort: false,
            remoteFilter: false,
            proxy: {
                type: 'memory',
                enablePaging: true,
                sorters: ['keyword'],
                filters: [],
                data: {
                    'items': me.record.get('keywordObjects')
                },
                reader: {
                    type: 'json',
                    root: 'items'
                }
            }
        });
    },

    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy: function (destroy) {

        this.callParent(arguments);
    }
});
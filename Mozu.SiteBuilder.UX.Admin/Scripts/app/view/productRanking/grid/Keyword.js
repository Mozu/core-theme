/**
 * @class Taco.view.productRanking.Keyword
*/
Ext.define('Taco.view.productRanking.grid.Keyword', {
    extend: 'Taco.core.ux.grid.Panel',
    requires: [
        'Ext.data.proxy.Memory',
        'Taco.model.ProductRanking',
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
    enablePaging: false,
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
    filterProperty: 'keyword',

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

        this.store = this.getKeywordStore(this.formatRecords());

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

        if (me.enablePaging) {
            // initialize the grid paging toolbar mixin
            this.mixins.pageable.constructor.apply(this);
        }

        
        me.initQuickAddBar();

        me.callParent(arguments);

        this.mixins.gridcontextmenu.constructor.apply(this);

        me.addDocked(me.quickAddBar, 'top');

    },

    formatRecords: function() {

        Ext.define('KeywordModel', {
            extend: 'Ext.data.Model',
            fields: [{
                name: 'keyword',
                type: 'string'
            }],
            idProperty: 'keyword'
        });

        return Ext.Array.map(this.record.get('keywordObjects'), function(rec) {
            return Ext.create('KeywordModel', rec);
        });
    },

    onQuickAdd: function () {

        var me = this,
            field = this.getQuickAddField(),
            value = field.getValue().trim(),
            valueArray = (value) ? value.split(/[,]+/) : [],
            recordsToAdd =[],

            findExisting = function(val) {
                return me.store.find(me.filterProperty, val, 0, false, false, true) !== -1;
            };

        valueArray = Ext.Array.clean(valueArray);
        if (valueArray.length === 0) {
            return;
        }

        Ext.Array.each(valueArray, function(val) {
            if (!findExisting(val)) {
                recordsToAdd.push(Ext.create('KeywordModel', {'keyword':val}));
            }
        });

        if (recordsToAdd.length === 0) {
            //selectFirstKeywordAdded(valueArray[0]);
            field.reset();
            field.focus(false, 200);
        }
        this.getStore().add(recordsToAdd);
        field.reset();
        field.focus(false, 200);
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
                            me.store.removeAll();
                        },
                        scope: me
                    }
                ]
            }
        ];
    },

    doDelete: function (records) {

        Ext.Array.each(records, function(rec) {
            rec.store.remove(rec);
        });

        this.getView().refresh();
        this.onDeleteSuccess();
        this.record.setDirty();
    },

    onDeleteSuccess: function () {
        this.gridPager.doRefresh();
    },

    launchEditor: Ext.emptyFn,

    getValues: function() {
        return Ext.Array.map(this.store.data.items, function(row) {
            return row.get('keyword');
        }, this);
    },

    getKeywordStore: function (records) {
        return Ext.create('Ext.data.Store', {
            storeId: 'keywordStore',
            autoLoad: false,
            model: 'KeywordModel',
            sorters: ['keyword'],
            fields: ['keyword'],
            data: records,
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json'
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
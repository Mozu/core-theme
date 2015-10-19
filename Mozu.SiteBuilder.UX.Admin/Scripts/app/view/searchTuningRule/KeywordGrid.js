/**
 * @class Taco.view.searchTuningRule.KeywordGrid
*/
Ext.define('Taco.view.searchTuningRule.KeywordGrid', {
    extend: 'Taco.core.ux.grid.Panel',
    requires: [
        'Ext.ux.data.PagingMemoryProxy',
        'Taco.model.SearchTuningRule',
        //'Taco.store.SearchTuningRule',
        'Taco.core.ux.grid.plugins.AutoSelect'
    ],

    minHeight: 240,
    
    launchEditorOnClick:false,
    
    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    //modelName: 'Taco.model.SearchTuningRule',

    //controllerName: 'SearchTuningRule',

    enableNavHeader: true,

    

    emptyText:'No Keywords',

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: false,

    multiSelect: true,

    enableSearch: true,
    enablePaging: true,
    enableRowEditing: true,
    defaultRowEditingData: {
    },
    enableAutoSelect: false,
    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    createButtonText: "Create New Coupon Code",

    showActionsColumn: true,

    hideSearchToolbar: false,
    
    title: "Search Keywords",

    pageSize: 5,

    //store: { type: 'Taco.store.SearchTuningRule' },

    autoScroll: true,

    enableQuickFilters:false,

    deletePromptMsg: "Are you sure you want to delete this keyword?",

    advancedSearchConfig : {
        disableAdvancedSearch: true
    },

    disableAdvancedSearch: true,

    onCreate: Ext.emptyFn,
    stateful: false,
    //stateId: 'statefulCouponCodeGrid',

    mixins: {
        deleteFromGrid: 'Taco.core.ux.mixins.DeleteFromGrid',
        pageable: 'Taco.core.ux.mixins.Pageable',
        searchable: 'Taco.core.ux.mixins.Searchable',
        gridcontextmenu: 'Taco.core.ux.mixins.GridContextMenu'
    },

    statics: {
        
    },

    //updateCouponSetCode: function () {
    //
    //    var me = this,
    //        couponSetCode = this.getCouponSetCode();
    //
    //    me.store.proxy.extraParams.couponSetCode = couponSetCode;
    //},
        
    initComponent: function () {
        var me = this;

        Ext.define('KeywordModel', {
            extend: 'Ext.data.Model',
            fields: [{
                name: 'keyword',
                type: 'string'
            }]
        });

        me.store = Ext.create('Ext.data.Store', {
            storeId: 'keywordStore',
            autoLoad: true,
            model: 'KeywordModel',
            sorters:['keyword'],
            fields: ['keyword'],

            //autoLoad: false,
            pageSize: this.pageSize,
            remoteSort:false,
            remoteFilter:false,
            proxy: {
                type: 'memory', //'memory',
                enablePaging: true,
                sorters: ['keyword'],
                filters: [],
                data: {
                    'items': [
                        {'keyword': 'foo'},
                        {'keyword': 'bar'}
                    ]
                },
                reader: {
                    type: 'json',
                    root: 'items'
                }
            }
        });


        me.dockedItems = me.dockedItems || [];
        me.mixins = me.mixins|| [];
        
        //this.store = Ext.create('Taco.store.SearchTuningRule', {
        //    pageSize: this.pageSize,
        //    autoLoad:(couponSetCode) ? true : false
        //});

        //if (couponSetCode) {
        //    this.store.proxy.extraParams.couponSetCode = couponSetCode;
        //}
        

        //this.defaultRowEditingData = {
        //    couponSetCode: this.getCouponSetCode()
        //};

        this.columns = Ext.Array.clone(this.getColumnConfig());

        // this plugin will auto select the first record in the grid and manage reselection of the selected item after a store load
        if (this.enableAutoSelect !== false) {
            this.plugins = this.plugins || [];
            this.plugins.push(Ext.create('Taco.core.ux.grid.plugins.AutoSelect'));
        }


        // initialize the delete mixin
        this.mixins.deleteFromGrid.init.apply(this);
        

        //if (this.getCouponSetCode()) {
        //
        //
        //    // set the couponSetCode on the store and load the data;
        //}


        // initialize the search toolbar mixin
        if (me.enableSearch) {
            this.mixins.searchable.constructor.apply(this);
            me.dockedItems.push(me.createSearchToolbar());
        }

        if (me.enablePaging) {
            // initialize the grid paging toolbar mixin
            this.mixins.pageable.constructor.apply(this);
        }

        
        me.initQuickAddBar();

        me.callParent(arguments);

        this.mixins.gridcontextmenu.constructor.apply(this);

        me.addDocked(me.quickAddBar,0);

        //me.store.proxy.data = {items: [
        //    {'keyword': 'foo'},
        //    {'keyword': 'bar'}
        //]};
        //me.store.load();

        //this.mon(Taco.app, 'couponsetcreated', function(data) {
        //        this.setCouponSetCode(data.get('couponSetCode'));
        //        this.store.proxy.extraParams.couponSetCode = data.get('couponSetCode');
        //    }, this, true
        //);
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

        if (valueArray.length == 0) {
            return;
        }

        //var jsonData = {
        //    items: valueArray
        //};
        Ext.Array.forEach(valueArray, function(val){
            var exists = me.store.findRecord('keyword', val);
            if (!exists){
                me.store.insert(0, {'keyword':val});
            }
        });


        //var config = {
        //    url: '/admin/app/couponcode/create',
        //    method: 'POST',
        //    jsonData: jsonData,
        //    success: function (response) {
        //
        //        var json = Ext.decode(response.responseText, true);
        //        if (!json || !json.success) {
        //            var msg = (config.errorMsg) ? config.errorMsg : "Error";
        //            Taco.app.fireEvent('setmessage', msg, 'error');
        //            this.setLoading(false);
        //            return;
        //        }
        //
        //        if (json.success) {
        //            //field.setValue();
        //            //me.getSelectionModel().deselectAll();
        //            me.mon(me.store, 'load', function () {
        //                //Taco.app.fireEvent('setgrowl', "Created", null, 2000);
        //                //me.getSelectionModel().selectRange(0, 0);
        //                //field.focus();
        //                field.reset();
        //            }, me, {
        //                single: true
        //            });
        //            me.store.reload();
        //        }
        //
        //        this.setLoading(false);
        //    },
        //    failure: function (response) {
        //        //Taco.app.viewPort.setLoading(false);
        //        var json = Ext.decode(response.responseText, true),
        //            msg = (json && json.message) ? json.message : (config.errorMcallsg) ? config.errorMsg : "Error";
        //        Taco.app.fireEvent('setmessage', msg, 'error');
        //
        //        this.setLoading(false);
        //    },
        //    scope: this
        //};
        //
        //this.setLoading("Loading...");
        //Ext.Ajax.request(config);



    },
    getQuickAddField: function () {
        var me = this;
        if (!me.quickAddField) {
            me.quickAddField = Ext.widget({
                xtype: "textfield",
                flex: 1,
                emptyText: "Type one or more new keywords and hit ENTER key or click Add button",
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
            xtype: "button",
            ui: "action",
            scale: "medium",
            text: "Add",
            handler: me.onQuickAdd,
            scope: me
        });
        me.quickAddBar = Ext.create("Ext.toolbar.Toolbar", {
            dock: "top",
            padding: {
                top: 2,
                left: 0,
                right: 0,
                bottom:10
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
                flex: 1,
                minWidth: 150,
                editor: {
                    // defaults to textfield if no xtype is supplied
                    emptyText: "Enter code",
                    msgTarget: "qtip",
                    // optional enhancement to rowEditor. Makes the field only editable during a create;
                    editableOnCreateOnly: true,
                    selectOnFocus: true,
                    allowBlank: false
                },
                sortable: true
            }, {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                //onMenuShow: function (menu, eventData) {
                //    // need to disable the delete menu option when discount has been used
                //    var deleteMenuItem = menu.down("#deleteMenuItem");
                //    if (eventData.record.get('canBeDeleted')) {
                //        deleteMenuItem.show();
                //    } else {
                //        deleteMenuItem.hide();
                //    }
                //},
                //flex: 1,
                menuItems: [
                    {
                        text: 'Delete',
                        itemId: "deleteMenuItem",
                        // deleteMenuColumnHandler can be found in Taco.core.ux.mixins.DeleteFromGrid
                        menuColumnHandler: "deleteMenuColumnHandler",
                        //requiredBehaviors: {
                        //    model: 'Taco.model.Discount',
                        //    behavior: 'delete'
                        //},
                        scope: me
                    }
                ]
            }
        ];
    },

    onDeleteSuccess: function (data) {
        this.gridPager.doRefresh();
    },

    launchEditor: Ext.emptyFn,
    
    //getDeletePromptMessage: function (record) {
    //    return record.getDeletePromptMessage();
    //},
    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy: function (destroy) {

        this.callParent(arguments);
    }
});
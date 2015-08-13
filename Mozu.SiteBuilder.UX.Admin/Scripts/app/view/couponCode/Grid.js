/**
 * @class Taco.view.couponCode.Grid
*/
Ext.define('Taco.view.couponCode.Grid', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Taco.model.CouponCode',
        'Taco.store.CouponCodes',
        'Taco.view.couponCode.AdvancedSearchForm',
        'Taco.core.ux.grid.plugins.AutoSelect'
    ],


    config: {
        couponSetCode: null
    },

    mixins: {
        deleteFromGrid: 'Taco.core.ux.mixins.DeleteFromGrid',
        pageable: 'Taco.core.ux.mixins.Pageable',
        searchable: 'Taco.core.ux.mixins.Searchable',
        gridcontextmenu: 'Taco.core.ux.mixins.GridContextMenu'
    },

    minHeight: 240,
    
    launchEditorOnClick:false,
    
    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.CouponCode',

    controllerName: 'CouponCode',

    enableNavHeader: true,

    

    emptyText:'None Available',

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
    
    title: "Codes",

    store: { type: 'Taco.store.CouponCodes' },

    autoScroll: true,

    enableQuickFilters:false,

    //deletePromptMsg : "If a coupon code is currently redemed, deleting it could affect pending orders and carts.<br/>Are you sure you want to delete this?",

    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.couponCode.AdvancedSearchForm',
        quickFilterData: []
    },

    onCreate: Ext.emptyFn,
    stateful: false,
    stateId: 'statefulCouponCodeGrid',
    statics: {
        
    },

    
        
    initComponent: function () {
        var me = this;

        me.dockedItems = me.dockedItems || [];
        me.mixins = me.mixins|| [];

        
        this.store = Ext.create('Taco.store.CouponCodes', {
            pageSize:10,
            autoLoad:true
        });

        this.store.proxy.extraParams.couponSetCode = this.getCouponSetCode();

        this.defaultRowEditingData = {
            couponSetCode: this.getCouponSetCode()
        };

        this.columns = Ext.Array.clone(this.getColumnConfig());


        // this plugin will auto select the first record in the grid and manage reselection of the selected item after a store load
        if (this.enableAutoSelect !== false) {
            this.plugins = this.plugins || [];
            this.plugins.push(Ext.create('Taco.core.ux.grid.plugins.AutoSelect'));
        }


        // initialize the delete mixin
        this.mixins.deleteFromGrid.init.apply(this);
        

        if (this.getCouponSetCode()) {

            
            // set the couponSetCode on the store and load the data;
        }


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

        this.mon(Taco.app, 'couponsetcreated', function(data) {
                this.setCouponSetCode(data.get('couponSetCode'));
                this.store.proxy.extraParams.couponSetCode = data.get('couponSetCode');
            }, this, true
        );
    },

    onQuickAdd: function () {
        var me = this,
            field = this.getQuickAddField(),
            value = field.getValue().trim(),
            // split the value on comma and space and turn into an array.
            valueArray = (value) ? value.split(/[ ,]+/) : [];
        // remove any empty strings;
        valueArray = Ext.Array.clean(valueArray);

        if (valueArray.length == 0) {
            return;
        }

        var jsonData = {
            couponSetCode: this.getCouponSetCode(),
            items: valueArray
        };


        var config = {
            url: '/admin/app/couponcode/create',
            method: 'POST',
            jsonData: jsonData,
            success: function (response) {

                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    var msg = (config.errorMsg) ? config.errorMsg : "Error";
                    Taco.app.fireEvent('setmessage', msg, 'error');
                    this.setLoading(false);
                    return;
                }
                
                if (json.success) {
                    //field.setValue();
                    //me.getSelectionModel().deselectAll();
                    me.mon(me.store, 'load', function () {
                        Taco.app.fireEvent('setgrowl', "Created", null, 2000);
                        //me.getSelectionModel().selectRange(0, 0);
                        //field.focus();
                    }, me, {
                        single: true
                    });
                    me.store.reload();
                }

                this.setLoading(false);
            },
            failure: function (response) {
                //Taco.app.viewPort.setLoading(false);
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : (config.errorMcallsg) ? config.errorMsg : "Error";
                Taco.app.fireEvent('setmessage', msg, 'error');
                
                this.setLoading(false);
            },
            scope: this
        };

        this.setLoading("Loading...");
        Ext.Ajax.request(config);



    },
    getQuickAddField: function () {
        var me = this;
        if (!me.quickAddField) {
            me.quickAddField = Ext.widget({
                xtype: "textfield",
                flex: 1,
                emptyText: "Type one or more new codes and hit ENTER key or click Add button",
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
                dataIndex: 'couponCode',
                stateId: 'couponCode',
                text: 'Code',
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
                xtype: 'gridcolumn',
                dataIndex: 'redemptionCount',
                stateId: 'redemptionCount',
                text: 'Redemption Count',
                hideable: false,
                width: 150,
                minWidth: 150,
                sortable: false
            }, {
                dataIndex: 'createDate',
                stateId: 'createDate',
                text: 'Create Date',
                width: 130,
                hidden: true,
                sortable: true,
                getSortParam: function() {
                    return "updatedate";
                },
                xtype: 'datecolumn',
                format: 'n/j/Y g:i a'
            },{
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
    
    doDelete2: function(records) {
        
        
    },

    launchEditor: function (record) {
        
    },


    onItemClick: function (view, record, elm, index, e) {
        
    },

    doEdit : function (item, eventData) {
        
    },

    openEditor: function (record, couponSetType, isNew) {
        
    },

    doCreate : function (cfg) {
        
        if (this.enableRowEditing) {
            this.onRowEditorCreate();
        }
    },

    onRowEditorCreate: function () {
        
        this.callParent(arguments);
    },
    getDeletePromptMessage: function (record) {
        return record.getDeletePromptMessage();
    },
    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy: function (destroy) {

        this.callParent(arguments);
    }
});
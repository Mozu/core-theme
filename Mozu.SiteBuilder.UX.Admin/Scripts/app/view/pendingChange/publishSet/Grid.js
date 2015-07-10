/**
 * @class Taco.view.discount.Grid
*/
Ext.define('Taco.view.pendingChange.publishSet.Grid', {
    extend: 'Taco.core.ux.browser.SearchList',
    alias: 'widget.publishsetlist',

    requires: [
        'Taco.model.PublishSet',
        'Taco.store.PublishSets',
        'Taco.view.pendingChange.publishSet.AdvancedSearchForm',
        'Ext.Date',
        'Taco.core.ux.grid.MenuColumn',
        'Taco.view.pendingChange.publishSet.PublishSetEditModal'
    ],

    mixins: {
        deleteFromGrid: 'Taco.core.ux.mixins.DeleteFromGrid'
    },

    //contextConfig: {
    //    supportedLevels: ['m'],
    //    requiresContextOfType: ['m']
    //},

    launchEditorOnClick: false,

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.PublishSet',

    enableNavHeader: false,

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,

    enableSearch: true,
    enablePaging: true,
    enableRowEditing: false,
    enableAutoSelect: true,
    createButtonEnabled: false,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    createButtonText: "Create New Publish Set",

    showActionsColumn: true,

    hideSearchToolbar: false,
    
    title: "Publish Sets",

    store: { type: 'Taco.store.PublishSetsGrid' },

    autoScroll: true,

    enableQuickFilters:false,

    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.pendingChange.publishSet.AdvancedSearchForm'
    },

    onCreate: Ext.emptyFn,

    stateful: true,
    stateId: 'statefulPublishSetGrid',

    statics: {
        
    },
        
    initComponent: function () {
        var me = this;
        
        this.store = Ext.create('Ext.data.Store', {
            model: 'Taco.model.PublishSet',
            data: [
                { id: '1', code: "publish1", name: 'publish set 1' },
                { id: '2', code: "publish2", name: 'publish set 2' }
            ]
        });
        
        this.columns = this.getColumnConfig();

        // initialize the delete mixin
        this.mixins.deleteFromGrid.init.apply(this);
        
        me.callParent(arguments);
        
        var menuColumns = Ext.Array.filter(this.columns, function (col) { return col.isXType('taco.menucolumn'); });

        // adding context menu to the empty part of the grid;
        this.mon(this.view, 'containercontextmenu', function (cmp, e) {
            var eventData = {
                grid: cmp.ownerCt,
                rowIndex: null,
                header: menuColumns[0],
                e: e,
                record: null,
                item: null
            },
            menu = menuColumns[0].getMenu(eventData);
            e.stopEvent();
            menu.showAt(e.xy);
        }, this);


    },
    
    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this,
            columns = [
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'name',
                    stateId: 'name',
                    text: 'Name',
                    hideable: false,
                    flex: 1,
                    minWidth: 150
                }, {
                    xtype: 'datecolumn',
                    dataIndex: 'publishDate',
                    stateId: 'publishDate',
                    format: 'n/j/Y g:i a',
                    width: 130,
                    text: 'Publish Date'
                }, {
                    xtype: 'taco.menucolumn',
                    text: 'Actions',

                    preProcessMenuItems : function(items, menuColumn, eventData) {
                        
                        Ext.Array.each(items, function(item) {
                            // disable all menu options except create if no record is selected;
                            item.disabled = (!eventData.record && (item.itemId !== "createMenuItem"));
                        });
                        return items;
                    },

                    menuItems: [
                        {
                            text: 'Edit',
                            menuColumnHandler: function(item, eventData) {
                                var record = eventData.record;
                                Ext.defer(function() {
                                    //Taco.core.StateManager.attemptNavigate('discounts/edit/' + record.getId(), { complexMetaData: { record: record } });
                                    me.edit(record);

                                }, 1, this);
                            },
                            scope: me
                        }, {
                            text: 'View In Seperate Tab'
                        }, {
                            text: 'Delete',
                            itemId: "deleteMenuItem",
                            // deleteMenuColumnHandler can be found in Taco.core.ux.mixins.DeleteFromGrid
                            menuColumnHandler: "deleteMenuColumnHandler",
                            scope: me
                        }, {
                            text: 'Publish Now'
                        }, {
                            text: 'Create Publish Set',
                            itemId: "createMenuItem",
                            menuColumnHandler: function(item, eventData) {
                                me.create();
                            },
                            scope: me
                        }

                        //{
                        //    text: 'Edit',
                        //    requiredBehaviors: {
                        //        model: 'Taco.model.Discount',
                        //        behavior: 'update'
                        //    },
                        //    menuColumnHandler: function (item, eventData) {
                        //        var record = eventData.record;
                        //        Ext.defer(function () {
                        //            Taco.core.StateManager.attemptNavigate('discounts/edit/' + record.getId(), { complexMetaData: { record: record } });
                        //        }, 1, this);
                        //    }
                        //},{
                        //    text: 'Duplicate',
                        //    requiredBehaviors: {
                        //        model: 'Taco.model.Discount',
                        //        behavior: 'create'
                        //    },
                        //    menuColumnHandler: function (item, eventData) {
                        //        var record = eventData.record,
                        //            metaData = {
                        //                id: record.getId()
                        //            };

                        //        Taco.app.StateManager.attemptNavigate('discounts/duplicate/' + record.getId(), metaData);
                        //    }
                        //}, {
                        //    text: 'Delete',
                        //    itemId: "deleteMenuItem",
                        //    // deleteMenuColumnHandler can be found in Taco.core.ux.mixins.DeleteFromGrid
                        //    menuColumnHandler: "deleteMenuColumnHandler",
                        //    requiredBehaviors: {
                        //        model: 'Taco.model.Discount',
                        //        behavior: 'delete'
                        //    },
                        //    scope: me
                        //}
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
            Taco.app.StateManager.addState('discounts/edit/' + record.getId(), { id: record.getId() });
        }
    },

    doCreate: function (config) {

        var data = Ext.apply({

        }, config);
       
        Ext.create('Taco.view.pendingChange.publishSet.PublishSetEditModal', data);
    },

    doEdit: function (record) {
        var data = {
            entityId: record.getId()
        };

        Ext.create('Taco.view.pendingChange.publishSet.PublishSetEditModal', data);
    },


    launchEditor: function (record) {
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate('discounts/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
        return;
    },

    getDeletePromptMessage: function (record) {
        return record.getDeletePromptMessage();
    }

});
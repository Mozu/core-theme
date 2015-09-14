/**
 * @class Taco.view.location.Index
 */
Ext.define('Taco.view.location.Index', {
    extend: 'Taco.core.ux.browser.SearchList',
  
    requires: [
        'Taco.store.Locations',
        'Taco.model.Location',
        'Taco.view.location.AdvancedSearchForm',
        'Ext.form.Panel',
        'Taco.core.ux.BaseGrid',
        'Ext.tip.QuickTipManager',
        'Taco.core.ux.TextFilter',
        'Taco.view.location.Edit',
        'Taco.core.ux.FilterableDataView',
        'Taco.core.ux.grid.MenuColumn'
    ],

    //mixins: {
    //    deleteFromGrid: 'Taco.core.ux.mixins.DeleteFromGrid'
    //},

    launchEditorOnClick: true,

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.Location',

    store: { type: 'Taco.store.Locations' },

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

    createButtonText: "Create New Location",

    showActionsColumn: true,

    hideSearchToolbar: false,

    title: "Locations",

    autoScroll: true,
    
    editorName: 'Taco.view.location.Edit',
    
    enableQuickFilters: false,

    advancedSearchConfig: {
        advancedFormCls: 'Taco.view.location.AdvancedSearchForm',

        quickFilterData: []
    },

    onCreate: Ext.emptyFn,

    stateful: true,
    stateId: 'statefulLocationGrid',

    statics: {
        
    },

    initComponent: function () {
        var me = this;

        this.columns = this.getColumnConfig();

        // initialize the delete mixin
        //this.mixins.deleteFromGrid.init.apply(this);
        
        me.callParent(arguments);
    },
    
    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this,
            columns = [
                {
                    dataIndex: 'code',
                    stateId: 'code',
                    sortable: true,
                    width: 150,
                    text: 'Code'

                }, {
                    dataIndex: 'name',
                    stateId: 'name',
                    sortable: true,
                    width: 200,
                    text: 'Name'

                }, {
                    width: 200,
                    text: "Location Types",
                    dataIndex: 'locationTypes',
                    sortable: false,
                    stateId: 'locationTypes',
                    xtype: "templatecolumn",
                    tpl: [
                        '<tpl for="locationTypes">',
                        '<tpl if="xindex &gt; 1">, </tpl>{name}',
                        '</tpl>'
                    ]
                }, {
                    dataIndex: 'addressToString',
                    stateId: 'address',
                    text: 'Address',
                    sortable: false,
                    flex: 1
                }, {
                    dataIndex: 'statusDescription',
                    stateId: 'statusDescription',
                    text: 'Status',
                    sortable: false
                }, {
                    xtype: 'taco.menucolumn',
                    text: 'Actions',
                    onMenuShow: function (menu, eventData) {
                        var disableMenuItem = menu.down("#disableMenuItem"),
                            enableMenuItem = menu.down("#enableMenuItem");
                        // need to disable the delete menu option when discount has been used
                        if (eventData.record.get('isDisabled')) {
                            enableMenuItem.show();
                            disableMenuItem.hide();
                        } else {
                            disableMenuItem.show();
                            enableMenuItem.hide();
                        }
                    },
                    menuItems: [
                        {
                            text: 'Edit',
                            requiredBehaviors: {
                                model: 'Taco.model.Location',
                                behavior: 'update'
                            },
                            menuColumnHandler: function(item, eventData) {
                                var record = eventData.record;
                                Ext.defer(function() {
                                    Taco.core.StateManager.attemptNavigate('locations/edit/' + record.getId(), { complexMetaData: { record: record } });
                                }, 1, this);

                            }
                        }, {
                            text: 'Duplicate',
                            requiredBehaviors: {
                                model: 'Taco.model.Location',
                                behavior: 'create'
                            },
                            menuColumnHandler: function(item, eventData) {
                                var record = eventData.record,
                                    metaData = {
                                        id: record.getId()
                                    };

                                Taco.app.StateManager.attemptNavigate('locations/duplicate/' + record.getId(), metaData);
                            }
                        }, {
                            text: 'Disable',
                            itemId: "disableMenuItem",
                            requiredBehaviors: {
                                model: 'Taco.model.Location',
                                behavior: 'update'
                            },
                            menuColumnHandler: function (item, eventData) {
                                me.setDisabledStatus(eventData.record, true);
                            }
                        }, {
                            text: 'Enable',
                            itemId: "enableMenuItem",
                            requiredBehaviors: {
                                model: 'Taco.model.Location',
                                behavior: 'update'
                            },
                            menuColumnHandler: function(item, eventData) {
                                me.setDisabledStatus(eventData.record, false);
                            }
                        }
                    ]

                }
            ];
        return columns;
    },

    setDisabledStatus: function(record, disable) {
        var me = this;
        record.set('isDisabled', disable);
        record.store.sync({
            success: function (m) { 
                var successMsg = ((disable) ? 'Disabled ' : 'Enabled ') + record.get('name') + '.';
                Taco.app.fireEvent('setmessage', successMsg, 'info');
                record.store.reload();
            },
            failure: function (m) {
                Taco.core.util.ExceptionWhiner.handleSyncFailure(m);
                record.store.reload();
            }
        });
    },

    onItemClick: function (view, record, elm, index, e) {
        if (e.target.className === 'taco-launch-editor') {
            e.preventDefault();
            this.launchEditor(record);
            Taco.app.StateManager.addState('locations/edit/' + record.getId(), { id: record.getId() });
        }
    },

    doCreate : function () {
        var controller = "locations";
        Taco.app.StateManager.attemptNavigate(controller + '/create');
    },


    launchEditor: function (record) {
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate('locations/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
        return;
    },

    //getDeletePromptMessage: function (record) {
    //    return record.getDeletePromptMessage();
    //}

   
});
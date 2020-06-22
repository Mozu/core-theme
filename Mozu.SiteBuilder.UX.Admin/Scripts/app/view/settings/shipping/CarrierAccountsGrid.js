/**
 * @class Taco.view.settings.shipping.CarrierAccountsGrid
*/
Ext.define('Taco.view.settings.shipping.CarrierAccountsGrid', {
    extend: 'Taco.core.ux.browser.SearchList',
    
    requires: [
       
        'Taco.model.CarrierAccountModel',
        'Taco.store.CarrierAccounts',
        'Taco.view.settings.shipping.AdvancedSearchForm'
    ],

    mixins: {
        pageable: 'Taco.core.ux.mixins.Pageable',
        searchable: 'Taco.core.ux.mixins.Searchable'
    },
    launchEditorOnClick: true,

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.CarrierAccountModel',

    enableNavHeader: true,

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,

    //isModalWrapper: true,
    enableSearch: false,
    //disableAdvancedSearch: true,
    enablePaging: true,
    //pageSize:5,
    enableRowEditing: false,

    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    showActionsColumn: false,

    hideSearchToolbar: false,
    selType: 'rowmodel',

    enableSearchBarInHeader: true,
    autoScroll: true,

    enableQuickFilters: false,
    
    stateful: false,
    //cls: "taco-test",
    //stateId: 'statefulOrderGrid',
    advancedSearchConfig: {
        defaultFieldName: 'name',
        disableAdvancedSearch: false,
        advancedFormCls: 'Taco.view.settings.shipping.AdvancedSearchForm',
        emptySearchText: 'Search'
    },

    initComponent: function () {
        var me = this;

        this.columns = this.getColumnConfig();
        //if (me.enablePaging) {
        //    // initialize the grid paging toolbar mixin
        //    this.mixins.pageable.constructor.apply(this);
        //}

        me.callParent(arguments);
    },

    onCreate: function () {
        return Taco.core.StateManager.attemptNavigate(this.createRoute);
    },

    launchLoadedEditor: function (record, options) {
        var complexMetaData = { record: record, options: options };

        if (this.reFetchRecordOnEdit) {
            delete complexMetaData.record;
        }

        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate(this.editorRoute + '/' + record.getId(), complexMetaData);
        }, 1, this);
    },
    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this;
        me.mixins = me.mixins || [];
        return [
            {
                xtype: 'gridcolumn',
                dataIndex: 'name',
                stateId: "name",
                text: 'Nickname',
                hideable: false,

                minWidth: 500
                //renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                //    return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
                //}
            },
            {
                xtype: 'gridcolumn',
                dataIndex: "carrierId",
                stateId: "carrierId",
                text: 'Carrier',
                flex: 1,
                width: 300,
                renderer: function (value) {

                    if (value.toLowerCase() == "canadapost") {
                        value = "CanadaPost";
                        return value;
                    }
                    else if (value.toLowerCase() === "fedex") {
                        value = "FedEx";
                        return value;
                    }
                    else if (value.toLowerCase() === "purolator") {
                        value = "Purolator";
                        return value;
                    }
                    else {
                        return value.toUpperCase();
                    }
                    
                }
            },
            {
                xtype: 'taco.menucolumn',
                flex: 1,
                menuItems: [
                    {
                        text: 'Edit',
                        requiredBehaviors: {
                            model: 'Taco.model.CarrierAccountModel',
                            behavior: 'update'
                        },
                        menuColumnHandler: function (item, eventData) {
                            me.launchLoadedEditor(eventData.record);
                        }
                    },
                    {
                        text: 'Delete',
                        requiredBehaviors: {
                            model: 'Taco.model.CarrierAccountModel',
                            behavior: 'update'
                        },
                        menuColumnHandler: function (item, eventData) {
                            Ext.MessageBox.show({
                                title: 'Delete',
                                // pushes the buttons to the right to be consistant with our dialog ux.
                                rightJustifyButtons: true,
                                // reverses the order of the buttons
                                reverseOrder: true,
                                msg: "Are you sure you want to delete " + eventData.record.get('name') + "?",
                                closable: false,
                                buttons: Ext.Msg.YESNO,
                                fn: function (val) {
                                    if (val === 'yes') {
                                        me.store.remove([eventData.record]);
                                        me.store.sync({
                                            failure: function (batch) {
                                                var msg = 'error occurred';
                                                try {
                                                    msg = batch.exceptions[0].error.remoteException.getMessage();
                                                }
                                                catch (e) { }
                                                Taco.app.fireEvent('setmessage', msg, 'error');
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                ]
            }
        ];
    }
});

/**
 * @class Taco.view.discount.Grid
*/
Ext.define('Taco.view.pendingChange.draft.Product', {
    extend: 'Taco.core.ux.browser.SearchList',
    alias: 'widget.cmsList',

    requires: [
        'Taco.model.Product',
        'Taco.store.Products'
    ],

    mixins: {
        deleteFromGrid: 'Taco.core.ux.mixins.DeleteFromGrid'
    },

    contextConfig: {
        supportedLevels: ['m', 'c'],
        requiresContextOfType: ['m', 's', 'c']
    },

    launchEditorOnClick: false,

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.Product',

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

    createButtonText: "Create New",

    showActionsColumn: true,

    hideSearchToolbar: false,
    
    title: "Product Drafts",

    store: { type: 'Taco.store.CmsDocumentDrafts' },

    autoScroll: true,

    enableQuickFilters:false,

    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.product.AdvancedSearchForm'
    },

    onCreate: Ext.emptyFn,

    stateful: true,
    stateId: 'statefulContentDraftGrid',

    statics: {
        
    },
        
    selType : 'checkboxmodel',

    initComponent: function () {
        var me = this;

    
        this.store = {
            type: 'Taco.store.Products',
            id: 'product.publishing',
            filters: [{ property: 'publishedstate', value: 'Pending' }],
            clearFilters: false
        };
        
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
                    dataIndex: 'productCode',
                    stateId: 'productCode',
                    text: 'Code',
                    width: 100
                }, {
                    dataIndex: 'productName',
                    stateId: 'productName',
                    text: 'Name',
                    minWidth: 120,
                    flex: 1,
                    renderer: function(value, metaData, record) {
                        return record.getContextualValue('productName');

                    }
                }, {
                    dataIndex: 'publishedState',
                    stateId: 'publishedState',
                    text: 'Modification',
                    width: 130
                }, {
                    dataIndex: 'lastModifiedDate',
                    stateId: 'lastModifiedDate',
                    text: 'Last Modified',
                    width: 150,
                    renderer: Ext.util.Format.dateRenderer('d M, Y')
                }, {
                    dataIndex: 'lastModifiedBy',
                    stateId: 'lastModifiedBy',
                    text: 'Modified By',
                    width: 150,
                    renderer: function(value, metaData, record) {
                        var u = record.get('lastModifiedByUser');

                        return u
                            ? u.FirstName + " " + u.LastName
                            : '--';
                    }
                }, {
                    dataIndex: 'lastPublishedDate',
                    stateId: 'lastPublishedDate',
                    text: 'Last Published',
                    width: 150,
                    renderer: Ext.util.Format.dateRenderer('d M, Y')
                }, {
                    dataIndex: 'lastPublishedBy',
                    stateId: 'lastPublishedBy',
                    text: 'Published By',
                    width: 150,
                    renderer: function(value, metaData, record) {
                        var u = record.get('lastPublishedByUser');
                        return u
                            ? u.FirstName + " " + u.LastName
                            : '--';

                    }
                }, {
                    xtype: 'taco.menucolumn',
                    text: 'Actions',
                    menuItems: [
                        {
                            text: 'Publish',
                            menuColumnHandler: function(item, eventData) {
                                Taco.model.Product.publishBulk({
                                    data: [eventData.record.getId()],
                                    success: function() {
                                        eventData.grid.store.reload();
                                    },
                                    failure: function() {
                                        Taco.MessageBox.alert(
                                            'Sorry!',
                                            'Failed to publish pending product changes.'
                                        );
                                    }
                                });
                            }
                        }, {
                            text: 'Discard',
                            menuColumnHandler: function(item, eventData) {
                                Taco.model.Product.discardBulk({
                                    data: [eventData.record.getId()],
                                    success: function() {
                                        eventData.grid.store.reload();
                                    },
                                    failure: function() {
                                        Taco.MessageBox.alert(
                                            'Sorry!',
                                            'Failed to discard pending product changes.'
                                        );
                                    }
                                });
                            }
                        }
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

    doCreate: function () {
        console.log("open the publish set createor dialog");
    },

    doEdit: function (record) {
        console.log("open the publish set editor dialog");
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
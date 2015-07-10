/**
 * @class Taco.view.discount.Grid
*/
Ext.define('Taco.view.pendingChange.draft.Cms', {
    extend: 'Taco.core.ux.browser.SearchList',
    alias: 'widget.cmsList',

    requires: [
        'Taco.model.CmsDocumentDraft',
        'Taco.store.CmsDocumentDrafts'
    ],

    mixins: {
        deleteFromGrid: 'Taco.core.ux.mixins.DeleteFromGrid'
    },

    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },

    launchEditorOnClick: false,

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.CmsDocumentDraft',

    enableNavHeader: false,

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,

    enableSearch: false,
    enablePaging: true,
    enableRowEditing: false,
    enableAutoSelect: true,
    createButtonEnabled: false,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    createButtonText: "Create New",

    showActionsColumn: true,

    hideSearchToolbar: false,
    
    title: "Content Drafts",

    store: { type: 'Taco.store.CmsDocumentDrafts' },

    autoScroll: true,

    enableQuickFilters:false,

    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.pendingChange.publishSet.AdvancedSearchForm'
    },

    onCreate: Ext.emptyFn,

    stateful: true,
    stateId: 'statefulContentDraftGrid',

    statics: {
        
    },
        
    selType: 'checkboxmodel',

    initComponent: function () {
        var me = this;
        
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
                dataIndex: 'name',
                stateId: 'name',
                text: 'Name',
                minWidth: 120,
                flex: 1
            }, {
                dataIndex: 'draftType',
                stateId: 'draftType',
                text: 'Type',
                value: 'Page',
                minWidth: 120,
                width: 100
            }, {
                dataIndex: 'modificationType',
                stateId: 'modificationType',
                text: 'Modification',

                width: 100
            }, {
                dataIndex: 'lastModified',
                stateId: 'lastModified',
                text: 'Last Modified',
                xtype: 'datecolumn',
                width: 200
            }, {
                dataIndex: 'modifiedBy',
                stateId: 'modifiedBy',
                text: 'Modified By',

                width: 100
            },
            {
                dataIndex: 'lastPublished',
                stateId: 'lastPublished',
                text: 'Last Published',
                xtype: 'datecolumn',
                width: 100
            },
            {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                menuItems: [],
                onMenuShow: function(menu, e) {
                    menu.removeAll();
                    if (e.record && e.record.get('draftType') === 'Page') {
                        menu.add({
                            xtype: 'button',
                            ui: 'action',
                            scale: 'medium',
                            text: 'Preview',
                            scope: this,
                            handler: function() {
                                var r = e.record;

                                window.open('/_gosite/' + Taco.app.context.getSiteId() + '?environment=preview&redir=' + encodeURIComponent('/pages/' + r.get('name')));
                            }
                        });
                    }
                }
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
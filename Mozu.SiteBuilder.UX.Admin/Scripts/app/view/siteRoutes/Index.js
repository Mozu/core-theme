/**
 * @class Taco.view.locationType.Index
 */
Ext.define('Taco.view.siteRoutes.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    requires: [
        'Taco.model.SiteRouteEntry'
    ],
    typeName: 'Site Routes',
    gridHeaderLabel: 'Site Routes',
    requiresContextOfType: 's',

    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },


    modelName: 'Taco.model.SiteRouteEntry',

    store: { model: 'Taco.model.SiteRouteEntry' },

    // turn on the row editing feature for inline grid editing and inline grid creation.  typically used for simple entities with several fields.
    enableRowEditing: true,

    // default data to use when creating new entity
    defaultRowEditingData: {

    },

    useTilePanel: false,

    // hide the serach field
    filterProperties: null,


    initComponent: function () {
        var me = this;
        this.header = this.header || {};


        this.header = Ext.apply({}, this.header);
        this.header.actions = [
            {
                xtype: 'button',
                ui: 'action-primary',
                scale: 'medium',
                text: 'Add Entrry',
                itemId: 'newbuttons',

                handler: this.onRowEditorCreate,
                scope: this
            }
        ];

        this.contentListStore = Taco.core.data.StoreManager.getOrCreate(
        {
            type: 'Taco.store.EntityLists',
            entityType: 'cms'
        });


        this.gridPanelConf = {
            selModel: {},

            columns: [
                {
                    dataIndex: 'index',
                    text: 'index',
                    editor: {
                        selectOnFocus: true,
                        allowBlank: false
                    },

                    width: 100
                }, {
                    dataIndex: 'template',
                    editor: {
                        emptyText: "template",
                        msgTarget: "qtip",
                        selectOnFocus: true,
                        allowBlank: false
                    },
                   // maxWidth: 300,
                    text: 'Template',
                    flex: 1
                },
                {
                    dataIndex: 'pageType',
                    editor: {
                        xtype: 'selectfield',
                        store: [
                            ['document', 'Document'],
                            ['documentList', 'Document List'],
                        ],
                        msgTarget: "qtip",
                        allowBlank: false,
                        autoFitErrors :false
                    },
                    text: 'Page Type',
                    width: 300
                }, {
                    dataIndex: 'listName',
                    editor: {
                        emptyText: "listName",
                        xtype: 'combo',
                        queryMode: 'local',
                        msgTarget: "qtip",
                        store: this.contentListStore,
                        displayField: 'listFQN',
                        valueField: 'listFQN',
                        triggerAction: 'all',

                        allowBlank: false,
                        autoFitErrors: false
                    },
                    text: 'List Name',

                    width: 300
                }, {
                    dataIndex: 'isCanonical',
                    text: 'Canonical',
                    width: 100,
                    editor: {
                        xtype: 'checkbox',
                    },

                }, {
                    xtype: 'taco.menucolumn',
                    text: 'Actions',
                    width: 100,
                    menuItems: [
                        {
                            text: 'Delete',

                            menuColumnHandler: function (item, eventData) {
                                eventData.record.destroy();
                            }
                        }
                    ]
                }
            ]
        };


        this.callParent(arguments);

        this.add(this.importForm);
    }


});
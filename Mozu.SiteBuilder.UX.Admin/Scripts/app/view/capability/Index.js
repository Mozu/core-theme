/**
 * @class Taco.view.capability.Index
 */
Ext.define('Taco.view.capability.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    requires: [
        'Taco.model.Capability',
        'Taco.store.Capability',
        'Taco.view.capability.Edit'
    ],
    typeName: 'Applications',
    gridHeaderLabel: 'Applications',
    
    editorName: 'Taco.view.capability.Edit',
    
    //plural: false,
    modelName: 'Taco.model.Capability',
    
    store: { type: 'Taco.store.Capability' },

    contextConfig: {
        supportedLevels: ['t', 's'],
        requiresContextOfType: ['t', 's']
    },

    useTilePanel: false,
    //launchEditorOnClick: false,
    
    filterFormConf: {
        width: 600,
        cls: Taco.baseCSSPrefix + 'combofilter-form orders',
        items: [{
            xtype: 'container',
            justify: false,
            defaults: {
                xtype: 'textfield',
                width: 560
            },
            items: [
                {
                    name: 'applicationName',
                    fieldLabel: 'Name',
                    width: 160
                }, {
                    name: 'code',
                    fieldLabel: 'appId',
                    width: 160
                }
            ]
        }]
    },

    filterProperties: [
        {
            property: 'all',
            text: 'All',
            isDefault: true
        }, {
            property: 'applicationName',
            text: 'Name'
        }, {
            property: 'code',
            text: 'Code'
        }
    ],

    // hides the create action
    header: {
        actions:[]
    },
     

    gridPanelConf: {
        selModel: {},
        features: [
            {
                ftype: 'grouping',
                groupHeaderTpl: '{groupValue}'

            }
        ],
        stateful: true,
        stateId:"statefulApplicationsGrid",
        columns: [
            {
                text: 'Name',
                stateId: "name",
                width:200,
                dataIndex: "applicationName"
            }, {
                text: 'Publisher',
                stateId: "publisher",
                width: 200,
                dataIndex: "developerAccountName"
            }, {
                text: 'Version',
                stateId: "version",
                width: 200,
                dataIndex: "version"
            }, {
                text: 'Initialized',
                stateId: "initialized",
                width: 80,
                dataIndex: "initialized",
                renderer: function (value) {
                    return (value) ? 'Yes' : 'No';
                }
            }, {
                text: 'Enabled',
                stateId: "enabled",
                width: 80,
                dataIndex: "enabled",
                renderer: function (value) {
                    return (value) ? 'Yes' : 'No';
                }
            }, {
                text: 'License Type',
                stateId: "licenseType",
                width: 200,
                dataIndex: "licenseType"
            }, {
                text: 'Coverage Area',
                stateId: "coverageArea",
                width: 200,
                dataIndex: "scopeType",
                renderer: function (value, row) {
                    try {
                        var scopeId = row.record.data.scopeId;
                        if (value == 'Site') {
                            value += ': ' + Taco.app.context.findSite(scopeId).name;
                        } else if (value == 'Catalog') {
                            value += ': ' + Taco.app.context.findMasterCatalog(scopeId).name;
                        } else if (value == 'MasterCatalog') {
                            value += ': ' + Taco.app.context.findCatalog(scopeId).name;
                        }
                    } catch (e) { }
                    return value;
                }
            }, {
                text: 'Expiration',
                stateId: "expiration",
                width: 200,
                xtype: 'datecolumn',
                format: 'M d, Y',
                dataIndex: "effectiveEndDate"
            }
        ]
    }
});
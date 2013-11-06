/**
 * @class Taco.view.capability.Index
 */
Ext.define('Taco.view.capability.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    requires: [
        'Taco.model.Capability',
        'Taco.store.Capability'
    ],
    typeName: 'Applications',
    gridHeaderLabel: 'Applications',
    
    editorName: 'Taco.view.capability.Edit',
    
    //plural: false,
    modelName: 'Taco.model.Capability',
    
    store: { type: 'Taco.store.Capability' },
   
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
        columns: [
            {
                text: 'Name',
                width:200,
                dataIndex: "applicationName"
            }, {
                text: 'Publisher',
                width: 200,
                dataIndex: "developerAccountName"
            }, {
                text: 'Enabled',
                width: 80,
                dataIndex: "enabled",
                renderer: function (value) {
                    return (value) ? 'Yes' : 'No';
                }
            }, {
                text: 'License Type',
                width: 200,
                dataIndex: "licenseType"
            }, {
                text: 'Site',
                width: 200,
                dataIndex: "uiConfigurationUrl"
            }, {
                text: 'Coverage Area',
                width: 200,
                dataIndex: "scopeType"
            }, {
                text: 'Expiration',
                width: 200,
                xtype: 'datecolumn',
                format: 'M d, Y',
                dataIndex: "effectiveEndDate"
            }
        ]
    }
});
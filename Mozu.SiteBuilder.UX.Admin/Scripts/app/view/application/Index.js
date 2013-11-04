/**
 * @class Taco.view.application.Index
 */
Ext.define('Taco.view.application.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    requires: [
        'Taco.model.Application',
        'Taco.store.Applications'
    ],
    typeName: 'Applications',
    gridHeaderLabel: 'Applications',
    
    //editorName: 'Taco.view.locationType.Edit',
    
    //plural: false,
    modelName: 'Taco.model.Application',
    
    store: { type: 'Taco.store.Applications' },
   
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
                    name: 'name',
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
            property: 'name',
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
                groupHeaderTpl: '{name}'

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
                dataIndex: "publisherName"
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
                dataIndex: "siteName"
            }, {
                text: 'Coverage Area',
                width: 200,
                dataIndex: "coverageArea"
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
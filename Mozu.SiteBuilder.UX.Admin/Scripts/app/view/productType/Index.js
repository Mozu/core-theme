/**
 * @class Taco.view.productType.Index
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.productType.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.taco.index.producttype',
    requires: ['Taco.model.ProductType'],

    typeName: 'Product Type',
    modelName: 'Taco.model.ProductType',
    store: { type: 'Taco.store.ProductTypes' },
    editorName: 'Taco.view.productType.Edit',
    filterProperty: 'name',

    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['m', 's', 'c']
    },
    
    initComponent: function () {
        this.callParent(arguments);
    },
    
    gridPanelConf: {
        columns: [{
            dataIndex: 'id',
            text: 'ID',
            width: 100
        }, {
            dataIndex: 'name',
            text: 'Name',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'numberOfProducts',
            text: 'No. of Products',
            width: 120
        }, {
            xtype: 'templatecolumn',
            text: 'Attributes',
            width: 240,
            sortable: false,
            allowNavigation: true,
            tpl: new Ext.XTemplate(
                '<tpl if="this.hasAttributes(options)"><div>',
                    '<span class="label">Options: </span>',
                    '<span>{[Ext.Array.pluck(values.options, "attributeFQN").join(",")]}</span>',
                '</div></tpl>',
                '<tpl if="this.hasAttributes(extras)"><div>',
                    '<span class="label">Extras: </span>',
                    '<span>{[Ext.Array.pluck(values.extras, "attributeFQN").join(",")]}</span>',
                '</div></tpl>',
                '<tpl if="this.hasAttributes(properties)"><div>',
                    '<span class="label">Properties: </span>',
                    '<span>{[Ext.Array.pluck(values.properties, "attributeFQN").join(", ")]}</span>',
                '</div></tpl>',
                {
                    hasAttributes: function (attributeType) {
                        return !Ext.isEmpty(attributeType);
                    }
                }
            )
        }, {
            dataIndex: 'modifiedDate',
            text: 'Modified Date',
            width: 120,
            renderer: function (value) {
                return !Ext.isEmpty(value) ? Ext.Date.format(value, 'm/d/y') : '--';
            }
        }, {
            xtype: 'taco.menucolumn',
            text: 'Actions',
            menuItems: [{
                text: 'Edit',
                menuColumnHandler: 'editMenuColumnHandler'
            }, {
                text: 'Delete',
                
                menuColumnHandler: 'destroyMenuColumnHandler'
            }]
        }]
    },

    launchEditor: function (record) {
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate('producttypes/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
        return;
    }
});
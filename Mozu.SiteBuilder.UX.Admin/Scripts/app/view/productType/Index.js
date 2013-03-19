/**
 * @class Taco.view.productType.Index
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.productType.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.taco.index.producttype',
    requires: ['Taco.model.ProductType'],

    typeName: 'ProductType',
    modelName: 'Taco.model.ProductType',
    store: { type: 'Taco.store.ProductTypes' },
    editorName: 'Taco.view.productType.Edit',
    filterProperty: 'name',

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
                return !Ext.isEmpty(value) ? value : '--';
            }
        }, {
            xtype: 'taco.menucolumn',
            text: 'Actions',
            menuItems: [{
                text: 'Edit',
                menuColumnHandler: function (item, eventData) {
                    var page = eventData.grid.getParentPage(),
                        record = eventData.record,
                        metaData = { id: record.getId() };

                    page.launchEditor(record, metaData);
                    Taco.app.StateManager.addState(page.token + '/edit/' + record.getId(), metaData);
                }
            }, {
                text: 'Delete',
                menuColumnHandler: function (item, eventData) {
                    var grid = eventData.grid,
                        record = eventData.record,
                        modal;

                    modal = Ext.create('Taco.core.ux.modal.Confirmation', {
                        autoShow: true,
                        content: {
                            html: 'Are you sure you want to delete this product type?'
                        },
                        listeners: {
                            cancel: Ext.emptyFn,
                            confirm: function () {
                                var store = grid.getStore();
                                grid.setLoading(true);
                                store.remove(record);
                                store.sync({
                                    success: function (m) {
                                        grid.setLoading(false);
                                    },
                                    failure: function (m) {
                                        grid.setLoading(false);
                                    }
                                });
                            },
                            scope: this
                        }
                    });
                }
            }]
        }]
    }
});
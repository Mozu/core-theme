/**
 * @class Taco.view.attribute.Index
 */

Ext.define('Taco.view.attribute.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.attributeindex',
    requires: ['Taco.model.Attribute', 'Taco.store.Attributes', 'Taco.view.attribute.Edit'],

    modelName: 'Taco.model.Attribute',
    storeName: 'Taco.store.Attributes',
    editorName: 'Taco.view.attribute.Edit',
    filterProperty: 'name',
    typeName: 'Attribute',

    gridPanelConf: {
        columns: [{
            dataIndex: 'name',
            text: 'Name',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'inputType',
            text: 'Input Type',
            width: 130
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
})
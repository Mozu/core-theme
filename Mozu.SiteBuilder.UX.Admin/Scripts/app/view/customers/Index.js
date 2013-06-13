/**
 * @class Taco.view.customers.Index
 */
Ext.define('Taco.view.customers.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.taco.index.customer',
    requires: ['Taco.model.CustomerAccount', 'Taco.store.Customers'],

    typeName: 'Customer',
    modelName: 'Taco.model.CustomerAccount',
    store: { type: 'Taco.store.Customers' },
    editorName: 'Taco.view.customer.Edit',
    useTilePanel: false,

    gridPanelConf: {
        columns: [{
            dataIndex: 'firstName',
            text: 'First Name',
            width: 150
        }, {
            dataIndex: 'lastName',
            text: 'Last Name',
            width: 150
        }, {
            dataIndex: 'email',
            text: 'Email',
            width: 200
        }, {
            dataIndex: 'cityOrTown',
            text: 'Location',
            width: 150,
            renderer: function (value, metaData, record) {
                return [value, record.get('stateOrProvince')].join(', ');
            }
        }, {
            dataIndex: 'totalOrders',
            text: 'Total Orders',
            width: 100
        }, {
            dataIndex: 'spent',
            text: 'Spent',
            width: 100
        }, {
            dataIndex: 'groups',
            text: 'Groups',
            flex: 1
        }]
    }
});
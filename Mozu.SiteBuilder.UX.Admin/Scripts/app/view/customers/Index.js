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
            dataIndex: 'primaryFirstName',
            text: 'First Name',
            width: 150
        }, {
            dataIndex: 'primaryLastName',
            text: 'Last Name',
            width: 150
        }, {
            dataIndex: 'primaryEmail',
            text: 'Email',
            width: 200
        }, {
            dataIndex: 'primaryCityOrTown',
            text: 'Location',
            width: 150,
            renderer: function (value, metaData, record) {
                return [value, record.get('primaryState')].join(', ');
            }
        }, {
            dataIndex: 'orderCount',
            text: 'Total Orders',
            width: 100
        }, {
            dataIndex: 'totalSpent',
            text: 'Spent',
            width: 100
        }, {
            dataIndex: 'groups',
            text: 'Groups',
            renderer: function (value, metaData, record) {
                if (value && value.length) {
                    return value.join(',')
                }
            },
            flex: 1
        }]
    }
});
/**
 * @class  Taco.view.priceList.entry.ExtrasGrid
 * @description Price List ExtrasGrid Form
 */
Ext.define('Taco.view.priceList.entry.ExtrasGrid', {
    extend: 'Ext.grid.Panel',
    requires: [],
    plugins: ['cellediting'],
    columns: [{
        text: 'Name',
        dataIndex: 'name',
        renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {
            var code = record.get('code');
            return (code) ? code + ': ' + val : val;
        }
    }, {
        text: 'Price',
        dataIndex: 'price',
        editor: 'textfield'
    }],
    store: Ext.create('Ext.data.Store', {
        storeId: 'extrasEntryStore',
        fields: ['code', 'name', 'price'],
        data: [{
            code: 'Please',
            name: 'Load',
            price: 123.23
        }, {
            name: 'A Store',
            price: 123.23
        },
        ]
    })
    
});
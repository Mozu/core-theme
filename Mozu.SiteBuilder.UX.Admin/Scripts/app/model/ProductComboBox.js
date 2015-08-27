/**
 * @class Taco.model.ProductComboBox
 */

Ext.define('Taco.model.ProductComboBox', {
    extend: 'Taco.core.data.Model',
    fields: ['display', 'value', 'path'],
    idProperty: 'value',

    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/product/autocomplete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        }
    }
});
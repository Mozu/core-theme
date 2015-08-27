/**
 * @class Taco.model.CustomerGroupComboBox
 */
Ext.define('Taco.model.CustomerGroupComboBox', {
    extend: 'Taco.core.data.Model',
    fields: ['display', 'value'],
    idProperty: 'value',

    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/customers/autocomplete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            type: 'json'
        }
    }
});

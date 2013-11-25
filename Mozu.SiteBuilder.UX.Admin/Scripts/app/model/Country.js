/**
 * @class Taco.model.Contact
 */
Ext.define('Taco.model.Country', {
    extend: 'Taco.core.data.Model',

    fields: ['name', 'code'],
    idProperty: 'code',
    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/Reference/countries/list'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        }
    }
});
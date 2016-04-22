/**
 * @class Taco.core.context.StoreItem
 * @author Thomas Phipps the Wiener
 */

Ext.define('Taco.model.Provisionable', {
    extend: 'Taco.core.data.Model',
    fields: [
        'path',
        'id',
        'name',
        'status',
        'masterCatalogId',
        'catalogId',
        {
            name: 'nameWithId',
            type: 'string',
            convert: function (v, record) {
                return record.get('name') + ' (' + record.get('id') + ')';
            },
            persist: false
        },
        {
            name: 'defaultCurrencyCode'
        },
        {
            name: 'defaultLocaleCode'
        },
        {
            name: 'catalog'        
        },
        {
            name: 'isMozuHosted',
            type: 'boolean'
        }
    ],
    idProperty: 'path'
});

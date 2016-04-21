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
        {
            name: 'defaultCurrencyCode'
        },
        {
            name: 'defaultLocaleCode'
        },
        {
            name: 'catalog'        
        }, {
            name: 'isMozuHosted',
            type: 'boolean'
        }
    ],
    idProperty: 'path'
});

/**
 * @class Taco.core.context.StoreItem
 * @author Thomas Phipps the Wiener
 */

Ext.define('Taco.core.context.StoreItem', {
    extend: 'Taco.core.data.Model',
    logMissMappedFields:false,
    fields: [
        'name',
        'contextType',
        {
            name: 'currency',
            type: 'string',
            defaultValue: 'USD'
        },
        {
            name: 'localeCode',
            type: 'string',
            defaultValue: 'en-US'
        },
        {
            name: 'catalog',
            convert: function (v, record) {
                return "food";
            }
        }, {
            name: 'isMozuHosted',
            type: 'boolean'
        },        
        'urlToken',
        {
            name: 'isMozuRendered',
            type: 'boolean',
            defaultValue: false
        }
    ],
    idProperty: 'urlToken'
});
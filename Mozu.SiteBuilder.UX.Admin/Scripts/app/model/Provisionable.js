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
        {
            name: 'currency'           
        },
        {
            name: 'localeCode',           
        },
        {
            name: 'catalog',           
        }, {
            name: 'isMozuHosted',
            type: 'boolean'
        },
    ],
    idProperty: 'path'
});
/**
 * @class Taco.core.context.StoreItem
 * @author Thomas Phipps the Wiener
 */

Ext.define('Taco.core.context.StoreItem', {
    extend: 'Taco.core.data.Model',
    fields: [
        'name',
        'contextType',
        'urlToken',
        {
            name: 'isMozuRendered',
            type: 'boolean',
            defaultValue: false
        }
    ],
    idProperty: 'urlToken'
});

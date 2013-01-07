/**
 * @class Taco.model.Navigation
 */
    Ext.define('Taco.model.Navigation', {
        extend: 'Ext.data.Model',
        idProperty: 'name',
        fields: ['name',
        {
            name: 'items',
            model: 'NavigationItem'
        }]
    });
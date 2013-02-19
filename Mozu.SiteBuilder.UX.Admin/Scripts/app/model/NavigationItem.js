/**
 * @class Taco.model.NavigationItem
 */
Ext.define('Taco.model.NavigationItem', {
    requires:['Ext.data.association.HasMany'],
    extend: 'Taco.core.data.Model',
    idProperty: 'id',
    fields: ['id', 'label', 'icon', 'address'],
    // belongsTo: 'NavigationItem',
    hasMany: [{
        model: 'Taco.model.NavigationItem',
        name: 'items'
    }]
});
/**
 * @class Taco.model.NavigationItem
 */
Ext.define('Taco.model.NavigationItem', {
    requires:['Ext.data.association.HasMany'],
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: ['id', 'label', 'icon', 'address'],
    // belongsTo: 'NavigationItem',
    hasMany: [{
        model: 'Taco.model.NavigationItem',
        name: 'items'
    }]
});
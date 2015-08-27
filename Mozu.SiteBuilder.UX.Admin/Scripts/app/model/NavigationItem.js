/**
 * @class Taco.model.NavigationItem
 */
Ext.define('Taco.model.NavigationItem', {
    requires:['Ext.data.association.HasMany'],
    extend: 'Taco.core.data.Model',
    idProperty: 'id',
    fields: ['id', 'label', 'icon', 'address', {
        name: 'visible',
        type: "boolean",
        defaultValue: true
    }, {
        name: 'showBreadCrumbs',
        type: "boolean",
        defaultValue: true
    },  {
        name: 'breadCrumbOnly',
        type: "boolean",
        defaultValue: false
    },{
        name: 'behaviorIds'
       
    }, 'items'],
    // belongsTo: 'NavigationItem',
    hasMany: [{
        model: 'Taco.model.NavigationItem',
        name: 'items'
    }]
});
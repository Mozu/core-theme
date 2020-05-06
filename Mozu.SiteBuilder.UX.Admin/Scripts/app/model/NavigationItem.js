/**
 * @class Taco.model.NavigationItem
 */
Ext.define('Taco.model.NavigationItem', {
    requires:['Ext.data.association.HasMany'],
    extend: 'Taco.core.data.Model',
    idProperty: 'id',
    fields: ['id', 'label', 'icon', 'address', 'menucolor',
        {
            name: 'visible',
            type: 'boolean',
            defaultValue: true
        }, 
        {
            name: 'showBreadCrumbs',
            type: 'boolean',
            defaultValue: true
        },  
        {
            name: 'breadCrumbOnly',
            type: 'boolean',
            defaultValue: false
        },
        {
            name: 'behaviorIds'
        },
        {
            name: 'viewDependent',
            type: 'auto',
            defaultValue: false
        },
        {
            name: 'navParent',
            type: 'string',
            defaultValue: 'main'
        },
        {
            name: 'label',
            type: 'string'
        },
        {
            name: 'locAtts',
            type: 'auto',
            defaultValue: []
        },
        {
            name: 'location',
            type: 'string'
        },
        {
            name: 'displayMode',
            type: 'string'
        },
        {
            name: 'modalWindowTitle',
            type: 'string'
        },
        {
            name: 'href',
            type: 'string'
        },
        {
            name: 'appId',
            type: 'string'
        },
        {
            name: 'badgeInitials',
            type: 'string'
        },
        {
            name: 'badgeImage',
            type: 'string'
        },
        {
            name: 'path',
            type: 'auto'
        },
        {
            name: 'parentId',
            type: 'string'
        },
        {
            name: 'windowTitle',
            type: 'string'
        },
        {
            name: 'guid',
            type: 'string'
        },
        {
            name: 'isSubNavLink',
            type: 'boolean'
        },
        {
            name: '_id',
            type: 'string'
        },
        'items'
    ],
    // belongsTo: 'NavigationItem',
    hasMany: [{
        model: 'Taco.model.NavigationItem',
        name: 'items'
    }]
});
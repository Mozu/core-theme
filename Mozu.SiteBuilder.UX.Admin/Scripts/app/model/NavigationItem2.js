/**
 * @class Taco.model.NavigationItem3
 * // temporary tree node based navigation structure;
 */
Ext.define('Taco.model.NavigationItem2', {
    //requires:['Ext.data.association.HasMany'],
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [        
        'id',
        'label',
        'icon',
        'address',
        {
            name: 'keyNavShortcut',            
            type: "string"
        },
        {
            name: 'visible',
            type: "boolean",
            defaultValue: true
        }, {
            name: 'showBreadCrumbs',
            type: "boolean",
            defaultValue: true
        }
    ]
});
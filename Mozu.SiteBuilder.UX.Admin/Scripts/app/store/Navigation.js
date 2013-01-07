/**
 * @class Taco.store.Navigation
 */
Ext.define('Taco.store.Navigation', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.NavigationItem',
    autoLoad: true,
    
    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/Scripts/app/mocks/navigation.json'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        }
    }
});
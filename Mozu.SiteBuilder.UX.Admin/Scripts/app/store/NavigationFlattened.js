/**
 * @class Taco.store.NavigationFlattened
 * @author Zetlen
 */
Ext.define('Taco.store.NavigationFlattened', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.NavigationTreeNode',
        requires:['Taco.model.NavigationTreeNode']
    });


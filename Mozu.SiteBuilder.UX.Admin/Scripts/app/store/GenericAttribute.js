/**
* @class Taco.store.GenericAttribute
* @author Amol Shinde
*/

Ext.define('Taco.store.GenericAttribute', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.GenericAttribute',
    proxy: {
        type: "memory"
    }
});

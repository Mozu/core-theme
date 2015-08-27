/**
 * @class Taco.model.LocationType
 */
Ext.define('Taco.model.EntityList', {
    extend: 'Taco.core.data.Model',
    idProperty: "uniqueId",
   
    fields: [
        'uniqueId',
        'listFQN',
        'name',
        'entityType',
        'views',
        'scopeType'
    ],



  
    proxy: {
    type: 'ajax',
    api: {
        read: '/admin/app/entities/lists/read'
    },
    reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
    },
    writer: {
            allowSingle: false,
            type: 'json'
    }
}
});
/**
 * @class Taco.model.LocationType
 */
Ext.define('Taco.model.DocumentTypeFQN', {
    extend: 'Taco.core.data.Model',
    idProperty: "name",
   
    fields: [
        'name'
    ],

   
    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/entities/documentTypes/read',
     
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
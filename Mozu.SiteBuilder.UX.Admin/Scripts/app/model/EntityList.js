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
        'scopeType',
        'documentTypes',
        'enableActiveDateRanges',
        'enablePublishing',
        'supportsActiveDateRanges',
        'supportsPublishing'
    ],
    statics: {
        loadByCopositeId: function (entityType, listFQN, cfg) {
            return Taco.model.EntityList.load(entityType + '-' + listFQN, cfg);
        }
    },


  
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
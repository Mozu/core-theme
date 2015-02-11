/**
 * @class Taco.model.MediaAssociation
 */
Ext.define('Taco.model.MediaAssociation', {
    extend: 'Ext.data.Model',
    fields: [
        //todo: change to int?
        {
            name: 'id',
            type: 'string',
            useNull: true
        },{
            name: 'cmsId',
            type: 'string',
            useNull: true
        }, {
            name: 'isStoredInCms',
            type: 'boolean',
            useNull: true
        }, {
            name: 'isUploaded',
            type: 'boolean'
        }, {
            name: 'progress',
            type: 'number',
            defaultValue: 1,
            persist: false
        },{
            name: 'alt',
            type: 'string',
            useNull: true
       }, {
            name: 'url',
            type: 'string',
            useNull: true
        }, {
            name: 'sequence',
            type: 'int',
            useNull: true
        }
    ]
});
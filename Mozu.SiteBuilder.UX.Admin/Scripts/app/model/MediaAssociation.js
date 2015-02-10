/**
 * @class Taco.model.MediaAssociation
 */
Ext.define('Taco.model.MediaAssociation', {
    extend: 'Ext.data.Model',
    fields: [
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
        },{
            name: 'alt',
            type: 'string',
            useNull: true
       }, {
            name: 'url',
            type: 'string',
            useNull: true
        }, {
            name: 'mediaType',
            type: 'string',
            useNull: true
        }
    ]
});
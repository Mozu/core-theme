/**
* @class Taco.model.SiteDirectoryNode
* @author Jason Cochran
* The SiteDirectoryNode model
*/

Ext.define('Taco.model.SiteDirectoryNode', {
    extend: 'Taco.core.data.Model',
   // requires: ['Taco.model.Product'],

    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'collection', type:'string'},
        { name: 'nodeType', type:'string'},
        { name: 'url', type:'string'},
        { name: 'collection', type:'string'}

    ],

    hasMany: [
        {
            model: 'Taco.model.SiteDirectoryNode',
            name: 'items'
        }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            
            read: '/admin/app/SiteDirectory/read'
            
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

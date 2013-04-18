/**
 * @class Taco.model.NavigationTreeNode
 */
Ext.define('Taco.model.NavigationTreeNode', {
        extend: 'Taco.core.data.Model',

        fields: [{
            name: 'id',
            type: 'string',
            useNull: true
        }, 
        {
            name: 'expandable',
            defaultValue: true,
            persist: false
        },
        {
            name: 'loaded',
            convert:function(v, record) {
                return record.get('loaded')|| record.data.id != "root";
            },
            persist: false
        },
        {
            name: 'parentId',
            type: 'string',
            useNull: true
        }, {
            name: 'index',
            type: 'int',
            useNull: true
        }, {
            name: 'name',
            type: 'string'
        }, {
            name: 'nodeType',
            type: 'string'
        }, {
            name: 'url',
            type: 'string'
        }, {
            name: 'isHidden',
            type: 'boolean'
        }, {
            name: 'name',
            type: 'string'
        }],
        proxy: {
            type: 'ajaxproxy',
            api: {
                create: '/admin/app/navigation/create',
                read: '/admin/app/navigation/list',
                update: '/admin/app/navigation/update',
                destroy: '/admin/app/navigation/delete'
            },

            reader: {
                type: 'json',
                root: 'items',
                successProperty: 'success',
                messageProperty: 'message'
            },

            writer: {
                allowSingle: false,
                writeAllFields: true,
                type: 'json'
            }
        }
    });

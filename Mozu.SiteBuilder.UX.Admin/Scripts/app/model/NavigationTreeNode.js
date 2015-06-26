/**
 * @class Taco.model.NavigationTreeNode
 */
Ext.define('Taco.model.NavigationTreeNode', {
    extend: 'Taco.core.data.Model',

    fields: [
    {
        name: 'id',
        type: 'string',
        useNull: true
    },
    {
        name: 'originalId',
        type: 'string',
        useNull: true
    },
    {
        name: 'originalDocumentListName',
        type: 'string',
        useNull: true
    },
    {
        name: 'expandable',
        defaultValue: true,
        persist: false,
        convert: function(v, record) {
            if (record.get('nodeType') === 'category' || record.get('nodeType') === 'link') {
                return true;
            }
            if (record.get('expandable')) {
                return !(record.isLeaf() || (record.isLoaded() && !record.hasChildNodes()));
            }
            return false;
        }
    },
    {
        name: 'loaded',
        convert: function (v, record) {
            return record.get('loaded') || record.data.id != 'root';
        },
        persist: false
    },
    {
        name: 'parentId',
        type: 'string',
        useNull: true
    }, 
    {
        name: 'index',
        type: 'int',
        useNull: true
    }, 
    {
        name: 'name',
        type: 'string'
    }, 
    {
        name: 'nodeType',
        type: 'string'
    }, 
    {
        name: 'allowDrag',
        convert: function (v, record) {
            var nt = (record.data ? record.data.nodeType : (record.raw ? record.raw.nodeType : undefined));
            return nt === 'page' || nt === 'link';
        }
    },
    {
        name: 'cls',
        convert: function (v, record) {
            return 'taco-website-tree-node-' + (record.data ? record.data.nodeType : (record.raw ? record.raw.nodeType : undefined));
        },
    },
    {
        name: 'url',
        type: 'string'
    }, 
    {
        name: 'isHidden',
        type: 'boolean'
    }, 
    {
        name: 'name',
        type: 'string'
    }, 
    {
        name: 'editAction',
        type: 'string'
    }],
    proxy: {
        type: 'ajaxproxy',
        extraParams: {
            showContentLists: !!(Taco.tenantSettings && Taco.tenantSettings.siteBuilderContentListsVisible)
        },
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
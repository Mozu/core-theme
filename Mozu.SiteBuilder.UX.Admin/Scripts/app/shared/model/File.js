/**
 * @class Taco.shared.model.File
 * The File model
 */
Ext.define('Taco.shared.model.File', {
    extend: 'Taco.core.data.Model',
    requires: [],
    fields: [{
            name: 'id',
            type: 'string',
            useNull: true
        }, {
            name: 'name',
            type: 'string',
            useNull: true
        }, {
            name: 'height',
            type: 'int',
            useNull: true
        }, {
            name: 'width',
            type: 'int',
            useNull: true
        }, {
            name: 'thumbnail',
            type: 'string',
            useNull: true,
            persist: false,
            convert: function fullName(v, record) {
                return v || record.get('localthumbnail') || '/files/' + Taco.app.context.getTenantId() + '/' + Taco.app.context.getMasterCatalogId() + '/' + record.getId();
            }
        }, {
            name: 'alt',
            type: 'string',
            useNull: true,
            persist: false
        }, {
            name: 'dateModified',
            type: 'date',
            useNull: true,
            persist: false
        }, {
            name: 'fileType',
            type: 'string',
            useNull: true,
            persist: false
        }, {
            name: 'fileSize',
            type: 'int',
            useNull: true,
            persist: false
        }, {
            name: 'isUploaded',
            type: 'boolean',
            useNull: true,
            persist: false,
            defaultValue: false
        }, {
            name: 'localthumbnail',
            type: 'auto',
            useNull: true,
            persist: false
        },{
            name: 'progress',
            type: 'number',
            defaultValue: 1,
            persist: false
        }, {
            name: 'url',
            type: 'string',
            useNull: true,
            persist: false,
            convert: function fullName(v, record) {
                return record.raw.url || '/files/' + Taco.app.context.getTenantId() + '/' + Taco.app.context.getMasterCatalogId() + '/' + record.getId();
            }
        }
    ],
    idProperty: 'id',
    validations: [{
            type: 'length',
            name: 'name',
            min: 3,
            max: 20
        }, {
            type: 'presence',
            name: 'name'
        }
    ],
    getThumbnail: function(size) {
        var tn = this.get('thumbnail');
        if (size) {
            if (tn.indexOf('?')) {
                tn += '&';
            } else {
                tn += '?';
            }
            tn += 'size=' + size;
        }
    },
    proxy: {
        type: 'ajax',
        unfilteredParam: 'unfiltered',
        api: {
            read: '/admin/app/fileManagement/file/list',
            create: '/admin/app/fileManagement/file/create',
            update: '/admin/app/fileManagement/file/edit',
            destroy: '/admin/app/fileManagement/file/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: 'message'
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});
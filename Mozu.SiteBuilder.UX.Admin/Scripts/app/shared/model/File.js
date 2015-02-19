/**
 * @class Taco.shared.model.File
 * The File model
 */
Ext.define('Taco.shared.model.File', {
    extend: 'Taco.core.data.Model',
    requires: [],
    fields: [
        {
            name: 'cmsId',
            type:'string',
            useNull: true,
            convert:function (v, record) {
                v = v|| (record.raw ? record.raw.id : null);
                return v;
            }
        },

        {
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
            name: 'alt',
            type: 'string',
            useNull: true,
            persist: false
        }, {
            name: 'dateModified',
            type: 'date',
            useNull: true,
            persist: false,
            dateFormat: 'c'
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
            name: 'isStoredInCms',
            type: 'boolean',
            persist: false,
            defaultValue: true
        }, {
            name: 'localthumbnail',
            type: 'auto',
            useNull: true,
            persist: false
        },
    {
        name: 'tags',
        type: 'auto',
        useNull: true,
        defaultValue:[]
    },

        {
            name: 'progress',
            type: 'number',
            defaultValue: 1,
            persist: false
        },  {
            name: 'thumbnail',
            type: 'string',
            useNull: true,
            persist: false,
            convert: function fullName(v, record) {
                var raw = record.raw || {};
                if (raw.isStoredInCms === false) return v;
                return v || (raw.localthumbnail || raw.imageUrl || '/cms/' + record.getCurrentSiteId() + '/files/' + (raw.cmsId || raw.id));
            }
        },{
            name: 'url',
            type: 'string',
            useNull: true,
            persist: false,
            convert: function fullName(v, record) {
                var raw = record.raw || {};
                return v || (raw.url || raw.imageUrl || '/cms/' + record.getCurrentSiteId() + '/files/' + (raw.cmsId || raw.id));
            }
        }
    ],
    getCurrentSiteId: function () {
        
        var siteId = Taco.app.context.getSiteId();
        if (!siteId) {
            siteId = Taco.app.context.getCurrentContext().sites[0].getSiteId();
        }
        return siteId;

    },
    isCmsFile:function () {
        return !!this.get('cmsId');
    },
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
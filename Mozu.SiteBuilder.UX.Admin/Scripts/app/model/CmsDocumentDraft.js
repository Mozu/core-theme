/**
* @class Taco.model.CmsDocumentDraft
* @author Foster Hersey
* The CmsDocumentDraft model
* Hint: It's a CmsDocument with unpublished changes.
*/

Ext.define('Taco.model.CmsDocumentDraft', {
    extend: 'Taco.core.data.Model',
    
    fields: [
        {
            'name': 'id',
            'type': 'string',
            'useNull': true
        },
        {
            'name': 'draftType',
            'type': 'string',
            'useNull': true
        },
        {
            'name': 'listFQN',
            'type': 'string',
            'useNull': true
        },
        {
            'name': 'name',
            'type': 'string',
            'useNull': true
        },
        {
            'name': 'isPublished',
            'type': 'boolean',
            'defaultValue': false
        },
        {
            'name': 'modificationType',
            'type': 'string',
            'useNull': true
        },
        {
            'name': 'lastModified',
            'type': 'date',
            'useNull': true,
            dateFormat: 'c'
        },
        {
            'name': 'modifiedBy',
            'type': 'string',
            'useNull': true,
            convert: function (v, r) {
                var uName = null;
                Ext.each(Taco.siteUsers, function (item) {
                    if (item.Id == v) {
                        uName = item.EmailAddress;
                    }
                });
                return uName;
            }
        },
        {
            'name': 'lastPublished',
            'type': 'date',
            'useNull': true
        },
        {
            name: 'beginDate',
            type: 'date',
            defaultValue: null
        },
        {
            name: 'endDate',
            type: 'date',
            defaultValue: null
        }

    ],

    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/cmspublishing/listdrafts',
            destroy: '/admin/app/cmspublishing/discard',
            // note: to publish, you must also set isPublished=true on the model.
            update: '/admin/app/cmspublishing/publish',
            publishAll: '/admin/app/cmspublishing/publishall',
            discardAll: '/admin/app/cmspublishing/discardall'
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

/**
 * @class Taco.model.AuditLog
 * Audit Log model
 */
Ext.define('Taco.model.AuditLog', {
    extend: 'Taco.core.data.Model',

    behaviors: {
        read: 73
    },

    idProperty: 'id',
    fields: [
        {
            name: 'id',
            type: 'string'
        }, {
            name: 'createDate',
            type: 'date',
            useNull: false,
            dateFormat: 'c'
        }, {
            name: 'subject',
            type: 'string',
            useNull: false
        }, {
            name: 'subjectType',
            type: 'string',
            useNull: false
        }, {
            name: 'verb',
            type: 'string',
            useNull: false
        }, {
            name: 'userDisplayName',
            type: 'string',
            useNull: false
        }, {
            name: 'data',
            type: 'auto',
            useNull: true
        }

    ],
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/Scripts/app/mocks/auditlog.json'
            //read: '/admin/app/auditlog/list'
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
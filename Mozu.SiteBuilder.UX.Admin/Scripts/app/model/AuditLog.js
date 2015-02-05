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
            name: 'eventDate',
            type: 'date',
            useNull: false,
            dateFormat: 'c'
        }, {
            name: 'eventMsg',
            type: 'string',
            useNull: false
        }, {
            name: 'user',
            type: 'string',
            useNull: false
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
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
            name: 'userFirstName',
            type: 'string',
            useNull: false
        }, {
            name: 'userLastName',
            type: 'string',
            useNull: false
        }, {
            name: 'message',
            type: 'string',
            useNull: false
        }, {
            name: 'data',
            type: 'auto',
            useNull: true
        }

    ]
});
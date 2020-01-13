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
            name: 'userId',
            type: 'string'
        }, {
            name: 'userFirstName',
            type: 'string'
        }, {
            name: 'userLastName',
            type: 'string'
        }, {
            name: 'userDisplayName',
            type: 'string',
            convert: function (value, record) {
               
                if (record.get('userFirstName') || record.get('userLastName')) {
                    return Ext.util.Format.htmlEncode(record.get('userFirstName')) + ' ' + Ext.util.Format.htmlEncode(record.get('userLastName'));
                } else if (record.get('appName')) {
                    return Ext.util.Format.htmlEncode(record.get('appName'));
                } else if (record.get('appKey')) {
                    return Ext.util.Format.htmlEncode(record.get('appKey'));
                }

                return Ext.util.Format.htmlEncode(record.get('appId'));
            }
        }, {
            name: 'userType',
            type: 'string'
        }, {
            name: 'appId',
            type: 'string'
        }, {
            name: 'appName',
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
            name: 'message',
            type: 'string',
            useNull: false
        }, {
            name: 'metadata',
            type: 'auto',
            useNull: true
        },
        // Added to fix model issues in Ext.
        {
            name: 'correlationId',
            type: 'auto',
            useNull: true
        }, {
            name: 'userScopeType',
            type: 'auto',
            useNull: true
        }, {
            name: 'appKey',
            type: 'auto',
            useNull: true
        }, {
            name: 'success',
            type: 'auto',
            useNull: true
        }, {
            name: 'identifier',
            type: 'auto',
            useNull: true
        }, {
            name: 'oldValue',
            type: 'auto',
            useNull: true
        }, {
            name: 'newValue',
            type: 'auto',
            useNull: true
        }

    ]
});
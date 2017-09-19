/**
 * @class Taco.model.InternalNote
 */
Ext.define('Taco.model.InternalNote', {
    extend: 'Taco.core.data.Model',
    fields: [
        {
            "name": "noteId",
            "type": "string",
            "useNull": true
        },
        {
            "name": "orderId",
            "type": "string",
            "useNull": true
        },
        {
            "name": "text",
            "type": "string",
            "useNull": true
        },
        {
            name: 'createBy',
            type: 'string',
            useNull: true
        },
        {
            name: 'createByUser',
            type: 'string',
            convert: Taco.core.util.Common.getCreateByUser,
            persist: false
        },
        {
            name: 'createDate',
            type: 'date',
            useNull: true
        }
    ],
    idProperty: 'noteId',
    proxy: {
        type: 'ajaxproxy',
        api: {
            // read: '/admin/app/internalnotes/list',
            create: '/admin/app/order/internalnotes/create',
            update: '/admin/app/order/internalnotes/edit',
            destroy: '/admin/app/order/internalnotes/delete'
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
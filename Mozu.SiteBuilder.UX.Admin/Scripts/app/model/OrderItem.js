/**
 * @class Taco.model.OrderItem
 */
Ext.define('Taco.model.OrderItem', {
    extend: 'Taco.core.data.Model',
    requires: ['Ext.data.association.HasOne'],
    fields: [
        {
            "name": "id",
            "type": "string",
            "useNull": true
        },
        
        /*************************************************
        *
        *   missing item discount object
        *   future missing item adjustments
        *
        *
        **************************************************/


        //{
        //    "name": "originalCartItemId",
        //    "type": "string",
        //    "useNull": true
        //},
        //{
        //    "name": "localeCode",
        //    "type": "string",
        //    "useNull": true
        //},
        {
            "name": "productCode",
            "type": "string",
            "useNull": false
        },
        {
            "name": "productName",
            "type": "string",
            "useNull": true
        }, 
        {
            "name": "options", //<== get list of options or extras
            "type":"auto",
            defaultValue:[]
        },
        //{
        //    "name": "product",
        //    "type": "auto",
        //    "useNull": true
        //},

        {
            "name": "quantity",
            "type": "int",
            "useNull": true
        },
        {
            "name": "subTotal",
            "type": "float",
            "useNull": true
        },
        {
            "name": "discountTotal",
            "type": "float",
            "useNull": true
        },
        {
            "name": "total",
            "type": "float",
            "useNull": true
        }, {
            name: "weight",
            type:"float" //<==foster to look into... thinks it may be shown on the prod list
        }
        //{
        //    "name": "productReservationId",
        //    "type": "int",
        //    "useNull": true
        //},
        //{
        //    "name": "createDate",
        //    "type": "date",
        //    "useNull": true
        //}, {
        //    "name": "createBy",
        //    "type": "string",
        //    "useNull": true
        //}, {
        //    "name": "updateDate",
        //    "type": "date",
        //    "useNull": true
        //}, {
        //    "name": "updateBy",
        //    "type": "string",
        //    "useNull": true
        //}
    ],

    associations: [
        {
            type: 'hasOne',
            model: 'Taco.model.Product',
            name: 'product'
        },
        {
            type: 'belongsTo',
            model: 'Taco.model.Order'
        }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/order/orderitem/list',
            create: '/admin/app/order/orderitem/create',
            update: '/admin/app/order/orderitem/edit',
            destroy: '/admin/app/order/orderitem/delete'
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
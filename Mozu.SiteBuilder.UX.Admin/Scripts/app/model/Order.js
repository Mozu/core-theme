/**
 * @class Taco.model.Order
 */
Ext.define('Taco.model.Order', {
    extend: 'Taco.core.data.Model',
    /**********************************************************
    *   missing shipping discount object
    *   missing shipping method...
    *   
    *
    *
    ***************************************************************/



    fields: [
        {
            "name": "id",
            "type": "string",
            "useNull": true
        }, 
        {
            "name": "orderNumber",
            "type": "int",
            "useNull": true
        },
        {
            "name": "createDate",
            "type": "date",
            "useNull": true,
        },
        {
            "name": "customer",
            "type": "auto",
            "useNull": true
        },
        {
            "name": "ipAddress",
            "type": "string",
            "useNull": true
        },
        {
            "name": "items",
            "type": "auto",
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
            "name": "shippingCost",
            "type": "float",
            "useNull": true
        }, 
        {
            "name": "shippingDescription",
            "type": "string",
            "useNull": true
        }, 
        {
            "name": "shippingDiscount",
            "type": "float",
            "useNull": true
        }, 
        {
            "name": "shippingDiscountDescription",
            "type": "string",
            "useNull": true
        }, 
        {
            "name": "shippingTotal",
            "type": "float",
            "useNull": true
        }, 
        {
            "name": "taxTotal",
            "type": "float",
            "useNull": true
        }, 
        {
            "name": "feeTotal",
            "type": "float",
            "useNull": true
        }, 
        {
            "name": "adjustmentDescription",
            "type": "string",
            "useNull": true
        }, 
        {
            "name": "adjustmentTotal",
            "type": "float",
            "useNull": true
        }, 
        {
            "name": "total",
            "type": "float",
            "useNull": true
        }, 
        {
            "name": "customerNote",
            "type": "string",
            "useNull": true
        },
        // workflow shit
        {
            "name": "orderStatus",
            "type": "string",
            "useNull": true
        },
        {
            "name": "shippingStatus",
            "type": "string",
            "useNull": true
        },
        {
            "name": "paymentStatus",
            "type": "string",
            "useNull": true
        },
        {
            "name": "availableOrderActions",
            "type": "auto"
        },
        {
            "name": "availablePaymentActions",
            "type": "auto"
        }, 
        {
            "name": "availableShipmentActions",
            "type": "auto"
        },
        // payment shit, incomplete
        {
            "name": "lastValidationDate",
            "type": "date",
            "useNull": true,
        },
        {
            "name": "expirationDate",
            "type": "date",
            "useNull": true,
        }
    ],


    associations: [
      
        {
            type: 'hasMany',
            model: 'Taco.model.OrderItem',
            name: "items"
        },
        {
            type: 'hasOne',
            model: 'Taco.model.OrderCustomer',
            name: "customer"
        }
    ],


    proxy: {
        type: 'ajaxproxy',
        api: {
            // read: '/admin/Scripts/app/mocks/orders.json',
            read: '/admin/app/order/list',
            create: '/admin/app/order/create',
            update: '/admin/app/order/edit',
            destroy: '/admin/app/order/delete'
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

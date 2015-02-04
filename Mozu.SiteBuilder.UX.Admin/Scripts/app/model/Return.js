/**
 * @class Taco.model.Return
 */
Ext.define('Taco.model.Return', {
    extend: 'Taco.core.data.Model',
    requires: ['Taco.model.ReturnItem', 'Taco.model.OrderPayment'],

    statics: (function () {

        var constants = {
                reasons: {
                    DAMAGED: 'Damaged',
                    DEFECTIVE: 'Defective',
                    MISSING_PARTS: 'MissingParts',
                    DIFFERENT_EXPECTATIONS: 'DifferentExpectations',
                    LATE: 'Late',
                    NO_LONGER_WANTED: 'NoLongerWanted',
                    OTHER: 'Other'
                },
                statuses: {
                    AUTHORIZED: "Authorized",
                    CANCELLED: "Cancelled",
                    CLOSED: "Closed",
                    CREATED: "Created",
                    PENDING: "Pending",
                    RECEIVED: "Received",
                    REFUNDED: "Refunded",
                    REJECTED: "Rejected",
                    RESTOCKED: "Restocked",
                    SHIPPED: "Shipped"
                }
            },
            storeReasons = Ext.Array.map(Ext.Object.getValues(constants.reasons), function toStoreReason(s) {
                return [s, Taco.core.util.Common.camelToSpace(s)];
            });


        return {
            constants: constants,
            getValidReasons: function () {
                return storeReasons;
            }
        };
    }()),

    fields: [
        {
            "name": "id",
            "type": "string",
            "useNull": true
        },
        {
            "name": "returnNumber",
            "type": "int",
            "useNull": true,
            defaultValue: null
        },
        {
            "name": "returnType",
            "type": "string",
            "useNull": true,
            defaultValue: null
        },
        {
            "name": "originalOrderId",
            "type": "string",
            "useNull": true,
            defaultValue: null
        },
        {
            "name": "returnOrderId",
            "type": "string",
            "useNull": true,
            defaultValue: null
        },
        {
            "name": "availableActions",
            "type": "auto",
            "useNull": true,
            defaultValue: []
        },
        {
            "name": "status",
            "type": "string",
            "useNull": true,
            defaultValue: null
        },
        {
            "name": "items",
            "type": "auto",
            "useNull": true,
            defaultValue: []
        },
        {
            "name": "rmaNote",
            "type": "string",
            "useNull": true,
            defaultValue: null
        },
        {
            "name": "payments",
            "type": "auto",
            "useNull": true,
            defaultValue: []
        },
        {
            "name": "refundAmount",
            "type": "number",
            "useNull": true,
            defaultValue: null
        },
        {
            "name": "productLossAmount",
            "type": "number",
            "useNull": true,
            defaultValue: null
        },
        {
            "name": "shippingLossAmount",
            "type": "number",
            "useNull": true,
            defaultValue: null
        },
        {
            "name": "totalLossAmount",
            "type": "number",
            "useNull": true,
            defaultValue: null
        },
        {
            "name": "rmaDeadline",
            "type": "date",
            "useNull": true,
            defaultValue: null,
            dateFormat: 'c'
        },
        {
            "name": "createDate",
            "type": "date",
            "useNull": true,
            defaultValue: null,
            dateFormat: 'c'
        },
        {
            "name": "updateDate",
            "type": "date",
            "useNull": true,
            defaultValue: null,
            dateFormat: 'c'
        }
    ],

    getItems: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.ReturnItem',
            associationKey: 'items',
            foreignProperty: 'return'
        });
    },
    getPayments: function () {
        var store = this.getOrCreateHasManyStore({
            model: 'Taco.model.OrderPayment',
            associationKey: 'payments',
            foreignProperty: 'return',
        });
        store.filter({
            filterFn: function (payment) {
                return 'New' !== payment.get("status");
            }
        });
        return store;
    },


    proxy: {
        type: 'ajaxproxy',
        api: {
            // read: '/admin/Scripts/app/mocks/orders.json',
            read: '/admin/app/return/list',
            create: '/admin/app/return/create',
            update: '/admin/app/return/edit'
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
    },


    performAction: function (action, config) {
        var me = this;
        if (config.success) {
            config.success2 = config.success;
            config.scope2 = config.scope;
        }
        if (config.failure) {
            config.failure2 = config.failure;
            config.scope2 = config.scope;
        }
        Ext.apply(config, {
            jsonData: {
                actionName: action,
                returnIds: [this.getId()]
            },
            success: function (response) {
                var json = Ext.decode(response.responseText, true);
                if (json.items && json.items.length) {
                    me.set(json.items[0]);
                    me.commit();
                }
                if (config.success2) {
                    config.success2.apply(config.scope2 || me, arguments);
                }

            },
            failure: function (response, options) {
                var json = Ext.decode(response.responseText, true),
                    msg;
                if (config.failure2) {
                    config.failure2.apply(config.scope2 || me, [response, options, json]);
                } else {
                    msg = json && json.message ? json.message : 'Error performing action:  ' + action;
                    Taco.app.fireEvent('setmessage', msg, 'error');
                }
            },
            url: '/admin/app/return/action',
            method: "POST"

        });

        Ext.Ajax.request(config);
    },

    refundPayments: function (cfg) {
        Ext.Ajax.request({
            url: '/admin/app/return/refundPayments',
            method: 'POST',
            jsonData: {
                returnId: cfg.returnId,
                refunds: cfg.refunds
            },
            success: function (response) {
                var json = Ext.decode(response.responseText, true);

                if (json.items) {
                    this.set(json.items);
                    this.commit();
                }
                if (cfg.callback) cfg.callback.call(cfg.scope || this, this, null, true);
                if (cfg.success) cfg.success.call(cfg.scope || this, this);
            },
            failure: function (response, options) {
                var json = Ext.decode(response.responseText, true),
                    msg;

                if (cfg.failure) {
                    cfg.failure.call(cfg || this, response, options, json);
                } else {
                    msg = json && json.message ? json.message : 'Error creating refunds';
                    Taco.app.fireEvent('setmessage', msg, 'error');
                }

                if (cfg.callback) cfg.callback.call(cfg.scope || this, this, null, false);
            },
            scope: this
        });
    },


    createStoreCredit: function (cfg) {
        Ext.Ajax.request({
            url: '/admin/app/return/createStoreCredit',
            method: 'POST',
            jsonData: {
                returnId: cfg.returnId,
                amount: cfg.amount
            },
            success: function (response) {
                var json = Ext.decode(response.responseText, true);

                if (json.items) {
                    this.set(json.items);
                    this.commit();
                }
                if (cfg.callback) cfg.callback.call(cfg.scope || this, this, null, true);
                if (cfg.success) cfg.success.call(cfg.scope || this, this);
            },
            failure: function (response, options) {
                var json = Ext.decode(response.responseText, true),
                    msg;

                if (cfg.failure) {
                    cfg.failure.call(cfg || this, response, options, json);
                } else {
                    msg = json && json.message ? json.message : 'Error creating refunds';
                    Taco.app.fireEvent('setmessage', msg, 'error');
                }

                if (cfg.callback) cfg.callback.call(cfg.scope || this, this, null, false);
            },
            scope: this
        });
    },

    /**
        * service call to resend a return email
        * @param {Object} config  A configuration object     
        * config object:
        * 
           {
               jsonData: {
                   orderId: '987654321',               
               }
           }

        *
        */
    resendEmail: function (config) {
        Ext.apply(config, {
            url: '/admin/app/return/email/resend',
            method: 'POST'
        });

        // add in boilerplate error handling code;
        config.errorMsg = config.errorMsg || 'Error resending email';
        this.addErrorHandling(config);
        Ext.Ajax.request(config);
    }
});
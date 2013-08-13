/**
 * @class Taco.model.Order
 */
Ext.define('Taco.model.Return', {
    extend: 'Taco.core.data.Model',
    requires: ['Taco.model.ReturnItem', 'Taco.model.OrderPayment'],
   
    fields: [
        {
            "name": "id",
            "type": "string",
            "useNull": true
        },
        {
            "name": "availableActions",
            "type": "auto",
            "useNull": true,
            defaultValue: []

        },
        {
            "name": "returnNumber",
            "type": "int",
            "useNull": true,
            defaultValue: null
        }, {
            "name": "originalOrderId",
            "type": "string",
            "useNull": true,
            defaultValue: null
        }, {
            "name": "returnOrderId",
            "type": "string",
            "useNull": true,
            defaultValue: null
        }, {
            "name": "status",
            "type": "string",
            "useNull": true,
            defaultValue: null
        }, {
            "name": "items",
            "type": "auto",
            "useNull": true,
            defaultValue: null
        }, {
            "name": "notes",
            "type": "auto",
            "useNull": true,
            defaultValue: null
        },
         {
             "name": "rmaDeadline",
             "type": "date",
             "useNull": true,
             defaultValue: null
         },
        {
            "name": "updateDate",
            "type": "date",
            "useNull": true,
            defaultValue: null
        },
        {
            "name": "createDate",
            "type": "date",
            "useNull": true,
            defaultValue: null
        },
        
         {
             "name": "type",
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
             "name": "totalLossAmount",
             "type": "number",
             "useNull": true,
             defaultValue: null
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
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.OrderPayment',
            associationKey: 'payments',
            foreignProperty: 'return'
        });
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
        Ext.applyIf(config, {
            jsonData : {
                actionName: action,
                returnIds:[this.getId()]
            },
            success: function(response){
                var json = Ext.decode(response.responseText, true);
                if (json.items && json.items.length) {
                    me.set(json.items[0]);
                    me.commit();
                }
                if (config.success2) {
                    config.success2.apply(config.scope2 || me, arguments);
                }
                
            },
            failure:function (response, options) {
                var json = Ext.decode(response.responseText, true),
                    msg;
                if (config.failure2) {
                    config.failure2.apply(config.scope2 || me, [response, options, json]);
                } else {
                    msg = json && json.Message ? json.Message : 'Error performing action:  ' + action;
                    Taco.app.fireEvent('setmessage', msg, 'error');
                }
            },
            url: '/admin/app/return/action',
            method: "POST"
            
        });

        Ext.Ajax.request(config);
    },
    
    performPaymentAction: function ( payment, config) {
        var me = this;
        if (config.success) {
            config.success2 = config.success;
            config.scope2 = config.scope;
        }
        if (config.failure) {
            config.failure2 = config.failure;
            config.scope2 = config.scope;
        }
        Ext.applyIf(config, {
            jsonData:payment,
            success: function(response){
                var json = Ext.decode(response.responseText, true);
                if (json.items && json.items.length) {
                    me.set(json.items[0]);
                    me.commit();
                }
                if (config.success2) {
                    config.success2.apply(config.scope2 || me, arguments);
                }
                
            },
            failure:function (response, options) {
                var json = Ext.decode(response.responseText, true),
                    msg;
                if (config.failure2) {
                    config.failure2.apply(config.scope2 || me, [response, options, json]);
                } else {
                    msg = json && json.Message ? json.Message : 'Error Adding Payment '
                    Taco.app.fireEvent('setmessage', msg, 'error');
                }
            },
            url: '/admin/app/return/paymentAction',
            method: "POST"
            
        });

        Ext.Ajax.request(config);
    },
    
    
    

});
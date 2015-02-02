/**
 * @class Taco.model.StoreCredit
 */
Ext.define('Taco.model.StoreCredit', {
    extend: 'Taco.core.data.Model',
    idProperty: 'code',
    fields: [{
            name: 'code',
            type: 'string'
        }, {
            name: 'activationDate',
            type: 'date',
            dateFormat: 'c'
        },
        {
            name: 'initialBalance',
            type: 'string'
        },
        {
            name: 'issuedBy',
            type: 'string'
        },
        {
            name: 'expirationDate',
            type: 'date',
            dateFormat: 'c'
        },
        {
            name: 'creditType',
            type: 'string',
            defaultValue: 'StoreCredit'
        },
        {
            name: 'customerId',
            type: 'int',
            useNull: true,
            defaultValue: null
        },
        {
            name: 'modifiedDate',
            type: 'date',
            dateFormat: 'c'
        },
        {
            name: 'currentBalance',
            type: 'float'
        },
        {
            name: 'email',
            type: 'bool'
        },
        {
            name: 'customer',
            type: []
        },
        {
            name: 'amtToApply',
            type: 'float',
            defaultValue: 0
        },
        {
            name: 'remainderToAccount',
            type: 'boolean'
        },
        {
            name: 'currencyCode',
            type:'string'
        }
    ],

    canBeApplied: function() {
        var now = new Date().getTime();
        return this.get('expirationDate') > now && this.get('activationDate') < now && this.get('currentBalance'() > 0);
    },

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/customer/credits/list',
            create: '/admin/app/customer/credits/create',
            update: '/admin/app/customer/credits/edit',
            destroy: '/admin/app/customer/credits/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        }
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
            url: '/admin/app/customer/resendcreditcreatedemail',
            method: 'POST'
        });

        // add in boilerplate error handling code;
        config.errorMsg = config.errorMsg || 'Error resending email';
        this.addErrorHandling(config);
        Ext.Ajax.request(config);
    },
    resendEmail: function (config) {
        var me = this,
            config = config || {},
            url = '/admin/app/customer/resendcreditcreatedemail',
            confirmTpl = config.confirmTpl || new Ext.XTemplate([
                '<p>Successfully resent e-mail</p>'
            ]),
            confirmData = config.confirmData || me.data,
            confirmSuccess = config.confirmSuccess || true,
            msg,
            confirmFn = Ext.emptyFn;

        Ext.apply(config, {
            method: 'POST',
            code: config.code|| me.getId(),
            url: url
        });
        
        if (confirmSuccess) {
            confirmFn = function () {
                msg = confirmTpl.apply(confirmData);
                Taco.MessageBox.show({
                    title: 'Resend E-mail',
                    buttons: Ext.Msg.OK,
                    msg: msg
                });
            }
        }


        if (config.success) {            
           confirmFn = Ext.Function.createInterceptor(config.success, confirmFn)
        }

        Ext.apply(config, {
            success: confirmFn
        });

        
        // add in boilerplate error handling code;
        config.errorMsg = config.errorMsg || 'Error resending email';
        this.addErrorHandling(config);
        
        Ext.Ajax.request(config);
    }
});
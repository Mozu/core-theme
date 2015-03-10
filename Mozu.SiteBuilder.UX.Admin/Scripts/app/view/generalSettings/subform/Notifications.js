/**
 * @class Taco.view.generalSettings.subform.Notifications
 * @author Birdley Friemel
 * @date 6/10/2013 - Initial Employment
 *
 */

Ext.define('Taco.view.generalSettings.subform.Notifications', {
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    title: 'Notifications',
    margin: "0 0 20 0",
    ui: "subform",
    width: "100%",
  
    initComponent: function() {

        var emailSettings = this.record.get('supressedEmailTransactions') || {};

        this.defaults = {
            width: "100%",
            product: this.product,
            productInCatalogInfo: this.productInCatalogInfo,
            labelAlign: 'top',
            labelSeparator: '',
            persistChangesToModel: true
        };

        this.items = [{
            xtype: 'textfield',
            fieldLabel: 'Sender e-mail',
            validator: 'email',
            required: true,
            allowBlank: false,
            name: 'senderEmailAddress'
        }, {
            xtype: 'textfield',
            fieldLabel: 'Sender e-mail alias',
            required: false,
            name: 'senderEmailAlias'

        }, {
            xtype: 'textfield',
            validator: 'email',
            required: true,
            allowBlank: false,
            minLength: 3,
            fieldLabel: 'Reply-to e-mail',
            name: 'replyToEmailAddress'
        }, {
            xtype: 'fieldcontainer',
            fieldLabel: 'Enable Mozu Transactional Emails',
            items: [{
                xtype: 'component',
                html: [
                    'Mozu is configured to automatically send emails for all of the following transactions.<br>',
                    'These emails can be disabled to allow third-party applications to manage them.'
                ]
            }, {
                xtype: 'container',
                layout: 'hbox',
                items: [{
                    xtype: 'container',
                    items: [{
                        xtype: 'fieldcontainer',
                        defaults: {
                            xtype: 'checkbox'
                        },
                        fieldLabel: 'Orders',
                        items: [{
                            boxLabel: 'Your Order Has Shipped',
                            checked: !emailSettings.orderShipped,
                            name: 'emailSettings.orderShipped'
                        }, {
                            boxLabel: 'Order Confirmation',
                            checked: !emailSettings.orderChanged,
                            name: 'emailSettings.orderChanged'
                        }, {
                            boxLabel: 'Refund Created',
                            checked: !emailSettings.refundCreated,
                            name: 'emailSettings.refundCreated'
                        }]
                    }, {
                        xtype: 'fieldcontainer',
                        defaults: {
                            xtype: 'checkbox'
                        },
                        fieldLabel: 'Shoppers',
                        items: [{
                            boxLabel: 'Welcome',
                            checked: !emailSettings.shopperLoginCreated,
                            name: 'emailSettings.shopperLoginCreated'
                        }, {
                            boxLabel: 'Password Reset',
                            checked: !emailSettings.shopperPasswordReset,
                            name: 'emailSettings.shopperPasswordReset'
                        }]
                    }]
                }, {
                    xtype: 'container',
                    margin: '0 0 0 24',
                    items: [{
                        xtype: 'fieldcontainer',
                        defaults: {
                            xtype: 'checkbox'
                        },
                        fieldLabel: 'Returns',
                        items: [{
                            boxLabel: 'Return Created',
                            checked: !emailSettings.returnCreated,
                            name: 'emailSettings.returnCreated'
                        }, {
                            boxLabel: 'Return Authorized',
                            checked: !emailSettings.returnAuthorized,
                            name: 'emailSettings.returnAuthorized'
                        }, {
                            boxLabel: 'Return Request Rejected',
                            checked: !emailSettings.returnRejected,
                            name: 'emailSettings.returnRejected'
                        }, {
                            boxLabel: 'Return Has Been Updated',
                            checked: !emailSettings.returnUpdated,
                            name: 'emailSettings.returnUpdated'
                        }, {
                            boxLabel: 'Return Closed',
                            checked: !emailSettings.returnClosed,
                            name: 'emailSettings.returnClosed'
                        },
                        //{
                        //    boxLabel: 'Return Cancelled',
                        //    checked: !emailSettings.returnCancelled,
                        //    name: 'emailSettings.returnCancelled'
                        //}
                        ]
                    }, {
                        xtype: 'fieldcontainer',
                        defaults: {
                            xtype: 'checkbox'
                        },
                        fieldLabel: 'Miscellaneous',
                        items: [{
                            boxLabel: 'Back in Stock',
                            checked: !emailSettings.backInStock,
                            name: 'emailSettings.backInStock'
                        }, {
                            boxLabel: 'Store Credit Created',
                            checked: !emailSettings.storeCreditCreated,
                            name: 'emailSettings.storeCreditCreated'
                        },
                        //{
                        //    boxLabel: 'Store Credit Updated',
                        //    checked: !emailSettings.storeCreditUpdated,
                        //    name: 'emailSettings.storeCreditUpdated'
                        //},
                        {
                            boxLabel: 'Gift Card Created',
                            checked: !emailSettings.giftCardCreated,
                            name: 'emailSettings.giftCardCreated'
                        }]
                    }]
                }]
            }, {
                
            }]
        }];

        this.callParent(arguments);
    },

    beforeSave: function() {
        var emailSettings = {};

        Ext.each(this.query('checkbox[name^=emailSettings.]'), function(field) {
            emailSettings[field.name.replace('emailSettings.', '')] = field.getValue() ? null : true;
        });

        this.record.set('supressedEmailTransactions', emailSettings);
        
        this.callParent(this);
    }
});

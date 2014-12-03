/**
 * @class Taco.view.generalSettings.subform.Notifications
 * @author Bradley Friemel
 * @date 6/10/2013
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

        this.defaults = {
            // width: 200,
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
        }];

        this.callParent(arguments);
    }
});

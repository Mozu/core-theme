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
    width:"100%",
    //bodyCls: Taco.baseCSSPrefix + 'product-admin-subform',
    //cls: Taco.baseCSSPrefix + 'form-section',
    initComponent: function () {
        var me = this;
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
            allowBlank:false,
            name: 'senderEmailAddress'/*,
            value: me.settings.senderEmail*/
        }, {
            xtype: 'textfield',
            validator: 'email',
            required: true,
            allowBlank: false,
            minLength: 3,
            fieldLabel: 'Reply-to e-mail',
            name: 'replyToEmailAddress'/*,
            
            value: me.settings.replyToEmail*/
        }];

        this.callParent(arguments);
    }
});
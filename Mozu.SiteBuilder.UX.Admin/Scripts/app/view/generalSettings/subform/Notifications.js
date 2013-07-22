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
    bodyCls: Taco.baseCSSPrefix + 'product-admin-subform',
    cls: Taco.baseCSSPrefix + 'form-section',
    initComponent: function () {
        var me = this;
        this.defaults = {
            width: 200,
            product: this.product,
            productInSiteInfo: this.productInSiteInfo,
            labelAlign: 'top',
            labelSeparator: '',
            persistChangesToModel: true
        };

        this.items = [{
            xtype: 'textfield',
            fieldLabel: 'Sender e-mail',
            validator: 'email',
            required: true ,
            name: 'senderEmail'/*,
            value: me.settings.senderEmail*/
        }, {
            xtype: 'textfield',
            validator: 'email',
            required: true ,
            allowBlank: false,
            minLength: 3,
            fieldLabel: 'Reply-to e-mail',
            name: 'replyToEmail'/*,
            
            value: me.settings.replyToEmail*/
        }];

        this.callParent(arguments);
    }
});
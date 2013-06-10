/**
 * @class Taco.view.generalSettings.subform.Notifications
 * @author Bradley Friemel
 *
 */

Ext.define('Taco.view.generalSettings.subform.Notifications', {
    extend: 'Taco.view.product.subform.Subform',
    requires: [],
    title: 'Notifications',
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
            name: 'senderEmail'/*,
            value: me.settings.senderEmail*/
        }, {
            xtype: 'textfield',
            fieldLabel: 'Reply-to e-mail',
            name: 'replyToEmail'/*,
            value: me.settings.replyToEmail*/
        }];

        this.callParent(arguments);
    }
});
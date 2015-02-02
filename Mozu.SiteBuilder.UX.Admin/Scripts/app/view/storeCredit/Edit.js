Ext.define('Taco.view.storeCredit.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.storeCredit.Form'
    ],
    formCls: 'Taco.view.storeCredit.Form',
    initComponent: function () {    
        this.additionalActions = [{
            xtype: 'button',
            ui: 'action',
            scale: "medium",
            itemId: 'resendmail',
            text: 'Resend Email',
            margin: '0 10 0 00',
            hidden:this.record.phantom,
            handler: this.resendEmail,
            scope: this
        }];

        this.callParent(arguments);
    },
    resendEmail: function () {
        this.record.resendEmail({
            success: function () {
                debugger;
            }
        });
    }
});
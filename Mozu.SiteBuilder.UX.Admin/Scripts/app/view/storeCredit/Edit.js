Ext.define('Taco.view.storeCredit.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.storeCredit.Form',
        'Taco.core.ux.form.ResendEmailButton'
    ],
    formCls: 'Taco.view.storeCredit.Form',
    enableSearchBarInHeader: false,
    initComponent: function () {
        var me = this;

        //this.additionalActions = [{
        //    xtype: 'resendemailbutton',
        //    margin: '0 10 0 0',                        
        //    emailUrl: '/admin/app/customer/resendcreditcreatedemail',
        //    jsonData: {
        //        code: this.record.getId()
        //    },
        //    hidden: this.record.phantom
        //}];

        this.callParent(arguments);
    },
    parentTitleCfg: {
        title: 'Store Credits',
        controller: 'storecredits'
    },
});
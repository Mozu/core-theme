/**
 * @class Taco.core.ux.form.ResendEmailButton
 * Button that resends email and gives feedback when complete;
 */
Ext.define('Taco.core.ux.form.ResendEmailButton', {
    extend: 'Ext.button.Button',    
    alias: 'widget.resendemailbutton', 
    ui: 'action',
    scale: "medium",

    //itemId: 'resendEmailButton',
    text: 'Resend Email',

    // required;
    emailUrl: null,

    // required
    jsonData: {},

    confirmTpl : new Ext.XTemplate([
        '<p>Successfully resent e-mail</p>'
    ]),

    confirmData: {},

    // 
    showSuccessMessage: true,

    errorMsg: "Error resending e-mail",
    
    activeMenuItem : null,

    initComponent: function () {
        var me = this;
        if (me.menu) {

        } else {
            if (!me.jsonData || !me.emailUrl) {
                throw "Taco.core.ux.form.ResendEmailButton:  jsonData and emailUrl are requrired configuration members"
                return;
            }
        }
        
        if (me.menu) {
            me.menu.listeners = me.menu.listeners || {};
            Ext.apply(me.menu.listeners, {
                'click': function (menu, menuItem, evt) {
                    var config = {};

                    if (menuItem.emailUrl) {
                        config.url = menuItem.emailUrl
                    }

                    if (menuItem.jsonData) {
                        config.jsonData = Ext.clone(menuItem.jsonData)
                    }

                    me.activeMenuItem = config
                    me.sendEmail();
                },
                scope: me
            });
        } else {
            this.mon(me, 'click', me.sendEmail);
        }
        
        this.callParent(arguments);
    },
    
    onSendEmail : Ext.emptyFn,

    getRequestConfig: function () {
        var me = this,
            config = {
                method: 'POST',
                jsonData: me.jsonData,
                url: me.emailUrl,
                scope: me,
                failure: me.onFailure,
                success: me.onSuccess
            };

        if (me.activeMenuItem) {
            Ext.apply(config, me.activeMenuItem);
        }

        return config
    },

    sendEmail: function (button, evt) {
        var me = this,
            config;
        if (me.fireEvent('beforesendemail', me) !== false) {
            me.onSendEmail();
            config = me.getRequestConfig();
            Ext.Ajax.request(config);
        }
    },

    onSuccess: function (response) {
        var me = this;        

        var json = Ext.decode(response.responseText, true);
        if (!json || !json.success) {
            var msg = (me.errorMsg) ? me.errorMsg : "Error";
            Taco.app.fireEvent('setmessage', msg, 'error');
            return;
        }

        if (me.showSuccessMessage) {
            me.doConfirmSuccess();
        }
    },

    onFailure: function (response) {        
        var me = this,
            json = Ext.decode(response.responseText, true),
            msg = (json && json.message) ? json.message : (me.errorMsg) ? me.errorMsg : "Error";

        Taco.app.fireEvent('setmessage', msg, 'error');
    },

    doConfirmSuccess: function () {
        var me = this,
            msg = me.confirmTpl.apply(me.confirmData);
        
        Ext.MessageBox.show({
            title: 'Resend E-mail',
            // pushes the buttons to the right to be consistant with our dialog ux.
            rightJustifyButtons: true,
            // reverses the order of the buttons
            reverseOrder: true,
            msg: msg,
            closable: true,
            buttons: Ext.Msg.OK
        });
    }
});
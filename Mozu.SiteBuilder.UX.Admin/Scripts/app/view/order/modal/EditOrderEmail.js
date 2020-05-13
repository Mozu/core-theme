
/**
 * @class Taco.view.order.modal.EditOrderEmail
 */

Ext.define('Taco.view.order.modal.EditOrderEmail', {
    extend: 'Taco.core.ux.window.Modal',
   

    autoShow: true,
    scale: 'small',
    title: 'Edit Order Email Address',

    initComponent: function () {
        this.form = Ext.widget(Ext.apply(Ext.create('Taco.core.ux.form.Form', {
            layout: {
                type: 'hbox'
            },
            defaults: {
                margin: '0 20 0 0',
                width: '100%'
            },
            items: [{
                xtype: 'textfield',
                name: 'email',
                fieldLabel: 'Email',
                value: this.record.getData().email,
                data: this.record.getData()
            }]
        })));


        this.items = [this.form];

        this.callParent(arguments);

    },
    doSave: function () {
        var me = this,
            data = this.form.getValues();

        var email = data.email;
        if (email && !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            Taco.app.fireEvent('setmessage', 'Validation error. Email is not formatted correctly', 'error');
            return;
        }


        me.setLoading({
            msg: "Saving"
        }, me.body);
        
        this.record.updateEmailAddress({
            jsonData: this.record.getData(),
            success: function (response) {
                me.setLoading(false, me.body);
                var json = Ext.decode(response.responseText, true),
                    data;

                if (!json) { return }
                
                data = json.items;
                me.record.set(data);
                me.saveSuccess(me.record);
            },
            failure: function () {
                me.setLoading(false, me.body);
            }
        }, data.email);
    }
});

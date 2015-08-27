/**
 * @class Taco.view.order.modal.EditTrackingNumber
 */
Ext.define('Taco.view.order.modal.EditTrackingNumber', {
    extend: 'Taco.core.ux.window.Modal',

    autoShow: true,
    scale: 'small',
    title: 'Enter Tracking Number',

    initComponent: function (eOpts) {
        var me = this,
            trackingNumber = this.packageData.trackingNumber || '';

        this.form = Ext.create('Taco.core.ux.form.Form', {
            requireDirty: true,
            layout: {
                type: 'auto'
            },
            items: [{
                xtype: 'textfield',
                name: 'trackingNumber',
                itemId : 'trackingNumber',
                fieldLabel: 'Tracking Number',
                required: false,
                value: trackingNumber,
                width: '100%'
            }]
        });

        this.items = [this.form];
        
        this.callParent(arguments);

        this.on({        
            show: {
                scope: this,
                fn: function () {
                    var field = this.down('#trackingNumber');

                    if (field && field.rendered) {
                        field.focus(true, 10);
                    }
                }
            }
        });
    },

    doSave: function () {
        var me = this,
            basic = this.form.getForm(),
            trackingNumber = basic.findField('trackingNumber').getValue();

        this.packageData.trackingNumber = trackingNumber;

        //Taco.app.viewPort.setLoading(true);

        me.setLoading({
            msg: "Saving"
        }, me.body);

        this.record.changeTrackingNumber({
            jsonData: [this.packageData],
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                me.setLoading(false, me.body);

                if (!json || !json.success) {
                    return;
                };
                
                this.record.reload();
                me.saveSuccess(json);
            },
            failure: function (response) {
                me.setLoading(false, me.body);
            },
            scope: this
        });
    }
});

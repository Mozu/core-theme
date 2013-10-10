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
            save: {
                scope: this,
                fn: 'save'
            },
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

    save: function () {
        var me = this,
            basic = this.form.getForm(),
            trackingNumber = basic.findField('trackingNumber').getValue();

        this.packageData.trackingNumber = trackingNumber;

        Taco.app.viewPort.setLoading(true);

        this.record.changeTrackingNumber({
            jsonData: [this.packageData],
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);

                if (!json || !json.success) {
                    // service didnt' return data properly
                    Taco.app.viewPort.setLoading(false);
                    
                    var errorDialog = Ext.create('Taco.core.ux.window.Alert', {
                        html: 'Error saving tracking number.'
                    });
                    errorDialog.show();
                    
                    return;
                }
                
                this.record.reload();
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.Message) ? json.Message : 'Error saving tracking number.';
                
                Taco.app.viewPort.setLoading(false);
                var errorDialog = Ext.create('Taco.core.ux.window.Alert', {
                    html: msg
                });
                errorDialog.show();
            },
            scope: this
        });
    }
});

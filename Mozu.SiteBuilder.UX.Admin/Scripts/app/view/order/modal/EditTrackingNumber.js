/**
 * @class Taco.view.order.modal.EditTrackingNumber
 */
Ext.define('Taco.view.order.modal.EditTrackingNumber', {
    extend: 'Taco.core.ux.modal.Modal',
    requires: [
    
    ],
    cls: Taco.baseCSSPrefix + 'order-modal',
    autoShow: true,
    destroyOnHide:true,
    width: 700,

    initComponent: function (eOpts) {
        var me = this;
        
        var trackingNumber = this.packageData.trackingNumber || "";

        this.formpanel = Ext.create('Ext.form.Panel', {
            xtype: 'formpanel',
            layout: { type: 'auto' },
            defaults: {
                xtype: 'textfield',
                labelSeparator: '',
                labelAlign: 'top',
                width: 644
            },
            items: [{
                name: 'trackingNumber',
                xtype: 'textfield',
                fieldLabel: 'Tracking Number',
                itemId : "trackingNumber",
                required: false,
                value: trackingNumber,
                width: 120
            }]
        });

        this.content = {
            xtype: 'container',
            items: [
                {
                    xtype: 'component',
                    autoEl: {
                        tag: 'h2',
                        cls: 'order-modal-title',
                        html: 'Enter Tracking Number'
                    }
                },
                this.formpanel
            ]
        };

        this.dirtyButton = Ext.create('Taco.core.ux.action.DirtyButton', {
            xtype: 'dirtybutton',
            text: 'Save',
            onClick: function() {
                me.save();
            }
        });

        this.actions = {
            xtype: 'container',
            items: [this.dirtyButton, {
                xtype: 'action',
                text: 'Cancel',
                onClick: function () {
                    me.hide();
                }
            }]
        };
        
        this.callParent(arguments);

        this.formpanel.on({
            afterlayout: function (view) {
                // preselect and focus on the first field in the form panel
                
                view.down('#trackingNumber').focus(true, 10);
            },
            dirtychange: {
                fn: function (form, dirty) {
                    this.dirtyButton.setDirty(true);
                }
            },
            scope: this
        });
    },
    
    save: function () {
        var me = this,
            fm = this.formpanel.getForm();

        var fm = this.formpanel.getForm();
        var trackingNumber = fm.findField("trackingNumber").getValue();


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
                    
                    var errorDialog = Ext.create('Taco.core.ux.modal.Alert', {
                        text: "Error saving tracking number."
                    });
                    errorDialog.show();
                    
                    return;
                }
                
                this.record.reload();
                me.hide();
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.Message) ? json.Message : "Error saving tracking number.";
                
                Taco.app.viewPort.setLoading(false);
                var errorDialog = Ext.create('Taco.core.ux.modal.Alert', {
                    text: msg
                });
                errorDialog.show();
            },
            scope: this
        });
    }
});
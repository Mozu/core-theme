/**
 * @class Taco.view.order.modal.IssueCredit
 */
Ext.define('Taco.view.order.modal.IssueCredit', {
    extend: 'Taco.core.ux.modal.Modal',
    requires: [
      //  'Taco.model.PaymentReference',
      //  'Taco.model.Shipment'
    ],
    cls: Taco.baseCSSPrefix + 'order-modal',
    autoShow: true,
    destroyOnHide:true,
    width: 700,
//    data: {},
//    field: '',
    initComponent: function (eOpts) {
        var me = this;

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
                name: 'amount',
                xtype: "currencyfield",
                fieldLabel: 'Amount',
                itemId : "amount",
                required: true,
                maxValue : this.record.get("amountCollected"),
                width: 120
            }, {
                name: 'reason',
                fieldLabel: 'Reason',
                xtype:"textarea"
            }],
            listeners: {
                /*
                // simeon - not sure why this was in the class I patterned this code after. Removing until I determine its value.
                afterrender: function (panel) {
                    Ext.destroy(panel.getLayout().clearEl);
                }
                */
            }
        });

        this.content = {
            xtype: 'container',
            items: [
                {
                    xtype: 'component',
                    autoEl: {
                        tag: 'h2',
                        cls: 'order-modal-title',
                        html: 'Issue Credit'
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

        
        //this.formpanel.loadRecord(this.record);
        var fm = this.formpanel.getForm();
        fm.findField("amount").setValue(this.record.get("amountCollected"));

        this.callParent(arguments);


        this.formpanel.on({
            afterlayout: function (view) {
                // preselect and focus on the first field in the form panel
                view.down('#amount').focus(true,10);
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
            fm = this.formpanel.getForm(),
            cfg = fm.getValues();
        

        Ext.apply(cfg, {
            payment: this.record.getData()
        });

        this.record.issueCredit({
            jsonData: cfg,
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    Ext.message("error saving credit");
                    
                    var errorDialog = Ext.create('Taco.core.ux.modal.Alert', {
                        text: "Error saving credit"
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
                    msg = (json && json.Message) ? json.Message : "Error saving credit";
                
                var errorDialog = Ext.create('Taco.core.ux.modal.Alert', {
                    text: msg
                });
                errorDialog.show();
            },
            scope: this
        });
    }
});
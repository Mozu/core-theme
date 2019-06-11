/**
 * @class Taco.view.order.modal.EditTrackingNumberNew
 */
Ext.define('Taco.view.order.modal.EditTrackingNumberNew', {
    extend: 'Taco.core.ux.window.Modal',

    autoShow: true,
    scale: 'medium',
    title: 'Enter Tracking Number',
    //height: 400,
    //width: 500,
    initComponent: function (eOpts) {
        var me = this,
            trackingNumber = this.packageData.trackingNumber || '';

        this.form = Ext.create('Taco.core.ux.form.Form', {
            requireDirty: true,
            width: 500,
            height: 500,

            layout: {
                type: 'auto'
            },
            items: [
                {
                    xtype: 'combobox',
                    name: 'selectCarrier',
                    width: 270,
                    itemId: 'selectCarrier',
                    //valueField: 'reasonCode',
                    //displayField: 'reasonCode',
                    fieldLabel: 'Select Carrier',
                    queryMode: 'local',
                    margin: '0px 5px 0px 5px',
                    allowBlank: false,
                    editable: false,
                    forceSelection: true,
                    store: this.store,
                    listeners: {
                        change: {
                            scope: this,
                            //fn: function (combobox, newValue) {
                            //    var newRecord = combobox.findRecordByValue(newValue);
                            //    if (newRecord) {
                            //        this.down('[name=otherReason]').setVisible(newRecord.get('needsMoreInfo'));
                            //        this.down("#primaryAction").setDisabled(!this.validateModal());
                            //    }
                            //}
                        }
                    }
                },
                {
                    xtype: 'textfield',
                    name: 'trackingNumber',
                    itemId: 'trackingNumber',
                    fieldLabel: 'Tracking Number',
                    required: false,
                    value: trackingNumber,
                    width: 270,
                },
                {
                    xtype: 'combobox',
                    name: 'transitTime',
                    width: 270,
                    itemId: 'transitTime',
                    //valueField: 'reasonCode',
                    //displayField: 'reasonCode',
                    fieldLabel: 'Transit Time',
                    queryMode: 'local',
                    margin: '0px 5px 0px 5px',
                    allowBlank: false,
                    editable: false,
                    forceSelection: true,
                    store: this.store,
                    listeners: {
                        change: {
                            scope: this,
                            //fn: function (combobox, newValue) {
                            //    var newRecord = combobox.findRecordByValue(newValue);
                            //    if (newRecord) {
                            //        this.down('[name=otherReason]').setVisible(newRecord.get('needsMoreInfo'));
                            //        this.down("#primaryAction").setDisabled(!this.validateModal());
                            //    }
                            //}
                        }
                    }
                },
                {
                    xtype: 'datefield',
                    name: 'shipDate',
                    altFormats: "c",
                    fieldLabel: 'Ship Date',
                    width: 270
                },
            ]
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

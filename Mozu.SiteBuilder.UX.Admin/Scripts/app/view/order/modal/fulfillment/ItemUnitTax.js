/**
 * @class Taco.view.product.Modal
 */

Ext.define('Taco.view.order.modal.fulfillment.ItemUnitTax', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.TextField',
    ],

    autoShow: true,
    closeAction: 'destroy',
    primaryText: 'Save',
    scale: 'large',
    title: 'Unit Tax',
    isRecordSaved: false,
    layout: {
        type: 'fit'
    },

    viewConfig: {
        unittax: false,
    },

    

    initComponent: function () {
        console.log(this.originalQuantity);
        this.fieldContainer = Ext.create('Ext.form.FieldContainer', {
            name: 'unittaxeditor',
            monitorValid: true,
            width: '100%',
            items:
                [
                    {
                        xtype: 'container',
                        layout: 'vbox',
                        width: '100%',
                        defaults: {
                            style: {
                                margin: '0 20 0 0'
                            }
                        },
                        items:
                            [
                                {
                                    xtype: 'numberfield',
                                    width: 110,
                                    name: 'UnitTaxPercent',
                                    itemId: 'unittaxpercent',
                                    hideTrigger: true,
                                    allowBlank: false,
                                 
                                    value:
                                        this.originalQuantity,
                                    //this.originalQuantity ? (this.originalQuantity - this.record.data.quantity)
                                    //    : this.record.data.quantity,
                                    minValue: 1,
                                    maxValue: this.originalQuantity || this.record.data.quantity,
                                    validateOnChange: true,
                                    margin: '0px 5px 0px 5px',
                                    mouseWheelEnabled: false,
                                    fieldLabel: '$',
                                    listeners: {
                                        change: {
                                            scope: this,
                                            fn: function (field, value) {
                                                if (value > 0)
                                                    this.unittaxpercent = true;
                                            }
                                       }
                                    }
                                },
                                {
                                    xtype: 'numberfield',
                                    width: 270,
                                    itemid: 'UnitTaxDollar',
                                    name: 'UnitTaxDollar',
                                    hideTrigger: true,
                                    margin: '0px 5px 0px 5px',
                                    fieldLabel: '%',
                                    hidden: false,
                                    disabled: this.unittaxpercent,
                                    //listeners: {
                                    //    change: {
                                    //        scope: this,
                                    //        fn: function (field, value) {
                                    //            //    this.down("#primaryAction").setDisabled(!this.validateModal());
                                    //        }
                                    //    }
                                    //}
                                }
                            ]
                    }
                ],
            scope: this
        }, this);

        this.items = [this.fieldContainer];

        this.callParent(arguments);

    },

    validateModal: function () {
        //verify quantity is not null and less than 0 and should not be greater than max quantity
        var unittax = this.down('#cancelQuantity').getValue();

        if (!quantity || quantity <= 0 || quantity > (this.originalQuantity || this.record.data.quantity))
            return false;

        //verify cancel reason should be filled
        var reason = (this.down('#cancelReason').getValue() === 'Other'
            ? this.down('#otherReason').getValue()
            : this.down('#cancelReason').getValue());

        if (!reason)
            return false;

        return true;
    },

    getEditItemQuantityPayload: function () {
        var me = this;
        var order = this.record;
        var reason = this.down('#cancelReason').getValue();
        var description = (this.down('[name=otherReason]').isVisible() ?
            this.down('#otherReason').getValue() : null);

        return {
            orderId: order.get('taco.model.order_id'),
            orderItemId: order.get('id'),
            quantity: this.down('#cancelQuantity').getValue(),
            reason: {
                reasonCode: reason,
                description: description
            }
        };
    },

    doSave: function () {

        if (this.validateModal()) {
            var me = this;

            Ext.MessageBox.show({
                title: 'Unit Tax',
                // pushes the buttons to the right to be consistant with our dialog ux.
                rightJustifyButtons: true,
                // reverses the order of the buttons
                reverseOrder: true,
                msg: 'Are you certain you want to Cancel this item?',
                closable: false,
                buttons: Ext.Msg.YESNO,
                fn: function (val) {
                    if (val === 'yes') {

                        me.close();
                    }
                }
            });
        }
    },
    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy: function (destroy) {
        if (!this.isRecordSaved && this.originalQuantity)
            this.record.set('quantity', this.originalQuantity);
        this.callParent(arguments);
    }
});
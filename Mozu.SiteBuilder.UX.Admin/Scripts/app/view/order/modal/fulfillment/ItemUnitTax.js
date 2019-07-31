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
    primaryText: 'Update',
    scale: 'large',
    title: 'Unit Tax',
    isRecordSaved: false,
    unitTaxPerc: 0,
    layout: {
        type: 'fit'
    },

    viewConfig: {
        unittax: false,
    },

    initComponent: function () {
        var me = this;
        
        this.fieldContainer = Ext.create('Ext.form.FieldContainer', {
            name: 'unittaxeditor',
            monitorValid: true,
            width: '100%',
            items:
                [
                    {
                        xtype: 'container',
                        layout: 'hbox',
                        width: '100%',
                        cls: 'taco-order-fulfillment-ItemUnitTax',
                        data: me.record,
                        defaults: {
                            style: {
                                margin: '0 20 0 0'
                            }
                        },
                        items:
                            [
                                {
                                    html: '<div class="inner-addon left-addon left-box"> <span class="icon">%</span> <input id="unitTaxPerc" type="number" placeholder="" value="' + me.unitTaxPerc +'"></div>'
                                },
                                {
                                    html: '<div style="padding: 10px;">Or</div>'
                                },
                                {
                                    html: '<div class="inner-addon left-addon left-box"> <span class="icon">$</span> <input type="number" placeholder="" class="doller" id="itemTaxDoller" value="' + me.selectedItem.itemTax +'"></div>'
                                }
                            ]
                    }
                ],
            scope: this
        }, this);

        this.items = [this.fieldContainer];

        this.callParent(arguments);
    },

    //validateModal: function () {
    //    //verify quantity is not null and less than 0 and should not be greater than max quantity
    //    var unittax = this.down('#cancelQuantity').getValue();

    //    if (!quantity || quantity <= 0 || quantity > (this.originalQuantity || this.record.data.quantity))
    //        return false;

    //    //verify cancel reason should be filled
    //    var reason = (this.down('#cancelReason').getValue() === 'Other'
    //        ? this.down('#otherReason').getValue()
    //        : this.down('#cancelReason').getValue());

    //    if (!reason)
    //        return false;

    //    return true;
    //},

    getEditItemQuantityPayload: function () {
        var me = this;
        var order = this.record;        
        var unitTaxPerc = Ext.get('unitTaxPerc').dom.value;
        return {
            unitTaxPerc: unitTaxPerc,
        };
    },

    doSave: function () {
        var me = this;
        me.fireEvent('udpateTax', me.getEditItemQuantityPayload());
        me.close();
    },
    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy: function (destroy) {
        if (!this.isRecordSaved && this.originalQuantity)
            this.record.set('quantity', this.originalQuantity);
        this.callParent(arguments);
    },

    calculateUnitTax: function (originalQty, enteredQty) {
        Ext.getCmp('unittaxpercent').setValue((2 * enteredQty) / 100);
    },

    percentageChanged: function (enteredQty) {
        Ext.getCmp('unittaxdoller').setValue((2 * enteredQty) / 100);
    }
});
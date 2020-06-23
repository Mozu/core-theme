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
    primaryText: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Buttons.update,
    scale: 'large',
    title: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Title.item_tax,
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
        this.setAdjustmentInputId();
        this.calculatedUnitTaxPerc();
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
                                    html: '<div class="inner-addon left-addon left-box"> <span class="icon">%</span> <input id="' + this.unitTaxAdjustmentPercInput + '" type="number" min="0" max="100" placeholder="" value="' + this.unitTaxPerc + '"></div>'
                                },
                                {
                                    html: '<div style="padding: 10px;">Or</div>'
                                },
                                {
                                    html: '<div class="inner-addon left-addon left-box"> <span class="icon">$</span> <input type="number" placeholder="" required class="doller" id="' + this.unitTaxAdjustmentInput + '" value="' + me.selectedItem.itemTax + '"></div>'
                                }
                            ],
                        listeners: {
                            afterrender: {
                                fn: function (obj) {
                                    me.bindEventsForTextBoxes();
                                },
                                scope: me
                            },
                        }
                    }
                ],
            scope: this
        }, this);

        this.items = [this.fieldContainer];
        this.callParent(arguments);
    },

    setAdjustmentInputId: function () {
        this.unitTaxAdjustmentInput = Ext.id();
        this.unitTaxAdjustmentPercInput = Ext.id();
    },

    getEditUnitTaxPayload: function () {
        var me = this;
        var unitTax = Ext.get(this.unitTaxAdjustmentInput).dom.value;
        return {
            unitTax: unitTax
        };
    },

    doSave: function () {
        var me = this;
        me.fireEvent('udpateTax', me.getEditUnitTaxPayload());
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

    bindEventsForTextBoxes: function () {
        var me = this;
        var element = Ext.get(this.unitTaxAdjustmentInput);
        var originalPrice = (this.selectedItem.overridePrice !== null && parseInt(this.selectedItem.overridePrice) > 0) ? this.selectedItem.overridePrice : this.selectedItem.actualPrice;
        if (element) {
            element.on('keyup', function () {
                me.setCalculatedUnitTax(this.unitTaxAdjustmentInput, originalPrice, false, this.unitTaxAdjustmentPercInput);
            }, this);
        };

        element = Ext.get(this.unitTaxAdjustmentPercInput);
        if (element) {
            element.on('keyup', function () {
                me.setCalculatedUnitTax(this.unitTaxAdjustmentPercInput, originalPrice, true, this.unitTaxAdjustmentInput);
            }, this);
        };
    },

    setCalculatedUnitTax: function (elementId, originalPrice, isPercentage, targetElementId) {
        var element = Ext.get(elementId);
        var calcValue = 0;
        if (element) {
            var enteredValue = parseFloat(Ext.get(elementId).getValue());

            if (enteredValue == 0 || enteredValue) {
                if (isPercentage) {
                    calcValue = (originalPrice * enteredValue) / 100;
                }
                else {
                    calcValue = (100 * enteredValue) / originalPrice;
                }

                Ext.get(targetElementId).dom.value = calcValue;
            }
        }
    },

    calculatedUnitTaxPerc: function () {
        this.unitTaxPerc = 0;
        var originalPrice = (this.selectedItem.overridePrice !== null && parseInt(this.selectedItem.overridePrice) > 0) ? this.selectedItem.overridePrice : this.selectedItem.actualPrice;
        if (this.selectedItem.itemTax > 0) {
            this.unitTaxPerc = (100 * this.selectedItem.itemTax) / originalPrice;
        }
    }
});
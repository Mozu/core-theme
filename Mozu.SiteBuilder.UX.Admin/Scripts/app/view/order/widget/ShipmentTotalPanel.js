/**
 * @class Taco.view.order.widget.ShipmentTotalPanel
 * panel for display of subtotal, discounts, shipping, tax, and order total
 * used in the OrderDetail
 * This is the readonly version for display.
 * see ShipmentTotalPanelEditable.js for the editable subClass used in the orderDetailEditor.
 */

Ext.define('Taco.view.order.widget.ShipmentTotalPanel', {
    extend: 'Ext.container.Container',

    layout: {
        type: 'hbox',
        align: 'stretch',
        pack: 'end'
    },

    defaults: { xtype: "component" },

    config: {
        record: null,
        /**
         * data from the order     
         */
        data: null,

        /**
         * width of the row total column in the associated order item grid. this keeps the labels and values aligned with the associated grid;   
         */
        totalColumnWidth: 100
    },

    isEditable: false,

    /**
    * width of the actions column in the associated order item grid. this keeps the labels and values aligned with the associated grid;   
    */
    actionColumnWidth: 64,

    initComponent: function (eOpts) {
        var me = this;
        me.cls = 'shipmentform-detail-totalpanel x-grid-row';

        this.initUI();
        me.callParent(arguments);
    },

    initUI: function () {
        this.items = [];

        var me = this,
            isEditable = me.isEditable;



        this.masterTableId = Ext.id();
        this.totalsContainer = Ext.widget({
            xtype: 'container',
            //padding: '0 20 10 20',
            layout: {
                type: 'vbox',
                align: 'right'
            },
            items: [
                {
                    xtype: 'container',
                    hidden: me.isShipmentAction(),
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            html: '<h3>' + (this.shipmentRecord.shipmentStatus.toLowerCase() == 'bopis' ? 'Store Pickup Total' : 'Shipment Total') + '</h3>',
                            flex: 2,
                            margin: '8 400 0 0'
                        },
                        Ext.widget('button', {
                            itemId: 'cancelShipmentTotals',
                            ui: 'action',
                            scale: 'medium',
                            text: 'Cancel',
                            flex: 1,
                            hidden: !me.isEditable,
                            handler: function (evt) {
                                me.toggleEdit();
                            }
                        }),
                        Ext.widget('button', {
                            itemId: 'saveShipmentTotals',
                            ui: 'action-primary',
                            scale: 'medium',
                            text: 'Save',
                            flex: 1,
                            hidden: !me.isEditable,
                            margin: {
                                left: 10,
                                right: 70
                            },
                            handler: function (evt) {
                                me.updateShipmentAdjustments();
                            }
                        }),
                        Ext.widget('button', {
                            itemId: 'editShipmentTotals',
                            ui: 'action',
                            scale: 'medium',
                            text: 'Edit',
                            flex: 1,
                            hidden: me.isEditable,
                            margin: {
                                left: 10,
                                right: 70
                            },
                            handler: function (evt) {
                                me.toggleEdit();
                            }
                        }),
                    ]
                },
                {
                    xtype: 'container',
                    layout: {
                        type: 'vbox',
                        align: 'right'
                    },
                    items: [
                        {
                            html: '<div id="' + me.masterTableId + '"></div>'
                        }
                    ]
                }
            ],
            listeners: {
                afterrender: function (obj) {
                    me.getMasterTable();
                }
            }
        });

        this.items.push(this.totalsContainer);
        this.setAdjustmentInputId();
    },

    isShipmentAction: function () {
        if (this.shipmentRecord.shipmentStatus.toLowerCase() == 'fulfilled' || this.shipmentRecord.shipmentStatus.toLowerCase() == 'canceled')
            return true;
        return false;
    },

    setAdjustmentInputId: function () {

        this.shippingAdjustmentInput = Ext.id();

        this.shippingTaxAdjustmentInput = Ext.id();
        this.shippingTaxAdjustmentPercInput = Ext.id();

        this.handlingAdjustmentInput = Ext.id();

        this.handlingTaxAdjustmentInput = Ext.id();
        this.handlingTaxAdjustmentPercInput = Ext.id();

        this.taxAdjustmentInput = Ext.id();
        this.taxAdjustmentPercInput = Ext.id();
    },

    applyRecord: function (record) {
        this.masterTable.update(record.getData());
        this.initSummaryToggleButtons();
        return record;
    },

    getMasterTable: function () {
        var me = this;

        //var minHeight = (me.isEditable ? 500 : 300);
        if (me.masterTable)
            Ext.getCmp(me.masterTable.id).destroy();

        me.masterTable = Ext.create("Ext.Component", {
            minHeight: 200,
            width: 700,
            layout: {
                type: 'hbox',
                align: 'right'
            },
            renderTo: Ext.get(me.masterTableId),
            //data: me.record.getData(),
            data: me.shipmentRecord,
            tpl: me.getMasterTemplate(),
            listeners: {
                boxready: {
                    fn: function (obj) {
                        me.initSummaryToggleButtons();
                    },
                    scope: me
                },
                afterrender: {
                    fn: function (obj) {
                        me.bindEventsForTextBoxes();
                    },
                    scope: me
                },
            }
        });
        //Ext.get(me.masterTableId).setHeight(minHeight);
        return me.masterTable;
    },

    bindEventsForTextBoxes: function () {
        var me = this;
        //Shipping
        var el = Ext.get(this.shippingAdjustmentInput);
        if (el) {
            el.on('keyup', function () { me.setCalculatedSummaryValues(this.shippingAdjustmentInput, '.shipping', this.shipmentRecord.shippingSubtotal, false); }, this);
        };

        //Shipping Tax
        el = Ext.get(this.shippingTaxAdjustmentInput);
        if (el) {
            el.on('keyup', function () { me.setCalculatedSummaryValues(this.shippingTaxAdjustmentInput, '.shipping-tax', this.shipmentRecord.shippingSubtotal, false, this.shippingTaxAdjustmentPercInput, this.shipmentRecord.shippingTaxTotal); }, this);
        };
        el = Ext.get(this.shippingTaxAdjustmentPercInput);
        if (el) {
            el.on('keyup', function () { me.setCalculatedSummaryValues(this.shippingTaxAdjustmentPercInput, '.shipping-tax', this.shipmentRecord.shippingSubtotal, true, this.shippingTaxAdjustmentInput, this.shipmentRecord.shippingTaxTotals); }, this);
        };

        //Handling
        el = Ext.get(this.handlingAdjustmentInput);
        if (el) {
            el.on('keyup', function () { me.setCalculatedSummaryValues(this.handlingAdjustmentInput, '.handling', this.shipmentRecord.handlingSubtotal, false); }, this);
        };

        //Handling Tax
        el = Ext.get(this.handlingTaxAdjustmentInput);
        if (el) {
            el.on('keyup', function () { me.setCalculatedSummaryValues(this.handlingTaxAdjustmentInput, '.handling-tax', this.shipmentRecord.handlingSubtotal, false, this.handlingTaxAdjustmentPercInput, this.shipmentRecord.handlingTaxTotal); }, this);
        };
        el = Ext.get(this.handlingTaxAdjustmentPercInput);
        if (el) {
            el.on('keyup', function () { me.setCalculatedSummaryValues(this.handlingTaxAdjustmentPercInput, '.handling-tax', this.shipmentRecord.handlingSubtotal, true, this.handlingTaxAdjustmentInput, this.shipmentRecord.handlingTaxTotal); }, this);
        };

        //Tax
        el = Ext.get(this.taxAdjustmentInput);
        if (el) {
            el.on('keyup', function () { me.setCalculatedSummaryValues(this.taxAdjustmentInput, '.tax', this.shipmentRecord.lineItemTaxTotal, false, this.taxAdjustmentPercInput); }, this);
        };
        el = Ext.get(this.taxAdjustmentPercInput);
        if (el) {
            el.on('keyup', function () { me.setCalculatedSummaryValues(this.taxAdjustmentPercInput, '.tax', this.shipmentRecord.lineItemTaxTotal, true, this.taxAdjustmentInput); }, this);
        };

    },

    setCalculatedSummaryValues: function (elementId, summarycls, originalValue, isPercentage, subElementId, defaultValue) {
        var el = Ext.get(elementId);
        var calcValue = 0;
        if (el) {
            var enteredValue = parseFloat(Ext.get(elementId).getValue());
            if (this.validateNumber(enteredValue)) {
                if (enteredValue) {
                    if (isPercentage)
                        calcValue = (originalValue * enteredValue) / 100;
                    else
                        calcValue = enteredValue;

                    this.masterTable.el.dom.querySelector(summarycls + ' .summary-price div').innerHTML = this.record.formatCurrency(calcValue);
                }
                else {
                    this.masterTable.el.dom.querySelector(summarycls + ' .summary-price div').innerHTML = this.record.formatCurrency(defaultValue || originalValue);
                }

                //clear sub element
                if (subElementId && calcValue)
                    if (isPercentage)
                        Ext.get(subElementId).dom.value = calcValue.toFixed(2);
                    else if (originalValue != 0)
                        Ext.get(subElementId).dom.value = ((calcValue / originalValue) * 100).toFixed(2);
            }
        }
    },

    validateNumber: function (value) {
        var validNumber = new RegExp(/^\d*\.?\d*$/);
        return validNumber.test(value)
    },

    initToggleButton: function (selector, handler) {
        var me = this;

        if (me.el) {
            var summary = me.el.down(selector);
            if (summary && summary.dom.children.length <= 0) {
                Ext.widget({
                    xtype: "button",
                    cls: 'summary-toggle',
                    padding: '6px 0px 5px 6px',
                    renderTo: summary,
                    width: 30,
                    // right arrow
                    glyph: (this.isEditable ? "XE92A@mozicons" : "XE927@mozicons"),
                    ui: 'action',
                    scale: 'small',
                    handler: handler,
                    scope: me
                });
            }
        }
    },

    toggleEdit: function () {
        if (this.isEditable) {
            this.isEditable = false;
            this.totalsContainer.items.items[0].items.get('saveShipmentTotals').hide();
            this.totalsContainer.items.items[0].items.get('cancelShipmentTotals').hide();
            this.totalsContainer.items.items[0].items.get('editShipmentTotals').show();
            this.masterTable.setHeight(200);
        }
        else {
            this.isEditable = true;
            this.totalsContainer.items.items[0].items.get('saveShipmentTotals').show();
            this.totalsContainer.items.items[0].items.get('cancelShipmentTotals').show();
            this.totalsContainer.items.items[0].items.get('editShipmentTotals').hide();
            this.masterTable.setHeight(380);
        }
        this.doLayout();
        this.getMasterTable();
    },

    initSummaryToggleButtons: function () {

        var me = this;

        me.initToggleButton(".shipping-summary", me.toggleShippingDetails);
        me.initToggleButton(".shipping-tax-summary", me.toggleShippingTaxDetails);
        me.initToggleButton(".tax-summary", me.toggleTaxDetails);
        me.initToggleButton(".handling-summary", me.toggleHandlingDetails);
        me.initToggleButton(".handling-tax-summary", me.toggleHandlingTaxDetails);

    },

    toggleAdjustmentDetails: function (btn, e) {

        this.handleToggle(btn, '.adjustment');

    },

    toggleShippingDetails: function (btn, e) {

        this.handleToggle(btn, '.shipping');

    },

    toggleShippingTaxDetails: function (btn, e) {
        this.handleToggle(btn, '.shipping-tax');
    },

    toggleHandlingDetails: function (btn, e) {

        this.handleToggle(btn, '.handling');

    },

    toggleHandlingTaxDetails: function (btn, e) {

        this.handleToggle(btn, '.handling-tax');

    },

    toggleTaxDetails: function (btn, e) {

        this.handleToggle(btn, '.tax');

    },

    handleToggle: function (btn, selector) {
        var me = this,
            selector = ".pricing-detail-collapsable" + selector,
            el = this.masterTable.el.down(selector),
            isCollapsed = (el.hasCls("collapsed"));

        if (isCollapsed) {
            el.removeCls("collapsed")
            // down arrow
            btn.setGlyph("XE92A");
        } else {
            el.addCls("collapsed");
            // right arrow
            btn.setGlyph("XE927");
        }

        me.update();
    },

    getShippingAdjustmentsPayload: function () {
        var me = this;
        var taxAdjustmentValue = me.getValueOf(this.taxAdjustmentInput);
        var shippingAdjustmentValue = me.getValueOf(this.shippingAdjustmentInput);
        var shippingTaxAdjustmentValue = me.getValueOf(this.shippingTaxAdjustmentInput);
        var handlingAdjustmentValue = me.getValueOf(this.handlingAdjustmentInput);
        var handlingTaxAdjustmentValue = me.getValueOf(this.handlingTaxAdjustmentInput);

        if (taxAdjustmentValue || shippingAdjustmentValue || shippingTaxAdjustmentValue || handlingAdjustmentValue || handlingTaxAdjustmentValue)
            return {
                "orderId": this.record.get('id'),
                "shipmentNumber": this.shipmentRecord.number,
                "shipmentAdjustment": {                    
                    //ItemAdjustment: this.shippingAdjustmentInput ? this.shippingAdjustmentInput : null,
                    itemTaxAdjustment: taxAdjustmentValue ? (parseFloat(taxAdjustmentValue) - this.shipmentRecord.lineItemTaxTotal) : null,
                    shippingAdjustment: shippingAdjustmentValue ? (parseFloat(shippingAdjustmentValue) - this.shipmentRecord.shippingSubtotal) : null,
                    shippingTaxAdjustment: shippingTaxAdjustmentValue ? (parseFloat(shippingTaxAdjustmentValue) - this.shipmentRecord.shippingTaxTotal) : null,
                    handlingAdjustment: handlingAdjustmentValue ? (parseFloat(handlingAdjustmentValue) - this.shipmentRecord.handlingSubtotal) : null,
                    handlingTaxAdjustment: handlingTaxAdjustmentValue ? (parseFloat(handlingTaxAdjustmentValue) - this.shipmentRecord.handlingTaxTotal) : null
                }
            }
    },

    getValueOf: function (elementId) {
        return Ext.get(elementId).getValue();
    },

    updateShipmentAdjustments: function () {
        var me = this;
        me.setLoading(true, this.body);
        var payloadData = me.getShippingAdjustmentsPayload();

        this.record.updateShipmentAdjustments({
            jsonData: payloadData,
            success: function (response) {
                me.setLoading(false, this.body);
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    Taco.app.fireEvent('setmessage', 'Error while updating shipment totals', 'error');
                    return;
                }
                Taco.app.fireEvent('setmessage', "Shipment totals updated Successfully", 'success');
                me.fireEvent('shipmentRefresh');
            },
            failure: function (response) {
                me.setLoading(false, this.body);
                // error handling here
                Taco.app.fireEvent('setmessage', 'Error while updating shipment totals', 'error');
            },
            scope: me
        });
    },

    isShipmentAction: function () {
        if (this.shipmentRecord.shipmentStatus.toLowerCase() == 'fulfilled' || this.shipmentRecord.shipmentStatus.toLowerCase() == 'canceled')
            return true;
        return false;
    },

    tableStartTpl: new Ext.XTemplate(
        '<table class="x-grid-table x-grid-with-row-lines {isEditableCls} {classNames}" border="0" cellspacing="0" cellpadding="0" style="width:90%; margin-left: auto;">',
        // todo make this dynamic and pulls from grid header to get correct widths;
        '<colgroup><col class="" style="width:30px;text-align:left"></colgroup>',
        '<colgroup><col class="" style="text-align:left"></colgroup>',
        '<colgroup><col class="" style="width:100px;text-align:right"></colgroup>',
        '<colgroup><col class="" style="width:165px;text-align:right"></colgroup>',
        '<colgroup><col class="" style="width:{actionColumnWidth}px;"></colgroup>'
    ),

    /**
     *   The first section of XTemplate that precedes the order adjustment row;
     */
    subTpl_1: new Ext.XTemplate(
        '<tpl for="orderDiscounts">',
        '<tr class="adjustment-item discount ', '<tpl if="!isActive">suppressed<tpl else>active</tpl>', '">',
        '<td class="{parent.tdCls}"></td>',
        '<td class="{parent.tdCls}"><div class="{parent.tdInnerCls}">Order Discount: {description}</div></td>',
        '<td class="{parent.tdCls}"><div class="{parent.priceCls} {parent.tdInnerCls} negative-currency">({[this.getCurrencyFormat(values.total)]})</div></td>',
        '<td class="{parent.tdCls}"></td>',
        '<td class="x-action-col-cell taco-menu-col-cell x-action-col-celladjustment-cell{parent.tdCls}">',
        '<div unselectable="on" isActive="{isActive}" discountId="{discountId}"  action="processDiscount"',
        'class="order-action-icon discount-', '<tpl if="isActive">suppress<tpl else>activate</tpl>', '">',
        '</div>',
        '</td>',
        '</tr>',
        '</tpl>'
    ),

    /**
     *   The second section of XTemplate that is after the order adjustment row and before the shipping adjustment row;
    */
    subTpl_2: new Ext.XTemplate(
        '<tpl if="handlingAmount !== 0">',
        '<tr class="shipping-handling-item">',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"><div class="{tdInnerCls}">Order Handling Fee</div></td>',
        '<td class="{tdCls}"><div class="{priceCls} {tdInnerCls}">{[this.getCurrencyFormat(values.handlingAmount)]}</div></td>',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',
        '</tpl>',

        '<tpl for="handlingDiscounts">',
        '<tr class="shipping-handling-item discount ', '<tpl if="!isActive">suppressed<tpl else>active</tpl>', '">',
        '<td class="{tdCls}"></td>',
        '<td class="{parent.tdCls}"><div class="{parent.tdInnerCls}">Order Handling Fee Discount</div></td>',
        '<td class="{parent.tdCls}"><div class="{parent.priceCls} {parent.tdInnerCls} negative-currency">({[this.getCurrencyFormat(values.total)]})</div></td>',
        '<td class="{parent.tdCls}"></td>',
        '<td class="{parent.tdCls}"></td>',
        '</tr>',
        '</tpl>',

        '<tpl for="lineItemHandlingFees">',
        '<tr class="shipping-handling-item itemhandlingfees">',
        '<td class="{tdCls}"></td>',
        '<td class="{parent.tdCls}"><div class="{parent.tdInnerCls}">Line {lineId} Handling Fee</div></td>',
        '<td class="{parent.tdCls}"><div class="{parent.priceCls} {parent.tdInnerCls}">{[this.getCurrencyFormat(values.fee)]}</div></td>',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',
        '</tpl>'
    ),

    /**
     *   The third section of XTemplate that is after the shipping adjustment row
    */
    subTpl_3: new Ext.XTemplate(
        '<tpl if="values.lineItemTaxAdjustment !== 0">',
        '<tr class="shipping-handling-item">',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"><div itemId="taxAdjustmentLabel" class="{tdInnerCls}">Manual Tax Adjustment</div></td>',
        '<td class="{tdCls}"><div itemId="taxAdjustmentField" class="{priceCls} {tdInnerCls} {[ (values.lineItemTaxAdjustment < 0) ? "negative-currency" : "" ]}">{[ this.getCurrencyFormat(values.lineItemTaxAdjustment)]}</div></td>',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',
        '</tpl>'
    ),

    subTpl_4: new Ext.XTemplate(
        '<tr class="subtotalrow">',
        '<th><div></div></th>',
        '<th class="summary"><div class="{tdInnerCls}">Tax</div></th>',
        '<th></th>',
        '<th class="summary-price"><div class="{tdInnerCls}">{[this.getCurrencyFormat(values.lineItemTaxTotal)]}</div></th>',
        '<th></th>',
        '</tr>'
    ),

    subTpl_5: new Ext.XTemplate(
        '<div class="{tdInnerCls} {[ (values.adjustmentTotal < 0) ? "negative-currency" : "" ]}">{[this.getCurrencyFormat(values.adjustmentTotal)]}</div>'
    ),

    subTpl_6: new Ext.XTemplate(
        '<tr class="subtotalrow">',
        '<th></th>',
        '<th class="summary"><div class="{tdInnerCls}">Sub Total</div></th>',
        '<th></th>',
        '<th class="summary-price"><div class="{tdInnerCls}">{[this.getCurrencyFormat(values.lineItemSubtotal)]}</div></th>',
        '<th></th>',
        '</tr>'
    ),

    subTpl_7: new Ext.XTemplate(
        '<div class="{tdInnerCls}">{[this.getCurrencyFormat(values.shippingSubtotal)]}</div>'
    ),

    subTpl_10: new Ext.XTemplate(

        '<div class="{tdInnerCls}">{[this.getCurrencyFormat(values.handlingSubtotal)]}</div>'

    ),

    subTpl_8: new Ext.XTemplate(

        '<tpl if="shippingMethodName || shippingDiscounts.length &gt; 0 || lineItemShippingDiscounts.length &gt; 0 || shippingAdjustment.amount !== 0">',

        '<tpl if="shippingMethodName">',
        '<tr class="shipping-handling-item">',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}" colspan=><div class="{tdInnerCls}">Order Shipping Fee<tpl if="values.shippingMethodName">: {shippingMethodName}</tpl></div></td>',
        '<td class="{tdCls}"><div class="{priceCls} {tdInnerCls}">{[this.getCurrencyFormat(values.shippingAmountBeforeDiscountsAndAdjustments)]}</div></td>',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',
        '</tpl>',

        '<tpl for="lineItemShippingDiscounts">',
        '<tr class="shipping-handling-item lineitemdiscount">',
        '<td class="{tdCls}"></td>',
        '<td class="{parent.tdCls}"><div class="x-grid-cell-inner {parent.tdInnerCls}">Line {lineId} Shipping Discount: {name}</div></td>',
        '<td class="{parent.tdCls}"><div class="{parent.priceCls} {parent.tdInnerCls} negative-currency">({[this.getCurrencyFormat(values.fee)]})</div></td>',
        '<td class="{parent.tdCls}"></td>',
        '<td class="{parent.tdCls}"></td>',
        '</tr>',
        '</tpl>',

        '<tpl for="shippingDiscounts">',
        '<tr class="shipping-handling-item discount ',
        '<tpl if="!isActive">suppressed<tpl else>active</tpl>',
        '">',
        '<td class="{tdCls}"></td>',
        '<td class="{parent.tdCls}"><div class="{parent.tdInnerCls}">Shipping Discount: {description}</div></td>',
        '<td class="{parent.tdCls}"><div class="{parent.priceCls} {parent.tdInnerCls} negative-currency">({[this.getCurrencyFormat(values.total)]})</div></td>',
        '<td class="x-action-col-cell taco-menu-col-cell x-action-col-celladjustment-cell{parent.tdCls}">',
        '<div unselectable="on" isActive="{isActive}" discountId="{discountId}"  action="processDiscount"',
        'class="order-action-icon discount-', '<tpl if="isActive">suppress<tpl else>activate</tpl>', '">',
        '</div>',
        '</td>',
        '</tr>',
        '</tpl>',
        '</tpl>'
    ),

    subTpl_9: new Ext.XTemplate(

        '<tr class="totalrow" >',
        '<th></th>',
        '<th class="summary"><div class="{tdInnerCls}"></div></th>',
        '<th></th>',
        '<th class="summary-price"><div class="{tdInnerCls}">{[this.getCurrencyFormat(values.total)]}</div></th>',
        '<th></th>',
        '</tr>'

    ),

    /**
    * The main xTemplate that initializes the view. It will load the 7 subTemplates and create the dom needed for the orderAjustment ui and the shippingAdjustment ui.
    * Note: the master template is only rendered once because the orderAjustment and shipping adjusment contain extjs components; 
    * THE SUBTEMPLATES WILL RERENDER AFTER EVERY UPDATE OF THE ORDER RECORD;
    */
    getMasterTemplate: function () {
        var me = this,
            tdCls = "taco-grid-cell ",
            tdInnerCls = "taco-grid-cell-inner ",
            priceCls = "price-detail ",
            isEditable = this.isEditable,
            isBopis = this.shipmentRecord.shipmentType == 'BOPIS' ? true : false,
            isEditableCls = (isEditable) ? " taco-editable " : " collapsed ";
        
        if (!isEditable)
            return [
                '{%',
                // add some css classes to the values data to be used in xTemplates
                'values.tdCls = "' + tdCls + '";values.tdInnerCls = "' + tdInnerCls + '";values.isEditableCls = "' +
                isEditableCls + '";values.actionColumnWidth = "' + me.actionColumnWidth + '";values.priceCls = "' + priceCls + '";values.isEditable = "' + isEditable + '";',
                '%}',
                // subtotal
                '{[this.getSubTpl("tableStartTpl", values)]}',

                '<thead itemId="taco-subTpl_6">',
                '{[this.getSubTpl("subTpl_6", values)]}',
                '</thead>',

                '</table>',

                // shipping
                '{[this.getSubTpl("tableStartTpl", values, {classNames:"pricing-detail-collapsable shipping"})]}',

                '<thead>',
                '<tr class="subtotalrow">',
                //'<th><div class="{[ (values.shippingSubtotal != 0 ) ? "shipping-summary" : "" ]}"></div></th>',
                '<th><div class=""></div></th>',
                '<th class="summary"><div class="{tdInnerCls}">Shipping</div></th>',
                '<th></th>',

                '<th class="summary-price" itemId="taco-subTpl_7">',
                '{[this.getSubTpl("subTpl_7", values)]}',
                '</th>',

                '<th></th>',
                '</tr>',
                '</thead>',

                //'<tbody>',
                //'<tpl if="values.shippingAdjustment !== 0">',
                //'<tr class="shipping-handling-item">',
                //'<td class="{tdCls}"></td>',
                //'<td class="{tdCls}"><div itemId="shippingAdjustmentLabel" class="{tdInnerCls}">Manual Shipping Adjustment</div></td>',
                //'<td class="{tdCls}"><div itemId="shippingAdjustmentField" class="{priceCls} {tdInnerCls} {[ (values.shippingAdjustment < 0) ? "negative-currency" : "" ]}">{[ this.getCurrencyFormat(values.shippingAdjustment)]}</div></td>',
                //'<td class="{tdCls}"></td>',
                //'<td class="{tdCls}"></td>',
                //'</tr>',
                //'</tpl>',
                //'</tbody>',

                '</table>',

                // shipping Tax
                '{[this.getSubTpl("tableStartTpl", values, {classNames:"pricing-detail-collapsable shipping-tax"})]}',

                '<thead>',
                '<tr class="subtotalrow">',
                //'<th><div class="{[ (values.shippingTaxTotal != 0 ) ? "shipping-tax-summary" : "" ]}"></div></th>',
                '<th><div class=""></div></th>',
                '<th class="summary"><div class="{tdInnerCls}">Shipping Tax</div></th>',
                '<th></th>',

                '<th class="summary-price">',
                '<div class="{tdInnerCls}">{[this.getCurrencyFormat(values.shippingTaxTotal)]}</div>',
                '</th>',

                '<th></th>',
                '</tr>',
                '</thead>',

                //'<tbody>',
                //'<tpl if="values.shippingTaxAdjustment !== 0">',
                //'<tr class="shipping-handling-item">',
                //'<td class="{tdCls}"></td>',
                //'<td class="{tdCls}"><div itemId="shippingTaxAdjustmentLabel" class="{tdInnerCls}">Manual Shipping Tax Adjustment</div></td>',
                //'<td class="{tdCls}"><div itemId="shippingTaxAdjustmentField" class="{priceCls} {tdInnerCls} {[ (values.shippingTaxAdjustment < 0) ? "negative-currency" : "" ]}">{[ this.getCurrencyFormat(values.shippingTaxAdjustment)]}</div></td>',
                //'<td class="{tdCls}"></td>',
                //'<td class="{tdCls}"></td>',
                //'</tr>',
                //'</tpl>',
                //'</tbody>',

                '</table>',


                // handling
                '{[this.getSubTpl("tableStartTpl", values, {classNames:"pricing-detail-collapsable handling"})]}',

                '<thead>',
                '<tr class="subtotalrow">',
                //'<th><div class="{[ (values.handlingSubtotal != 0 ) ? "handling-summary" : "" ]}"></div></th>',
                '<th><div class=""></div></th>',
                '<th class="summary"><div class="{tdInnerCls}">Handling</div></th>',
                '<th></th>',

                '<th class="summary-price" itemId="taco-subTpl_10">',
                '{[this.getSubTpl("subTpl_10", values)]}',
                '</th>',

                '<th></th>',
                '</tr>',
                '</thead>',


                //'<tbody>',
                //'<tpl if="values.handlingAdjustment !== 0">',
                //'<tr class="shipping-handling-item">',
                //'<td class="{tdCls}"></td>',
                //'<td class="{tdCls}"><div itemId="handlingAdjustmentLabel" class="{tdInnerCls}">Manual Handling Adjustment</div></td>',
                //'<td class="{tdCls}"><div itemId="handlingAdjustmentField" class="{priceCls} {tdInnerCls} {[ (values.handlingAdjustment < 0) ? "negative-currency" : "" ]}">{[ this.getCurrencyFormat(values.handlingAdjustment)]}</div></td>',
                //'<td class="{tdCls}"></td>',
                //'<td class="{tdCls}"></td>',
                //'</tr>',
                //'</tpl>',
                //'</tbody>',

                '</table>',

                // handling Tax
                '{[this.getSubTpl("tableStartTpl", values, {classNames:"pricing-detail-collapsable handling-tax"})]}',

                '<thead>',
                '<tr class="subtotalrow">',
                //'<th><div class="{[ (values.handlingTaxTotal != 0 ) ? "handling-tax-summary" : "" ]}"></div></th>',
                '<th><div class=""></div></th>',
                '<th class="summary"><div class="{tdInnerCls}">Handling Tax</div></th>',
                '<th></th>',

                '<th class="summary-price" itemId="taco-subTpl_10">',
                '<div class="{tdInnerCls}">{[this.getCurrencyFormat(values.handlingTaxTotal)]}</div>',
                '</th>',

                '<th></th>',
                '</tr>',
                '</thead>',


                //'<tbody>',
                //'<tpl if="values.handlingTaxAdjustment !== 0">',
                //'<tr class="shipping-handling-item">',
                //'<td class="{tdCls}"></td>',
                //'<td class="{tdCls}"><div itemId="handlingTaxAdjustmentLabel" class="{tdInnerCls}">Manual Handling Tax Adjustment</div></td>',
                //'<td class="{tdCls}"><div itemId="handlingTaxAdjustmentField" class="{priceCls} {tdInnerCls} {[ (values.handlingTaxAdjustment < 0) ? "negative-currency" : "" ]}">{[ this.getCurrencyFormat(values.handlingTaxAdjustment)]}</div></td>',
                //'<td class="{tdCls}"></td>',
                //'<td class="{tdCls}"></td>',
                //'</tr>',
                //'</tpl>',
                //'</tbody>',

                '</table>',

                // Tax
                '{[this.getSubTpl("tableStartTpl", values, {classNames:"pricing-detail-collapsable tax"})]}',

                '<thead itemId="taco-subTpl_4">',
                '{[this.getSubTpl("subTpl_4", values)]}',
                '</thead>',

                // output class level subTemplate 3.  Note: this will contain extjs xTemplates and will render with each change 
                //'<tbody itemId="taco-subTpl_3">',
                //'{[this.getSubTpl("subTpl_3", values)]}',
                //'</tbody>',

                '</table>',

                // total
                '{[this.getSubTpl("tableStartTpl", values)]}',

                '<thead itemId="taco-subTpl_9" style="font-weight:bolder">',
                '{[this.getSubTpl("subTpl_9", values)]}',
                '</thead>',

                '</table>',
                {
                    view: me,
                    getSubTpl: function (tplName, values, params) {
                        var tpl = this.view[tplName];
                        tpl.getCurrencyFormat = this.getCurrencyFormat;
                        if (params) {
                            values = Ext.apply(values, params);
                        }
                        var tplTxt = tpl.apply(values);
                        return tplTxt;
                    },
                    getCurrencyFormat: function (v) {
                        var retVal,
                            isNegative;

                        v = v - 0;

                        if (v < 0) {
                            isNegative = true;
                            v = -v;
                        }
                        v = Taco.app.context.getCurrent().formatCurrency(v);


                        if (isNegative) {
                            retVal = "(" + v + ")";
                        } else {
                            retVal = v;
                        }

                        return retVal;
                    },
                }
            ];
        else
            return [
                '{%',
                // add some css classes to the values data to be used in xTemplates
                'values.tdCls = "' + tdCls + '";values.tdInnerCls = "' + tdInnerCls + '";values.isEditableCls = "' +
                isEditableCls + '";values.actionColumnWidth = "' + me.actionColumnWidth + '";values.priceCls = "' + priceCls + '";values.isEditable = "' + isEditable + '";values.isBopis = ' + isBopis +';' +
                '%}',
                // subtotal
                '{[this.getSubTpl("tableStartTpl", values, {classNames:"pricing-detail-collapsable summary-sub-total"})]}',

                '<thead itemId="taco-subTpl_6">',
                '{[this.getSubTpl("subTpl_6", values)]}',
                '</thead>',

                '</table>',

                // shipping
                '{[this.getSubTpl("tableStartTpl", values, {classNames:"pricing-detail-collapsable shipping"})]}',

                '<thead>',
                '<tr class="subtotalrow">',
                '<th><div class="{[ (values.isBopis ) ? "" : "shipping-summary"]}"></div></th>',
                '<th class="summary"><div class="{tdInnerCls}">Shipping</div></th>',
                '<th></th>',

                '<th class="summary-price" itemId="taco-subTpl_7">',
                '{[this.getSubTpl("subTpl_7", values)]}',
                '</th>',

                '<th></th>',
                '</tr>',
                '</thead>',

                '<tpl if="!values.isBopis">',

                '<tbody>',
                '<tr class="shipping-handling-item">',
                '<td class="{tdCls}"></td>',

                '<td>',
                //'<div class="inner-addon left-addon left-box"> <span class="icon">%</span> <input type="number" id="' + me.textBoxId + '" placeholder="" /></div>',
                //'<div class="middle-box"> or </div>',
                '<div class="inner-addon left-addon right-box" style="margin-left: 12px"> <span class="icon">$</span> <input id="' + this.shippingAdjustmentInput + '" type="number" class="doller" placeholder="" /></div>',
                '</td>',

                '<td class="{tdCls}"></td>',
                '<td class="{tdCls}"></td>',
                '<td class="{tdCls}"></td>',
                '</tr>',
                '</tbody>',

                '</tpl>',

                '</table>',

                // shipping Tax
                '{[this.getSubTpl("tableStartTpl", values, {classNames:"pricing-detail-collapsable shipping-tax"})]}',

                '<thead>',
                '<tr class="subtotalrow">',
                '<th><div class="{[ (values.isBopis ) ? "" : "shipping-tax-summary"]}"></div></th>',
                '<th class="summary"><div class="{tdInnerCls}">Shipping Tax</div></th>',
                '<th></th>',

                '<th class="summary-price">',
                '<div class="{tdInnerCls}">{[this.getCurrencyFormat(values.shippingTaxTotal)]}</div>',
                '</th>',

                '<th></th>',
                '</tr>',
                '</thead>',

                '<tpl if="!values.isBopis">',
                '<tbody>',
                '<tr class="shipping-handling-item">',
                '<td class="{tdCls}"></td>',

                '<td>',
                '<div class="inner-addon left-addon left-box"> <span class="icon">%</span> <input id="' + this.shippingTaxAdjustmentPercInput + '" type="number" placeholder="" /></div>',
                '<div class="middle-box"> or </div>',
                '<div class="inner-addon left-addon right-box" style="margin-left: 12px"> <span class="icon">$</span> <input id="' + this.shippingTaxAdjustmentInput + '" type="number" class="doller" placeholder="" /></div>',
                '</td>',

                '<td class="{tdCls}"></td>',
                '<td class="{tdCls}"></td>',
                '<td class="{tdCls}"></td>',
                '</tr>',
                '</tbody>',
                '</tpl>',

                '</table>',


                // handling
                '{[this.getSubTpl("tableStartTpl", values, {classNames:"pricing-detail-collapsable handling"})]}',

                '<thead>',
                '<tr class="subtotalrow">',
                '<th><div class="{[ (values.isBopis ) ? "" : "handling-summary"]}"></div></th>',
                '<th class="summary"><div class="{tdInnerCls}">Handling</div></th>',
                '<th></th>',

                '<th class="summary-price" itemId="taco-subTpl_10">',
                '{[this.getSubTpl("subTpl_10", values)]}',
                '</th>',

                '<th></th>',
                '</tr>',
                '</thead>',

                '<tpl if="!values.isBopis">',
                '<tbody>',
                '<tr class="shipping-handling-item">',
                '<td class="{tdCls}"></td>',
                '<td>',
                //'<div class="inner-addon left-addon left-box"> <span class="icon">%</span> <input type="number" id="' + me.textBoxId + '" placeholder="" /></div>',
                //'<div class="middle-box"> or </div>',
                '<div class="inner-addon left-addon right-box" style="margin-left: 12px"> <span class="icon">$</span> <input id="' + this.handlingAdjustmentInput + '" type="number" class="doller" placeholder="" /></div>',
                '</td>',
                '<td class="{tdCls}"></td>',
                '<td class="{tdCls}"></td>',
                '<td class="{tdCls}"></td>',
                '</tr>',
                '</tbody>',
                '</tpl>',

                '</table>',

                // handling Tax
                '{[this.getSubTpl("tableStartTpl", values, {classNames:"pricing-detail-collapsable handling-tax"})]}',

                '<thead>',
                '<tr class="subtotalrow">',
                '<th><div class="{[ (values.isBopis ) ? "" : "handling-tax-summary"]}"></div></th>',
                '<th class="summary"><div class="{tdInnerCls}">Handling Tax</div></th>',
                '<th></th>',

                '<th class="summary-price" itemId="taco-subTpl_10">',
                '<div class="{tdInnerCls}">{[this.getCurrencyFormat(values.handlingTaxTotal)]}</div>',
                '</th>',

                '<th></th>',
                '</tr>',
                '</thead>',

                '<tpl if="!values.isBopis">',
                '<tbody>',
                '<tr class="shipping-handling-item">',
                '<td class="{tdCls}"></td>',
                '<td>',
                '<div class="inner-addon left-addon left-box"> <span class="icon">%</span> <input type="number" id="' + this.handlingTaxAdjustmentPercInput + '" placeholder="" /></div>',
                '<div class="middle-box"> or </div>',
                '<div class="inner-addon left-addon right-box" style="margin-left: 12px"> <span class="icon">$</span> <input id="' + this.handlingTaxAdjustmentInput + '" type="number" class="doller" placeholder="" /></div>',
                '</td>',
                '<td class="{tdCls}"></td>',
                '<td class="{tdCls}"></td>',
                '<td class="{tdCls}"></td>',
                '</tr>',
                '</tbody>',
                '</tpl>',

                '</table>',

                // Tax
                '{[this.getSubTpl("tableStartTpl", values, {classNames:"pricing-detail-collapsable tax"})]}',

                '<thead itemId="taco-subTpl_4">',
                '<tr class="subtotalrow">',
                '<th><div class="tax-summary"></div></th>',
                '<th class="summary"><div class="{tdInnerCls}">Tax</div></th>',
                '<th></th>',
                '<th class="summary-price"><div class="{tdInnerCls}">{[this.getCurrencyFormat(values.lineItemTaxTotal)]}</div></th>',
                '<th></th>',
                '</tr>',
                '</thead>',

                // output class level subTemplate 3.  Note: this will contain extjs xTemplates and will render with each change 
                '<tbody>',
                '<tr class="shipping-handling-item">',
                '<td class="{tdCls}"></td>',
                '<td>',
                '<div class="inner-addon left-addon left-box"> <span class="icon">%</span> <input id="' + this.taxAdjustmentPercInput + '" type="number" placeholder="" /></div>',
                '<div class="middle-box"> or </div>',
                '<div class="inner-addon left-addon right-box" style="margin-left: 12px"> <span class="icon">$</span> <input id="' + this.taxAdjustmentInput + '" type="number" class="doller" placeholder="" /></div>',
                '</td>',
                '<td class="{tdCls}"></td>',
                '<td class="{tdCls}"></td>',
                '<td class="{tdCls}"></td>',
                '</tr>',
                '</tbody>',

                '</table>',

                // total
                '{[this.getSubTpl("tableStartTpl", values, {classNames:"pricing-detail-collapsable summary-grand-total"})]}',

                '<thead itemId="taco-subTpl_9" style="font-weight:bolder">',
                '{[this.getSubTpl("subTpl_9", values)]}',
                '</thead>',

                '</table>',
                {
                    view: me,
                    getSubTpl: function (tplName, values, params) {
                        var tpl = this.view[tplName];
                        tpl.getCurrencyFormat = this.getCurrencyFormat;
                        if (params) {
                            values = Ext.apply(values, params);
                        }
                        var tplTxt = tpl.apply(values);
                        return tplTxt;
                    },
                    getCurrencyFormat: function (v) {
                        var retVal,
                            isNegative;

                        v = v - 0;

                        if (v < 0) {
                            isNegative = true;
                            v = -v;
                        }
                        v = Taco.app.context.getCurrent().formatCurrency(v);


                        if (isNegative) {
                            retVal = "(" + v + ")";
                        } else {
                            retVal = v;
                        }

                        return retVal;
                    },
                }
            ];
    },


    /**
     * Do any class level cleanup. Destroy and null any scoped refs.     
     */
    onDestroy: function () {
        this.callParent(arguments);
    }

});
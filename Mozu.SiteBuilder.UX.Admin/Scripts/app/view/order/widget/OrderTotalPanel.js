/**
 * @class Taco.view.order.widget.OrderTotalPanel
 * panel for display of subtotal, discounts, shipping, tax, and order total
 * used in the OrderDetail
 * This is the readonly version for display.
 * see OrderTotalPanelEditable.js for the editable subClass used in the orderDetailEditor.
 */

Ext.define('Taco.view.order.widget.OrderTotalPanel', {
    extend: 'Ext.container.Container',
    requires: ['Taco.view.order.widget.ShippingMethodMenu'],
    layout: {
        type: 'hbox',
        align: 'stretch',
        pack: 'start'
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
        me.cls = 'orderform-detail-totalpanel x-grid-row';
        this.initUI();
        me.callParent(arguments);
    },

    applyRecord: function (record) {
        this.masterTable.update(record.getData());
        this.updateShippingMethodButton(record);
        this.updateShippingMethodLabel();
        this.initSummaryToggleButtons();
        return record;
    },

    updateShippingMethodButton: function (record) {
        var me = this,
            shippingMethodButton = me.down("#shippingMethodButton");

        if (shippingMethodButton) {
            // check if there is a valid contact by checking for one of its members; must also have order items;
            // also need to check tif there is shippable items;
            if (record.isShippable() && record.get("fulfillmentContact").postalOrZipCode && record.get("items").length) {
                shippingMethodButton.enable();
            } else {
                shippingMethodButton.disable();
            }

            var shippingMethodName = record.get("shippingMethodName") || Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.none_selected;
            shippingMethodButton.setText(shippingMethodName);
        }
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
                    glyph: "XE927@mozicons",
                    ui: 'action',
                    scale: 'small',
                    handler: handler,
                    scope: me
                });

            }
        }

    },

    initSummaryToggleButtons: function () {
        var me = this;

        if (Taco.app.context.getSite().omsOnly) {
            me.initToggleButton(".shipping-summary", me.toggleShippingDetails);
            return;
        }

        me.initToggleButton(".adjustment-summary", me.toggleAdjustmentDetails);
        me.initToggleButton(".shipping-summary", me.toggleShippingDetails);
        me.initToggleButton(".tax-summary", me.toggleTaxDetails);
        me.initToggleButton(".handling-summary", me.toggleHandlingDetails);
    },

    initUI: function () {
        var me = this,
            isEditable = me.isEditable,
            flex = (isEditable) ? .5 : 1;

        this.initLeftPanel();

        this.masterTable = Ext.create("Ext.Component", {
            data: this.record.getData(),
            flex: flex,
            tpl: this.getMasterTemplate(),
            listeners: {
                boxready: {
                    fn: function () {
                        me.initSummaryToggleButtons();
                    },
                    scope: me
                }
            }
        });

        this.items = [
            this.leftPanel,
            {
                xtype: "container",
                flex: 1,
                items: [
                    this.masterTable
                ]
            }
        ];

    },

    toggleAdjustmentDetails: function (btn, e) {

        this.handleToggle(btn, '.adjustment');

    },

    toggleShippingDetails: function (btn, e) {

        this.handleToggle(btn, '.shipping');

    },

    toggleHandlingDetails: function (btn, e) {

        this.handleToggle(btn, '.handling');

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

    // persist the contact and shipping method for this order;
    setShippingInfo: function (data) {

        var me = this,
            contact = this.record.get("fulfillmentContact"),
            shippingMethodCode = data.shippingMethodCode || null,
            shippingMethodName = data.shippingMethodName || null;

        // todo: move this to the model;

        me.fireEvent('save', this);

        // need to do loading indicator when not in order editor

        if (!me.isEditable) {
            me.setLoading(true);
        }

        Ext.Ajax.request({
            url: '/admin/app/order/setshippinginfo' + '?draft=' + this.record.get("isDraft"),
            method: 'POST',
            jsonData: {
                orderId: this.record.getId(),
                contact: contact,
                shippingMethodCode: shippingMethodCode,
                shippingMethodName: shippingMethodName
            },
            callback: function (record, operation) {
                if (!me.isEditable) {
                    me.setLoading(false);
                }
            },
            success: function (response) {
                // success handling here

                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.error_shipping_method, 'error');
                    return;
                }
                //this.fireEvent('saveSuccess', json);
                me.onShippingInfoChange()
            },
            failure: function (response) {
                // error handling here

                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.error_shipping_method;
                Taco.app.fireEvent('setmessage', msg, 'error');
                this.fireEvent('saveFailure');
            },
            scope: me
        });
    },

    onShippingInfoChange: function () {
        // need to reload the record manually since the shipping method has changed;
        this.record.reload();
    },

    initLeftPanel: function () {
        var me = this;

        var items = [];

        me.allowInvalidAddresses = false;
        me.isAddressValidationEnabled = false;
        Taco.model.GeneralSettings.load('', {
            success: function (record1) {
                me.allowInvalidAddresses = record1.data.allowInvalidAddresses;
                me.isAddressValidationEnabled = record1.data.isAddressValidationEnabled;
            },
            failure: function () {
            }
        });

        //only show this field if this is a phone order in pending status or when editing a draft;
        if (this.record.get("orderStatus") === "Pending" || this.record.get("isDraft")) {
            var shippingMethodButton = Ext.widget({
                itemId: "shippingMethodButton",
                cls: 'order-shipping-method',
                xtype: 'button',
                ui: "action",
                scale: "medium",
                requiredBehaviors: [{
                    model: 'Taco.model.Order',
                    behavior: 'update',
                    disable: true
                },
                {
                    model: 'Taco.model.Order',
                    behavior: 'fulfill'
                }],
                // need to have order items and a customer address. check for something on the fulfillmentContact. Note: don't use id as it might be 0 for whatever reason.
                disabled: !this.isOrderEditable() || (!this.record.isShippable() || !this.record.get("fulfillmentContact").postalOrZipCode || !this.record.get("items").length),
                text: me.record.get("shippingMethodName") || me.record.get("shippingMethodCode") || Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.none_selected,
                menu: Ext.create('Taco.view.order.widget.ShippingMethodMenu', {
                    showRuntimePricing: true,
                    orderId: me.record.getId(),
                    isDraft: this.record.get("isDraft"),
                    onShippingMethodChange: function (menu, selection) {

                        if (me.isAddressValidationEnabled && !me.allowInvalidAddresses && !me.record.get("fulfillmentContact").addressIsValidated) {
                            Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.valid_shipping_address, 'error');
                        } else if (selection && (selection.shippingMethodName || Ext.isNumeric(selection.price))) {
                            var data = {
                                shippingMethodName: selection.shippingMethodName,
                                shippingMethodCode: selection.shippingMethodCode
                            };
                            me.setShippingInfo(data);
                        }
                    }
                })
            });


            items.push({
                xtype: 'label',
                itemId: "shippingMethodLabel",
                cls: "x-form-item-label",
                html: this.getShippingLabelText()
            });

            items.push(shippingMethodButton);
        } else {
            // need to add a filler to get the panel to layout. weird.
            items.push({
                xtype: "component",
                html: ""
            });
        };

        this.leftPanel = Ext.create("Ext.container.Container", {
            cls: "orderform-detail-totalpanel-leftpanel",
            layout: {
                type: 'form'
            },
            items: items,
            flex: .5
        });

    },

    getShippingLabelText: function () {
        return (!this.record.isPickupOnlyOrder() && Ext.Object.isEmpty(this.record.data.fulfillmentContact))
            ? Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.shipping_method + " <span class='taco-order-shipping-error'>" + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.no_shipping_address + "</span>"
            : Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.shipping_method;
    },

    isOrderEditable: function () {
        var orderStatus = this.record.get('orderStatus');
        if (orderStatus == 'Pending' || orderStatus == 'Abandoned')
            return true;
        else
            return false;
    },

    // update the shipping method label based on the presence of a shipping Address Contact
    updateShippingMethodLabel: function () {
        var label = this.down("#shippingMethodLabel");
        if (label) {
            label.update(this.getShippingLabelText());
        }

    },

    tableStartTpl: new Ext.XTemplate(
        '<table class="x-grid-table x-grid-with-row-lines collapsed {isEditableCls} {classNames}" border="0" cellspacing="0" cellpadding="0" style="width:90%; margin-left: auto;">',
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
        '<tr class="adjustment-item discount ', '<tpl if="!isActive">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.GridHeader.suppressed + '<tpl else>' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.GridHeader.active + '</tpl>', '">',
        '<td class="{parent.tdCls}"></td>',
        '<td class="{parent.tdCls}"><div class="{parent.tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.GridHeader.order_discount + ' {description}</div></td>',
        '<td class="{parent.tdCls}"><div class="{parent.priceCls} {parent.tdInnerCls} negative-currency">({[this.getCurrencyFormat(values.total)]})</div></td>',
        '<td class="{parent.tdCls}"></td>',
        '<td class="x-action-col-cell taco-menu-col-cell x-action-col-celladjustment-cell{parent.tdCls}">',
        '<div unselectable="on" isActive="{isActive}" discountId="{discountId}"  action="processDiscount"',
        'class="order-action-icon discount-', '<tpl if="isActive">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.GridHeader.suppress + '<tpl else>' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.GridHeader.activate + '</tpl>', '">',
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
        '<td class="{tdCls}"><div class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.order_handling_fee + '</div></td>',
        '<td class="{tdCls}"><div class="{priceCls} {tdInnerCls}">{[this.getCurrencyFormat(values.handlingAmount)]}</div></td>',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',
        '</tpl>',

        '<tpl for="handlingDiscounts">',
        '<tr class="shipping-handling-item discount ', '<tpl if="!isActive">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.GridHeader.suppressed + '<tpl else>' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.GridHeader.active + '</tpl>', '">',
        '<td class="{tdCls}"></td>',
        '<td class="{parent.tdCls}"><div class="{parent.tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.order_handling + '</div></td>',
        '<td class="{parent.tdCls}"><div class="{parent.priceCls} {parent.tdInnerCls} negative-currency">({[this.getCurrencyFormat(values.total)]})</div></td>',
        '<td class="{parent.tdCls}"></td>',
        '<td class="{parent.tdCls}"></td>',
        '</tr>',
        '</tpl>',

        '<tpl for="lineItemHandlingFees">',
        '<tr class="shipping-handling-item itemhandlingfees">',
        '<td class="{tdCls}"></td>',
        '<td class="{parent.tdCls}"><div class="{parent.tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.line + ' {lineId} ' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.handling_fee + '</div></td>',
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
        // only show the shipping total if there is an adjustment or discount
        // '<tpl if="shippingAdjustment.amount !==0 || shippingDiscounts.length">',
        //     '<tr>',
        //         '<td class="{tdCls}"><div class="{tdInnerCls}">Shipping Total</div></td>',
        //         '<td class="{tdCls}"><div class="{tdInnerCls}">{[this.getCurrencyFormat(values.shippingTotal)]}</div></td>',
        //     '</tr>',
        // '</tpl>',

        '<tpl if="itemTaxTotal &gt; 0">',
        '<tr class="tax-item row-group-start">',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"><div class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.order_tax + '</div></td>',
        '<td class="{tdCls}"><div class="{priceCls} {tdInnerCls}">{[this.getCurrencyFormat(values.itemTaxTotal)]}</div></td>',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',
        '</tpl>',

        '<tpl if="shippingTaxTotal &gt; 0">',
        '<tr class="tax-item row-group-start">',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"><div class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.shipping_tax + '</div></td>',
        '<td class="{tdCls}"><div class="{priceCls} {tdInnerCls}">{[this.getCurrencyFormat(values.shippingTaxTotal)]}</div></td>',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',
        '</tpl>',

        '<tpl if="handlingTaxTotal &gt; 0">',
        '<tr class="tax-item row-group-start">',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"><div class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.handling_tax + '</div></td>',
        '<td class="{tdCls}"><div class="{priceCls} {tdInnerCls}">{[this.getCurrencyFormat(values.handlingTaxTotal)]}</div></td>',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',
        '</tpl>',

        '<tpl if="dutyTotal &gt; 0">',
        '<tr class="tax-item">',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"><div class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.duty + '</div></td>',
        '<td class="{tdCls}"><div class="{priceCls} {tdInnerCls}">{[this.getCurrencyFormat(values.dutyTotal)]}</div></td>',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',
        '</tpl>'
    ),

    subTpl_4: new Ext.XTemplate(

        '<tr class="subtotalrow">',
        '<th><div class="{[ (values.taxDutyTotal != 0) ? "tax-summary" : "" ]}"></div></th>',
        '<th class="summary"><div class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.tax_duty + '</div></th>',
        '<th></th>',
        '<th class="summary-price"><div class="{tdInnerCls}">{[this.getCurrencyFormat(values.taxDutyTotal)]}</div></th>',
        '<th></th>',
        '</tr>'

    ),

    subTpl_5: new Ext.XTemplate(

        '<div class="{tdInnerCls} {[ (values.adjustmentTotal < 0) ? "negative-currency" : "" ]}">{[this.getCurrencyFormat(values.adjustmentTotal)]}</div>'

    ),

    subTpl_6: new Ext.XTemplate(

        '<tr class="subtotalrow">',
        '<th></th>',
        '<th class="summary"><div class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.order_subtotal + '</div></th>',
        '<th></th>',
        '<th class="summary-price"><div class="{tdInnerCls}">{[this.getCurrencyFormat(values.lineItemSubtotalWithOrderAdjustments)]}</div></th>',
        '<th></th>',
        '</tr>'

    ),

    subTpl_7: new Ext.XTemplate(

        '<div class="{tdInnerCls}">{[this.getCurrencyFormat(values.shippingTotal)]}</div>'

    ),

    subTpl_10: new Ext.XTemplate(

        '<div class="{tdInnerCls}">{[this.getCurrencyFormat(values.handlingTotal)]}</div>'

    ),

    subTpl_8: new Ext.XTemplate(

        '<tpl if="shippingMethodName || shippingDiscounts.length &gt; 0 || lineItemShippingDiscounts.length &gt; 0 || shippingAdjustment.amount !== 0">',

        '<tpl if="shippingMethodName">',
        '<tr class="shipping-handling-item">',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}" colspan=><div class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.order_shipping_fee + '<tpl if="values.shippingMethodName">: {shippingMethodName}</tpl></div></td>',
        '<td class="{tdCls}"><tpl if="!isOmsOnly"><div class="{priceCls} {tdInnerCls}">{[this.getCurrencyFormat(values.shippingAmountBeforeDiscountsAndAdjustments)]}</div></tpl></td>',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',
        '</tpl>',

        '<tpl for="lineItemShippingDiscounts">',
        '<tr class="shipping-handling-item lineitemdiscount">',
        '<td class="{tdCls}"></td>',
        '<td class="{parent.tdCls}"><div class="x-grid-cell-inner {parent.tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.line + ' {lineId} ' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.shipping_discount + ': {name}</div></td>',
        '<td class="{parent.tdCls}"><tpl if="!isOmsOnly"><div class="{parent.priceCls} {parent.tdInnerCls} negative-currency">({[this.getCurrencyFormat(values.fee)]})</div></tpl></td>',
        '<td class="{parent.tdCls}"></td>',
        '<td class="{parent.tdCls}"></td>',
        '</tr>',
        '</tpl>',

        '<tpl for="shippingDiscounts">',
        '<tr class="shipping-handling-item discount ',
        '<tpl if="!isActive">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.GridHeader.suppressed + '<tpl else>' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.GridHeader.active + '</tpl>',
        '">',
        '<td class="{tdCls}"></td>',
        '<td class="{parent.tdCls}"><div class="{parent.tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.shipping_discount + ': {description}</div></td>',
        '<td class="{parent.tdCls}"><tpl if="!isOmsOnly"><div class="{parent.priceCls} {parent.tdInnerCls} negative-currency">({[this.getCurrencyFormat(values.total)]})</div></tpl></td>',
        '<td class="x-action-col-cell taco-menu-col-cell x-action-col-celladjustment-cell{parent.tdCls}">',
        '<div unselectable="on" isActive="{isActive}" discountId="{discountId}"  action="processDiscount"',
        'class="order-action-icon discount-', '<tpl if="isActive">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.GridHeader.suppress + '<tpl else>' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.GridHeader.activate + '</tpl>', '">',
        '</div>',
        '</td>',
        '</tr>',
        '</tpl>',
        '</tpl>'
    ),

    subTpl_9: new Ext.XTemplate(

        '<tr class="totalrow" >',
        '<th></th>',
        '<th class="summary"><div class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.order_total + '</div></th>',
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
            priceCls = "price-detail "
            isEditable = this.isEditable,
            isEditableCls = (isEditable) ? "taco-editable " : "",
            // need to fake an editable field in the template dom. if editable needs to be an anchor tag to allow for tabbing and div when uneditable
            fakeInputDom = (isEditable) ? "a " : "div",
            isOmsOnly = Taco.app.context.getSite().omsOnly;

        return [

            '{%',
            // add some css classes to the values data to be used in xTemplates
            'values.tdCls = "' + tdCls + '";values.tdInnerCls = "' + tdInnerCls + '";values.isEditableCls = "' +
            isEditableCls + '";values.actionColumnWidth = "' + me.actionColumnWidth + '";values.priceCls = "' + priceCls + '";values.isEditable = "' + isEditable + '";',
            '%}',

            '{[this.getSubTpl("tableStartTpl", values, {classNames:"pricing-detail-collapsable adjustment"})]}',

            '<thead>',
            '<tr>',
            '<th><div class="{[ (values.orderAdjustment.amount != 0 || (values.orderDiscounts && values.orderDiscounts.length > 0) || ' + isEditable + ') ? "adjustment-summary" : "" ]}"></div></th>',
            '<th class="summary">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.order_adjustments + '</th>',
            '<th></th>',

            '<th class="summary-price" itemId="taco-subTpl_5">',
            '{[this.getSubTpl("subTpl_5", values)]}',
            '</th>',

            '<th></th>',
            '</tr>',
            '</thead>',

            // orderAdjustment row.  Note: this will contain extjs components and will only render once. 
            '<tbody itemId="taco-orderAdjustment">',
            '<tpl if="' + isEditable + ' || orderAdjustment.amount !== 0">',
            '<tr class="adjustment-item">',
            '<td class="{tdCls}"></td>',
            '<td class="{tdCls}"><div itemId="orderAdjustmentLabel" class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.order_adjustment + '</div></td>',
            '<td class="{tdCls}"><div itemId="orderAdjustmentField" class="{priceCls} {tdInnerCls} {[ (values.orderAdjustment.amount < 0) ? "negative-currency" : "" ]}">{[ this.getCurrencyFormat(values.orderAdjustment.amount)]}</div></td>',
            '<td class="{tdCls}"></td>',
            '<td class="{tdCls}"></td>',
            '</tr>',
            '</tpl>',
            '</tbody>',

            // discounts 
            '<tbody itemId="taco-subTpl_1">',
            // output class level subtemplate 1
            '{[this.getSubTpl("subTpl_1", values)]}',
            '</tbody>',

            '</table>',

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
            '<th><div class="{[ (values.shippingTotal != 0 || values.shippingMethodName || ' + isEditable + ') ? "shipping-summary" : "" ]}"></div></th>',
            '<th class="summary"><div class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.shipping + '</div></th>',
            '<th></th>',

            '<th class="summary-price" itemId="taco-subTpl_7">',
            '{[this.getSubTpl("subTpl_7", values)]}',
            '</th>',

            '<th></th>',
            '</tr>',
            '</thead>',

            '<tbody itemId="taco-subTpl_8">',
            '{[this.getSubTpl("subTpl_8", values)]}',
            '</tbody>',

            '<tbody>',
            '<tpl if="' + isEditable + ' || shippingAdjustment.amount !== 0">',
            '<tr class="shipping-handling-item">',
            '<td class="{tdCls}"></td>',
            '<td class="{tdCls}"><div itemId="shippingAdjustmentLabel" class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.shipping_adjustment + '</div></td>',
            '<td class="{tdCls}"><div itemId="shippingAdjustmentField" class="{priceCls} {tdInnerCls} {[ (values.shippingAdjustment.amount < 0) ? "negative-currency" : "" ]}">{[ this.getCurrencyFormat(values.shippingAdjustment.amount)]}</div></td>',
            '<td class="{tdCls}"></td>',
            '<td class="{tdCls}"></td>',
            '</tr>',
            '</tpl>',
            '</tbody>',

            '</table>',

            // handling template - output class level subTemplate 2.  Note: this will contain extjs xTemplates and will render with each change 

            '{[this.getSubTpl("tableStartTpl", values, {classNames:"pricing-detail-collapsable handling"})]}',

            '<thead>',
            '<tr class="subtotalrow">',
            '<th><div class="{[ (values.handlingAmount != 0 || ' + isEditable + ') ? "handling-summary" : "" ]}"></div></th>',
            '<th class="summary"><div class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.handling + '</div></th>',
            '<th></th>',

            '<th class="summary-price" itemId="taco-subTpl_10">',
            '{[this.getSubTpl("subTpl_10", values)]}',
            '</th>',

            '<th></th>',
            '</tr>',
            '</thead>',


            '<tbody itemId="taco-subTpl_2">',
            '{[this.getSubTpl("subTpl_2", values)]}',
            '</tbody>',

            '<tbody>',
            '<tpl if="' + isEditable + ' || handlingAdjustment.amount !== 0">',
            '<tr class="shipping-handling-item">',
            '<td class="{tdCls}"></td>',
            '<td class="{tdCls}"><div itemId="handlingAdjustmentLabel" class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.handling_adjustment + '</div></td>',
            '<td class="{tdCls}"><div itemId="handlingAdjustmentField" class="{priceCls} {tdInnerCls} {[ (values.handlingAdjustment.amount < 0) ? "negative-currency" : "" ]}">{[ this.getCurrencyFormat(values.handlingAdjustment.amount)]}</div></td>',
            '<td class="{tdCls}"></td>',
            '<td class="{tdCls}"></td>',
            '</tr>',
            '</tpl>',
            '</tbody>',

            '</table>',

            // Tax & Duty
            '{[this.getSubTpl("tableStartTpl", values, {classNames:"pricing-detail-collapsable tax"})]}',

            '<thead itemId="taco-subTpl_4">',
            '{[this.getSubTpl("subTpl_4", values)]}',
            '</thead>',

            // output class level subTemplate 3.  Note: this will contain extjs xTemplates and will render with each change 
            '<tbody itemId="taco-subTpl_3">',
            '{[this.getSubTpl("subTpl_3", values)]}',
            '</tbody>',

            '</table>',

            // total
            '{[this.getSubTpl("tableStartTpl", values)]}',

            '<thead itemId="taco-subTpl_9">',
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
                }
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
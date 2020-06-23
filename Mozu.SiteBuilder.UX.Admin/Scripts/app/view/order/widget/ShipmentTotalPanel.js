/**
 * @class Taco.view.order.widget.ShipmentTotalPanel
 * panel for display of subtotal, discounts, shipping, tax, and order total
 * used in the OrderDetail
 * This is the readonly version for display.
 * see ShipmentTotalPanelEditable.js for the editable subClass used in the orderDetailEditor.
 */

Ext.define('Taco.view.order.widget.ShipmentTotalPanel', {
    extend: 'Ext.container.Container',
    requires: [
        'Taco.model.ShipmentAdjustment'
    ],

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
        me.cls = 'orderform-detail-totalpanel shipmentPanel x-grid-row';

        if(!this.shipmentRecord) {
            return;
        }
        
        this.initUI();

         me.callParent(arguments);
    },

    applyRecord: function (record) {
        this.masterTable.update(record.getData());
        this.initSummaryToggleButtons();
        return record;
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

        me.initToggleButton(".shipment-summary", me.toggleShippingDetails);
        me.initToggleButton(".shipping-summary", me.toggleTaxDetails);
        me.initToggleButton(".handling-summary", me.toggleHandlingDetails);

    },

    initUI: function () {
        var me = this,
            isEditable = me.isEditable,
            flex = (isEditable) ? .5 : 1;

        this.initLeftPanel();

        this.masterTable = Ext.create("Ext.Component", {
            data: this.shipmentRecord,
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

    toggleShippingDetails: function (btn, e) {

        this.handleToggle(btn, '.shipment');

    },

    toggleHandlingDetails: function (btn, e) {

        this.handleToggle(btn, '.handling');

    },

    toggleTaxDetails: function (btn, e) {

        this.handleToggle(btn, '.shipping');

    },

    handleToggle: function (btn, selector) {

        var me = this,
            selector = ".pricing-detail-collapsable" + selector,
            el = btn.el.up(selector),
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

    initLeftPanel: function () {
        var me = this;

        var items = [];

        items.push({
            xtype: "component",
            html: ""
        });

        this.leftPanel = Ext.create("Ext.container.Container", {
            cls: "orderform-detail-totalpanel-leftpanel",
            layout: {
                type: 'form'
            },
            items: items,
            flex: .5
        });

    },

    isOrderEditable: function () {
        var orderStatus = this.record.get('orderStatus');
        if (orderStatus == 'Pending' || orderStatus == 'Abandoned')
            return true;
        else
            return false;
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
     *   The second section of XTemplate that is after the order adjustment row and before the shipping adjustment row;
    */
    subTpl_2: new Ext.XTemplate(

        '<tr class="shipping-handling-item">',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"><div class="{parent.tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.handling_subtotal + '</div></td>',
        '<td class="{tdCls}"><div class="{parent.priceCls} {parent.tdInnerCls}">{[this.getCurrencyFormat(values.handlingSubtotalOriginalAmount)]}</div></td>',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',

        '<tpl if="isEditable || handlingAdjustment &lt; 0">',
        '<tr class="tax-item adjustment-tr">',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"><div itemId="handlingAdjustmentLabel" class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.adjustment + '</div></td>',
        '<td class="{tdCls}"><div itemId="handlingAdjustmentField" class="{priceCls} {tdInnerCls} {[ (values.handlingAdjustment < 0) ? "negative-currency" : "" ]}">{[this.getCurrencyFormat(values.handlingAdjustment)]}</div></td>',
        '<td itemId="handlingAdjustmentTotal" class="{tdCls} adjustmentTotal"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',
        '</tpl>',

        '<tr class="shipping-handling-item handlingTax">',
        '<td class="{tdCls}"></td>',
        '<td class="{parent.tdCls}"><div class="{parent.tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.handling_tax +'</div></td>',
        '<td class="{parent.tdCls}"><div class="{parent.priceCls} {parent.tdInnerCls}">{[this.getCurrencyFormat(values.handlingTaxTotalOriginalAmount)]}</div></td>',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',

        '<tpl if="isEditable || handlingTaxAdjustment &lt; 0">',
        '<tr class="tax-item adjustment-tr">',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"><div itemId="handlingTaxAdjustmentLabel" class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.adjustment + '</div></td>',
        '<td class="{tdCls}"><div itemId="handlingTaxAdjustmentField" class="{priceCls} {tdInnerCls} {[ (values.handlingTaxAdjustment < 0) ? "negative-currency" : "" ]}">{[this.getCurrencyFormat(values.handlingTaxAdjustment)]}</div></td>',
        '<td itemId="handlingTaxAdjustmentTotal" class="{tdCls} adjustmentTotal"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',
        '</tpl>'
    ),

    /**
     *   The third section of XTemplate that is after the shipping adjustment row
    */
    subTpl_3: new Ext.XTemplate(
        
        '<tr class="shipping-handling-item">',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"><div class="{parent.tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.shipping_subtotal +'</div></td>',
        '<td class="{tdCls}"><div class="{parent.priceCls} {parent.tdInnerCls}">{[this.getCurrencyFormat(values.shippingSubtotalOriginalAmount)]}</div></td>',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',

        '<tpl if="isEditable || shippingAdjustment">',
        '<tr class="tax-item adjustment-tr">',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"><div itemId="shippingAdjustmentLabel" class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.adjustment + '</div></td>',
        '<td class="{tdCls}"><div itemId="shippingAdjustmentField" class="{priceCls} {tdInnerCls} {[ (values.shippingAdjustment < 0) ? "negative-currency" : "" ]}">{[this.getCurrencyFormat(values.shippingAdjustment)]}</div></td>',
        '<td itemId="shippingAdjustmentTotal" class="{tdCls} adjustmentTotal"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',
        '</tpl>',

        '<tr class="shipping-handling-item handlingTax">',
        '<td class="{tdCls}"></td>',
        '<td class="{parent.tdCls}"><div class="{parent.tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.shipping_tax + '</div></td>',
        '<td class="{parent.tdCls}"><div class="{parent.priceCls} {parent.tdInnerCls}">{[this.getCurrencyFormat(values.shippingTaxTotalOriginalAmount)]}</div></td>',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',

        
        '<tpl if="isEditable || shippingTaxAdjustment">',
        '<tr class="tax-item adjustment-tr">',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"><div itemId="shippingTaxAdjustmentLabel" class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.adjustment + '</div></td>',
        '<td class="{tdCls}"><div itemId="shippingTaxAdjustmentField" class="{priceCls} {tdInnerCls} {[ (values.shippingTaxAdjustment < 0) ? "negative-currency" : "" ]}">{[this.getCurrencyFormat(values.shippingTaxAdjustment)]}</div></td>',
        '<td itemId="shippingTaxAdjustmentTotal" class="{tdCls} adjustmentTotal"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',
        '</tpl>'
    ),

    subTpl_4: new Ext.XTemplate(
        

    ),

    subTpl_5: new Ext.XTemplate(

        '<div class="{tdInnerCls} {[ (values.adjustmentTotal < 0) ? "negative-currency" : "" ]}">{[this.getCurrencyFormat(values.adjustmentTotal)]}</div>'

    ),

    subTpl_6: new Ext.XTemplate(

        '<tr class="subtotalrow">',
        '<th></th>',
        '<th class="summary"><div class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.subtotal + '</div></th>',
        '<th></th>',
        '<th class="summary-price"><div class="{tdInnerCls}">{[this.getCurrencyFormat(values.lineItemSubtotal)]}</div></th>',
        '<th></th>',
        '</tr>'

    ),

    subTpl_7: new Ext.XTemplate(

        '<div class="{tdInnerCls}">{[this.getCurrencyFormat(values.lineItemSubtotal + values.lineItemTaxTotal)]}</div>'

    ),

    subTpl_10: new Ext.XTemplate(

        '<div class="{tdInnerCls}">{[this.getCurrencyFormat(values.handlingTotal)]}</div>'

    ),

    subTpl_8: new Ext.XTemplate(

        '<tr class="shipping-handling-item">',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"><div class="{parent.tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.item_subtotal + '</div></td>',
        '<td class="{tdCls}"><div class="{parent.priceCls} {parent.tdInnerCls}">{[this.getCurrencyFormat(values.itemOriginalAmount)]}</div></td>',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',

        '<tpl if="isEditable || shipmentAdjustment">',
        '<tr class="tax-item adjustment-tr">',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"><div itemId="itemAdjustmentLabel" class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.adjustment + '</div></td>',
        '<td class="{tdCls}"><div itemId="itemAdjustmentField" class="{priceCls} {tdInnerCls} {[ (values.shipmentAdjustment < 0) ? "negative-currency" : "" ]}">{[this.getCurrencyFormat(values.shipmentAdjustment)]}</div></td>',
        '<td itemId="itemAdjustmentTotal" class="{tdCls} adjustmentTotal"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',
        '</tpl>',
        
        '<tr class=shipping-handling-item shippingTax">',
        '<td class="{tdCls}"></td>',
        '<td class="{parent.tdCls}"><div class="{parent.tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.item_tax + '</div></td>',
        '<td class="{parent.tdCls}"><div class="{parent.priceCls} {parent.tdInnerCls}">{[this.getCurrencyFormat(values.itemTaxOriginalAmount)]}</div></td>',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',

        '<tpl if="isEditable || itemTaxAdjustment">',
        '<tr class="tax-item adjustment-tr">',
        '<td class="{tdCls}"></td>',
        '<td class="{tdCls}"><div itemId="itemTaxAdjustmentLabel" class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.adjustment + '</div></td>',
        '<td class="{tdCls}"><div itemId="itemTaxAdjustmentField" class="{priceCls} {tdInnerCls} {[ (values.lineItemTaxAdjustment < 0) ? "negative-currency" : "" ]}">{[this.getCurrencyFormat(values.lineItemTaxAdjustment)]}</div></td>',
        '<td itemId="itemTaxAdjustmentTotal" class="{tdCls} adjustmentTotal"></td>',
        '<td class="{tdCls}"></td>',
        '</tr>',
        '</tpl>'
    ),

    subTpl_9: new Ext.XTemplate(

        '<tr class="totalrow" >',
        '<th></th>',
        '<th class="summary"><div class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.shipment_total + '</div></th>',
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
            priceCls = "price-detail-shipment ",
            isEditable = this.isEditable,
            isEditableCls = (isEditable) ? "taco-editable " : "",
            // need to fake an editable field in the template dom. if editable needs to be an anchor tag to allow for tabbing and div when uneditable
            fakeInputDom = (isEditable) ? "a " : "div";

        return [

            '{%',
            // add some css classes to the values data to be used in xTemplates
            'values.tdCls = "' + tdCls + '";values.tdInnerCls = "' + tdInnerCls + '";values.isEditableCls = "' +
            isEditableCls + '";values.actionColumnWidth = "' + me.actionColumnWidth + '";values.priceCls = "' + priceCls + '";values.isEditable = "' + isEditable + '";',
            '%}',

            // subtotal
            '{[this.getSubTpl("tableStartTpl", values)]}',

            //'<thead itemId="taco-subTpl_6">',
            //'{[this.getSubTpl("subTpl_6", values)]}',
            //'</thead>',

            '</table>',

            // Shipment
            '{[this.getSubTpl("tableStartTpl", values, {classNames:"pricing-detail-collapsable shipment"})]}',

            '<thead>',
            '<tr class="subtotalrow">',
            '<th><div class="{[ (values.lineItemSubtotal != 0 || ' + isEditable + ') ? "shipment-summary" : "" ]}"></div></th>',
            '<th class="summary"><div class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.item_total + '</div></th>',
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

            '</table>',


            // Shipping
            '{[this.getSubTpl("tableStartTpl", values, {classNames:"pricing-detail-collapsable shipping"})]}',

            '<thead itemId="taco-subTpl_4">',
            '<tr class="subtotalrow">',
            '<th><div class="{[ (values.taxDutyTotal != 0 || ' + isEditable + ') ? "shipping-summary" : "" ]}"></div></th>',
            '<th class="summary"><div class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.shipping + '</div></th>',
            '<th></th>',
            '<th class="summary-price"><div class="{tdInnerCls}">{[this.getCurrencyFormat(values.shippingTotal)]}</div></th>',
            '<th></th>',
            '</tr>',
            '</thead>',

            // output class level subTemplate 3.  Note: this will contain extjs xTemplates and will render with each change 
            '<tbody itemId="taco-subTpl_3">',
            '{[this.getSubTpl("subTpl_3", values)]}',
            '</tbody>',

            '</table>',

            // handling template - output class level subTemplate 2.  Note: this will contain extjs xTemplates and will render with each change 

            '{[this.getSubTpl("tableStartTpl", values, {classNames:"pricing-detail-collapsable handling"})]}',

            '<thead>',
            '<tr class="subtotalrow">',
            '<th><div class="{[ (values.handlingAmount != 0 || ' + isEditable + ') ? "handling-summary" : "" ]}"></div></th>',
            '<th class="summary"><div class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.handling + '</div></th>',
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

            '</table>',

            

            // total
            '{[this.getSubTpl("tableStartTpl", values)]}',

            '<thead itemId="taco-subTpl_9">',
            
            '<tr class="totalrow" >',
            '<th></th>',
            '<th class="summary"><div class="{tdInnerCls}">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.total + '</div></th>',
            '<th></th>',
            '<th class="summary-price"><div class="{tdInnerCls}">{[this.adjustmentSubTotal()]}</div></th>',
            '<th></th>',
            '</tr>',

            '</thead>',

            '</table>',
            {
                view: me,
                getSubTpl: function (tplName, values, params) {
                    var tpl = this.view[tplName];
                    tpl.getCurrencyFormat = this.getCurrencyFormat;
                    values.isEditable = (isEditable) ? 'true' : 'false';
                    me.store.each(function(record){
                        values[record.get('id') + 'OriginalAmount'] = record.get('originalAmount');
                    });
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
                adjustmentSubTotal: function(){
                    return this.getCurrencyFormat(me.store.getAdjustedShippingTotal());
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
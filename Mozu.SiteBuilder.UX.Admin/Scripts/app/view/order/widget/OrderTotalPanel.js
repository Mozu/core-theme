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
    actionColumnWidth: 30,
    
    initComponent: function(eOpts) {
        var me = this;
        me.cls = 'orderform-detail-totalpanel x-grid-row';
        this.initUI();
        me.callParent(arguments);
    },

    applyRecord: function (record) {        
        this.masterTable.update(record.getData());
        this.updateShippingMethodButton(record);
        this.updateShippingMethodLabel();
        return record
    },
    
    updateShippingMethodButton: function (record) {
        var me = this,
            shippingMethodButton = me.down("#shippingMethodButton")
         
        if (shippingMethodButton) {
            // check if there is a valid contact by checking for one of its members; must also have order items;
            // also need to check tif there is shippable items;
            if (record.isShippable() && record.get("fulfillmentContact").postalOrZipCode && record.get("items").length) {
                shippingMethodButton.enable();
            } else {
                shippingMethodButton.disable();
            }

            var shippingMethodName = record.get("shippingMethodName") || "None Selected";
            shippingMethodButton.setText(shippingMethodName)
        }
    },

    initUI: function () {
        var me = this,
            isEditable = me.isEditable,
            flex = (isEditable) ? .5 : 1;

        this.initLeftPanel();

        this.masterTable = Ext.create("Ext.Component", {
            data: this.record.getData(),
            flex: flex,
            tpl: this.getMasterTemplate()
        });
        

        this.items = [
            this.leftPanel,
            {
                xtype: "container",
                flex: .5,
                items: [
                    this.masterTable
                ]
            }
        ];
        
    },

    // persist the contact and shipping method for this order;
    setShippingInfo: function (data) {
        
        var me = this,
            contact = this.record.get("fulfillmentContact"),
            shippingMethodCode = data.shippingMethodCode ||  null,
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
                    Taco.app.fireEvent('setmessage', "Error setting shipping method.", 'error');
                    return;
                }
                //this.fireEvent('saveSuccess', json);
                me.onShippingInfoChange()
            },
            failure: function (response) {
                // error handling here
                
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : "Error setting shipping method.";
                Taco.app.fireEvent('setmessage', msg, 'error');
                this.fireEvent('saveFailure');
            },
            scope: me
        });
    },

    onShippingInfoChange: function (){        
        // need to reload the record manually since the shipping method has changed;
        this.record.reload();
    },

    initLeftPanel: function () {
        var me = this;
        
        var items = [];

        //only show this field if this is a phone order in pending status or when editing a draft;
        if (this.record.get("orderStatus") == "Pending" || this.record.get("isDraft")) {            
            var shippingMethodButton = Ext.widget({
                itemId:"shippingMethodButton",
                xtype: 'button',
                ui: "action",
                scale: "medium",
                // need to have order items and a customer address. check for something on the fulfillmentContact. Note: don't use id as it might be 0 for whatever reason.
                disabled: !this.record.isShippable() || !this.record.get("fulfillmentContact").postalOrZipCode || !this.record.get("items").length,
                text: me.record.get("shippingMethodName") || me.record.get("shippingMethodCode") || "None Selected",
                menu: Ext.create('Taco.view.order.widget.ShippingMethodMenu', {
                    showRuntimePricing: true,
                    orderId: me.record.getId(),
                    isDraft: this.record.get("isDraft"),
                    onShippingMethodChange: function (menu, selection) {
                        
                        if (selection && (selection.shippingMethodName || Ext.isNumeric(selection.price))) {
                            var data = {
                                shippingMethodName: selection.shippingMethodName,
                                shippingMethodCode: selection.shippingMethodCode
                            };
                            me.setShippingInfo(data);
                        }
                    }
                })
            })
            
            
            items.push({
                xtype: 'label',
                itemId: "shippingMethodLabel",
                cls: "x-form-item-label",
                html: this.getShippingLabelText()
            });

            items.push(shippingMethodButton)            
        } else {
            // need to add a filler to get the panel to layout. weird.
            items.push({
                xtype:"component",
                html:""
            })
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
    
    getShippingLabelText : function (){         
        return shippingMethodLabelTxt = (Ext.Object.isEmpty(this.record.data.fulfillmentContact)) ? "Shipping Method <span class='taco-order-shipping-error'>(No Shipping Address Selected)</span>" : "Shipping Method";
    },

    // update the shipping method label based on the presence of a shipping Address Contact
    updateShippingMethodLabel : function () {
        var label = this.down("#shippingMethodLabel");
        if (label) {
            label.update(this.getShippingLabelText());
        }

    },

    /**
     *   The first section of XTemplate that precedes the order adjustment row;
     */
    subTpl_1: new Ext.XTemplate(
        
        '<tr class="subtotalrow">',
            '<td class="{tdCls}"><div class="{tdInnerCls}">SubTotal</div></td>',
            '<td class="subtotalcell {tdCls}"><div class="{tdInnerCls}">{[this.getCurrencyFormat(values.discountedTotal)]}</div></td>',
        '</tr>',
            
        '<tpl for="orderDiscounts">',
            '<tr class="discount ', '<tpl if="!isActive">suppressed<tpl else>active</tpl>', '">',
                '<td class="{parent.tdCls}"><div class="{parent.tdInnerCls}">Discount ({description})</div></td>',
                '<td class="{parent.tdCls}"><div class="{parent.tdInnerCls} negative-currency">({[this.getCurrencyFormat(values.total)]})</div></td>',
                '<td class="x-action-col-cell taco-menu-col-cell x-action-col-celladjustment-cell{parent.tdCls}">',
                    '<div unselectable="on" isActive="{isActive}" discountId="{discountId}"  action="processDiscount"',
                        'class="order-action-icon discount-', '<tpl if="isActive">suppress<tpl else>activate</tpl>', '">',
                        '</div>',
                '</td>',
            '</tr>',
        '</tpl>',            

        '<tpl if="values.storeCredit && values.storeCredit &gt; 0">',
            '<tr class="storeCredit ', '<tpl if="!isActive">suppressed<tpl else>active</tpl>', '">',
                '<td class="{tdCls}"><div class="{tdInnerCls}">Store Credit</div></td>',
                '<td class="{tdCls}"><div class="{tdInnerCls} negative-currency">({[this.getCurrencyFormat(values.storeCredit)]})</div></td>',
            '</tr>',
        '</tpl>'
    ),

    /**
     *   The second section of XTemplate that is after the order adjustment row and before the shipping adjustment row;
    */
    subTpl_2: new Ext.XTemplate(
        '<tr>',
            '<td class="{tdCls}"><div class="{tdInnerCls}">Tax</div></td>',
            '<td class="{tdCls}"><div class="{tdInnerCls}">{[this.getCurrencyFormat(values.taxTotal)]}</div></td>',
        '</tr>',

        '<tr class="row-group-start">',
            '<td class="{tdCls}"><div class="{tdInnerCls}">Shipping <tpl if="values.shippingMethodName">({shippingMethodName})</tpl>:</div></td>',
            '<td class="{tdCls}"><div class="{tdInnerCls}">{[this.getCurrencyFormat(values.shippingSubtotal)]}</div></td>',
        '</tr>',

        '<tpl if="handlingTotal !== 0">',
            '<tr>',
                '<td class="{tdCls}"><div class="{tdInnerCls}">Additional Handling</div></td>',
                '<td class="{tdCls}"><div class="{tdInnerCls}">{[this.getCurrencyFormat(values.handlingTotal)]}</div></td>',
            '</tr>',
        '</tpl>',

        '<tpl for="shippingDiscounts">',
            '<tr class="discount ',
                '<tpl if="!isActive">suppressed<tpl else>active</tpl>',
            '">',
                '<td class="{parent.tdCls}"><div class="{parent.tdInnerCls}">Shipping Discount ({description}):</div></td>',
                '<td class="{parent.tdCls}"><div class="{parent.tdInnerCls} negative-currency">({[this.getCurrencyFormat(values.total)]})</div></td>',
                '<td class="x-action-col-cell taco-menu-col-cell x-action-col-celladjustment-cell{parent.tdCls}">',
                    '<div unselectable="on" isActive="{isActive}" discountId="{discountId}"  action="processDiscount"',
                        'class="order-action-icon discount-', '<tpl if="isActive">suppress<tpl else>activate</tpl>', '">',
                    '</div>',
                '</td>',
            '</tr>',
        '</tpl>'
    ),

    /**
     *   The third section of XTemplate that is after the shipping adjustment row
    */
    subTpl_3: new Ext.XTemplate(
        // only show the shipping total if there is an adjustment or discount
        '<tpl if="shippingAdjustment.amount !==0 || shippingDiscounts.length">',
            '<tr>',
                '<td class="{tdCls}"><div class="{tdInnerCls}">Shipping Total</div></td>',
                '<td class="{tdCls}"><div class="{tdInnerCls}">{[this.getCurrencyFormat(values.shippingTotal)]}</div></td>',
            '</tr>',
        '</tpl>',

        '<tpl if="adjustmentTotal">',
            '<tr>',
                '<td class="{tdCls}"><div class="{tdInnerCls}">{adjustmentDescription}</div></td>',
                '<td class="{tdCls}"><div class="{tdInnerCls}">{[this.getCurrencyFormat(values.adjustmentTotal)]}</div></td>',
            '</tr>',
        '</tpl>',


        '<tr class="row-group-start totalrow" >',
            '<td class="{tdCls}"><div class="{tdInnerCls}">OrderTotal</div></td>',
            '<td class="totalcell {tdCls}"><div class="{tdInnerCls}">{[this.getCurrencyFormat(values.total)]}</div></td>',
        '</tr>'
    ),
        
    /**
    * The main xTemplate that initializes the view. It will load the 3 subTemplates and create the dom needed for the orderAjustment ui and the shippingAdjustment ui.
    * Note: the master template is only rendered once because the orderAjustment and shipping adjusment contain extjs components; The subTemplates will rerender after every update of the order record;
    */
    getMasterTemplate: function () {
        var me = this,
            tdCls = "taco-grid-cell ",
            tdInnerCls = "taco-grid-cell-inner ",
            isEditable = this.isEditable,
            isEditableCls = (isEditable) ? "taco-editable " : "",
            // need to fake an editable field in the template dom. if editable needs to be an anchor tag to allow for tabbing and div when uneditable
            fakeInputDom = (isEditable) ? "a " : "div";

        return [
            '<table class="x-grid-table x-grid-with-row-lines ' + isEditableCls  + '" border="0" cellspacing="0" cellpadding="0" style="width:100%;">',
            // todo make this dynamic and pulls from grid header to get correct widths;
            '<colgroup><col class="" style="text-align:right"></colgroup>',
            '<colgroup><col class="" style="width:100px;text-align:right"></colgroup>',
            '<colgroup><col class="" style="width:' + me.actionColumnWidth + 'px;"></colgroup>',

            '{%',
                // add some css classes to the values data to be used in xTemplates
                'values.tdCls = "'+tdCls+'";values.tdInnerCls = "'+tdInnerCls+'"',                
            '%}',


            '<tbody itemId="taco-subTpl_1">',
                // output class level subtemplate 1
                '{[this.getSubTpl("subTpl_1", values)]}',
            '</tbody>',


            // orderAdjustment row.  Note: this will contain extjs components and will only render once. 
            '<tbody itemId="taco-orderAdjustment" class="order-adjustment-row">',
                '<tpl if="' + isEditable + ' || orderAdjustment.amount !== 0">',            
                    '<tr>',
                        '<td class="{tdCls}"><div itemId="orderAdjustmentLabel" class="{tdInnerCls} order-adjustment-label">{[ (values.orderAdjustment.amount > 0) ? "Add to Order Total" : "Subtract from Order Total"   ]}</div></td>',
                        '<td class="{tdCls}"><div itemId="orderAdjustmentField" class="{tdInnerCls} order-adjustment-field {[ (values.orderAdjustment.amount < 0) ? "negative-currency" : "" ]}">{[ this.getCurrencyFormat(values.orderAdjustment.amount)]}</div></td>',
                    '</tr>',
                '</tpl>',
            '</tbody>',


            // output class level subTemplate 2.  Note: this will contain extjs xTemplates and will render with each change 
            '<tbody itemId="taco-subTpl_2">',
                '{[this.getSubTpl("subTpl_2", values)]}',
            '</tbody>',


            // shippingAdjustment Row. Note: this will contain extjs components and will only render once
            '<tbody itemId="taco-shippingAdjustment" class="order-adjustment-row">',
                '<tpl if="' + isEditable + ' || shippingAdjustment.amount !== 0">',
                    '<tr>',
                        '<td class="{tdCls}"><div itemId="shippingAdjustmentLabel" class="{tdInnerCls} order-adjustment-label">{[ (values.shippingAdjustment.amount > 0) ? "Add to Shipping Total" : "Subtract from Shipping Total"   ]}</div></td>',                        
                        '<td class="{tdCls}"><div itemId="shippingAdjustmentField"  class="{tdInnerCls} order-adjustment-field {[ (values.shippingAdjustment.amount < 0) ? "negative-currency" : "" ]}">{[ this.getCurrencyFormat(values.shippingAdjustment.amount)]}</div></td>',                        
                    '</tr>',
                '</tpl>',
            '</tbody>',

            // output class level subTemplate 3.  Note: this will contain extjs xTemplates and will render with each change 
            '<tbody itemId="taco-subTpl_3">',
                '{[this.getSubTpl("subTpl_3", values)]}',
            '</tbody>',
            '</table>',
            {
                view : me,
                getSubTpl: function (tplName, values) {                    
                    var tpl = this.view[tplName];
                    tpl.getCurrencyFormat = this.getCurrencyFormat;
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
                        retVal =  v;
                    }

                    return retVal;
                }
            }
        ];
    },
    /**
     * Do any class level cleanup. Destroy and null any scoped refs.     
     */
    onDestroy : function() {
        this.callParent(arguments);
    }
});
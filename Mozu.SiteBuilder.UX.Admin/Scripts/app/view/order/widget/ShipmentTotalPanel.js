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
        'Taco.core.ux.picker.Selector',
        'Taco.model.ShipmentAdjustment'
    ],

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

    createAdjustmentRowConfig: function() {
        var me = this;
        me.store = Ext.create('Ext.data.Store', {
            model: 'Taco.model.ShipmentAdjustment',
            data : [
                {
                    id: 'lineItemSubtotal',
                    adjustmentId: "itemAdjustment",
                    name: 'Sub Total',
                    originalAmount: me.shipmentRecord.lineItemSubtotal,
                    adjustmentAmount: me.shipmentRecord.itemAdjustment
                },
                {
                    id: 'lineItemTax',
                    adjustmentId: "itemTaxAdjustment",
                    name: 'Tax',
                    originalAmount: me.shipmentRecord.lineItemTax,
                    adjustmentAmount: me.shipmentRecord.itemTaxAdjustment
                },
                {
                    id: 'shippingSubtotal',
                    adjustmentId: "shippingAdjustment",
                    name: 'Shipping Total',
                    originalAmount: me.shipmentRecord.shippingSubtotal,
                    adjustmentAmount: me.shipmentRecord.shippingAdjustment
                },
                {
                    id: 'shippingTaxTotal',
                    adjustmentId: "shippingTaxAdjustment",
                    name: 'Shipping Tax',
                    originalAmount: me.shipmentRecord.shippingTaxTotal,
                    adjustmentAmount: me.shipmentRecord.shippingTaxAdjustment
                },
                {
                    id: 'handlingSubtotal',
                    adjustmentId: "handlingAdjustment",
                    name: 'Handling Total',
                    originalAmount: me.shipmentRecord.handlingSubtotal,
                    adjustmentAmount: me.shipmentRecord.handlingAdjustment
                },
                {
                    id: 'handlingTaxTotal',
                    adjustmentId: "handlingTaxAdjustment",
                    name: 'Handling Tax',
                    originalAmount: me.shipmentRecord.handlingTaxTotal,
                    adjustmentAmount: me.shipmentRecord.handlingTaxAdjustment
                }
            ],
            getAdjustedShippingTotal: function(){
                return Ext.Array.sum(this.pluck('adjustedTotal'));
            },
            resetAdjustmentAmounts: function(){
                this.each(function(record, idx){
                    record.set('adjustmentAmount', me.shipmentRecord[record.get('adjustmentId')]);
                })
            }
        });
    },

    initComponent: function (eOpts) {
        var me = this;
        me.cls = 'shipmentform-detail-totalpanel x-grid-row';

        if(!this.shipmentRecord) {
            return;
        }
        this.createAdjustmentRowConfig();
        this.initUI();
        me.callParent(arguments);
    },

    getAdjustmentDropdown: function (row) {
        var me = this;
       return Ext.widget({
            xtype: 'combobox',
            itemId: 'adjustmentType-' + row.get('id'),
            margin: '0 0 0 15',
            fieldStyle : {
                'font-size': '12px;'
            },
            editable: false,
            forceSelection: true,
            width: 170,
            value: -1,
            store: [[1, 'Add to ' + row.get('name')], [-1, 'Subtract from ' + row.get('name')]],
            style: {
                'padding-right': '10px'
            },
            listeners: {
                change: {
                    scope: this,
                    fn: function(field, newValue) {
                        var record = me.store.findRecord('id', row.get('id'));
                        var adjustmentCmp = me.down('#adjustmentTotal-' + record.get('id'));
                        if(adjustmentCmp) {
                            record.set('adjustmentAmount', (record.get('adjustmentAmount') * -1));
                            if(record.get("adjustmentAmount") !== 0) {
                                adjustmentCmp.update(record.formatCurrency(record.get("adjustedTotal")));
                                me.adjustedTotalField.update(Taco.app.context.getCurrent().formatCurrency(me.store.getAdjustedShippingTotal()));
                            }
                        }
                    }
                }
            },
            flex: 2
        });
    },
    
    getAmountFormField: function(row) {
        var me =this;
        return  Ext.create('Ext.form.FieldContainer', {
            itemId: Ext.id(),
            name: 'adjustmentForm',
            flex: 2,
            items: [
                {
                xtype : 'label',
                text : '$',            
                border: 1,
                height : 32,
                width : 22,
                style: {
                    borderColor: 'gray',
                    borderStyle: 'solid',
                    background : '#E5E2E1',
                    'margin-right' : '0px',
                    'padding' : '9px 5px 5px 5px;',
                    'border-right' : 0,
                    'border-top-left-radius': '3px',
                    'border-bottom-left-radius': '3px',
                    'float': 'left'
                }
                },
                {
                    xtype : 'textfield',
                    itemId: 'adjustmentField-' + row.get('id'),
                    height: '32px',
                    width: '100px',
                    value : (row.get('adjustmentAmount') < 0 ) ? row.get('adjustmentAmount') * -1 : row.get('adjustmentAmount'),
                    regex: /^([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(\.[0-9][0-9])?$/,
                    fieldStyle: {
                        'width': '98px',
                        'height': '27px',
                        'border-bottom': '0px'
                    },       
                    style: {
                        'width':'100px',
                        'height': '30px',
                        'borderColor': 'gray',
                        'borderStyle': 'solid',
                        'padding' : '1px',
                        'margin-left' : '0px',
                        'border-left' : 0,
                        'border-top-right-radius': '3px',
                        'border-bottom-right-radius': '3px',
                        'display': 'inline-block',
                        'border-width': '1px'
                    },
                    allowBlank: true,
                    validateOnChange : true,
                    listeners: {
                        change: function(cmp, newValue) {
                            var record = me.store.findRecord('id', row.get('id'));
                            var adjustmentCmp = me.down('#adjustmentTotal-' + row.get('id'));
                            var dropdownCmp = me.down('#adjustmentType-' + row.get('id'));
                            if(adjustmentCmp && dropdownCmp && record ){
                                if(newValue === "" || newValue === " " || newValue < 0) {
                                    adjustmentCmp.update('');
                                    return;
                                }
                                if(!cmp.validate()){
                                    return;
                                }
                                
                                var adjustment = dropdownCmp.value * newValue;
                                record.set('adjustmentAmount', adjustment);
                                adjustmentCmp.update(row.formatCurrency(row.get("adjustedTotal")));
                                me.adjustedTotalField.update(Taco.app.context.getCurrent().formatCurrency(me.store.getAdjustedShippingTotal()));
                            } 
                        }
                    }
                }
            ]
        })
    },

    getEditableRowContainer: function() {
        var me = this;
        var items = []

        me.store.each( function(row){
            var adjustmentTotalField = Ext.widget({
                xtype: 'component',
                itemId: 'originalTotal-' + row.get('id'),
                style: {
                    'text-align' : 'right',
                    'padding' : '10px'
                },
                cls: Taco.baseCSSPrefix + 'originalTotal',
                html: row.formatCurrency(row.get('originalAmount')),
                autoEl: {
                    tag: 'span'
                },
                flex: 1
            });
            items.push(
                Ext.widget({
                    itemId: Ext.id(),
                    xtype: 'panel',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            html: '<div class="label" style="padding:10px;">' + row.get('name') + '</div>',
                            flex: 1
                        },
                        adjustmentTotalField
                    ],
                    flex: 1
                })
                //html: '<span class="label">' + row.name + '</span><span class="price">' + row.amount +'</span>'
            );
            items.push(me.getEditableRow(row));
        });

        var container = Ext.widget({
            itemId: Ext.id(),
            xtype: 'panel',
            width: 500,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            defaults: {
                // applied to each contained panel
                bodyStyle: 'padding:5px'
            },
            items: items
            
        });
       
         return container;
    },

    getEditableRow: function(row) {
        var me =this;
        return Ext.widget({
            itemId: Ext.id(),
            xtype: 'panel',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                me.getAdjustmentDropdown(row),
                me.getAmountFormField(row),
                me.getAdjustedValueField(row)
            ],
            flex: 1
        })
    },

    getAdjustedValueField: function(row){
        return Ext.widget({
            xtype: 'component',
            itemId: 'adjustmentTotal-' + row.get('id'),
            cls: Taco.baseCSSPrefix + 'adjustmentTotal',
            html: (row.get('adjustmentAmount') === 0) ? '' : row.formatCurrency(row.get('adjustmentAmount')),
            style: {
                'text-align':'right',
                'padding': '10px 10px 0 0'
            },
            autoEl: {
                tag: 'span'
            },
            flex: 1
        });
    },

    getAdjustedTotalField: function() {
        var me = this;
        return Ext.widget({
            xtype: 'component',
            itemId: 'adjustedTotal',
            cls: Taco.baseCSSPrefix + 'adjustedTotal',
            html: Taco.app.context.getCurrent().formatCurrency(me.store.getAdjustedShippingTotal()),
            style: {
                'text-align':'right',
                'font-weight': 600,
                'padding': "20px 37px 10px 0"
            },
            autoEl: {
                tag: 'div'
            }
        });
    },
    

    initUI: function () {
        this.items = [];

        var me = this,
            isEditable = me.isEditable;

        this.adjustedTotalField = this.getAdjustedTotalField();

        this.editablePanel = Ext.widget({
            xtype: 'container',
            hidden: !me.isEditable,
            itemId: 'shipmentTotalPanelEdit',
            items: [this.getEditableRowContainer()]
        });

        var data = [];

        me.store.each(function(record) {
            data.push(record.getData());
        });

        this.summaryPanel= Ext.widget({
            xtype: 'component',
            hidden: me.isEditable,
            itemId: 'shipmentTotalPanelSummary',
            width: 400,
            tpl: [
                '<table>',
                    '<tpl for=".">',
                        '<tr>',
                            '<td style="width:180px;padding:10px;font-size:13px;"><span class="label">{name}</span></td>',
                            '<td style="width:180px;padding:10px;font-size:13px;text-align:right"><span class="price">',
                            '{[this.formatCurrency(values.adjustedTotal)]}',
                            '</span></td>',
                        '</tr>',
                    '</tpl>',    
                '</table>',
                {
                    formatCurrency: function (value) {
                        return Taco.app.context.getCurrent().formatCurrency(value);
                    }
                }
            ],
            data: data
        });

        this.btnCancelAdjustments = Ext.widget('button', {
            itemId: 'btnCancelAdjustments',
            ui: 'action',
            scale: 'medium',
            text: 'Cancel',
            hidden: !me.isEditable,
            handler: function (evt) {
                me.store.resetAdjustmentAmounts();
                me.toggleEdit(false);
            }
        });

        this.btnSaveAdjustments = Ext.widget('button', {
            itemId: 'btnSaveAdjustments',
            ui: 'action-primary',
            scale: 'medium',
            text: 'Save',
            style: {
                'margin-right': '10px',
            },
            hidden: !me.isEditable,
            handler: function (evt) {
                me.updateShipmentAdjustments();
            }
        });

        this.btnEditShipmentTotals = Ext.widget('button', {
            itemId: 'btnEditShipmentTotals',
            ui: 'action',
            scale: 'medium',
            text: 'Edit',
            hidden: me.isEditable,
            handler: function (evt) {
                me.toggleEdit(true);
            }
        });

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
                    width: 400,
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            html: '<h3 >' + (this.shipmentRecord.shipmentStatus.toLowerCase() == 'bopis' ? 'Store Pickup Total' : 'Shipment Total') + '</h3>',
                            flex: 1,
                        },
                        {
                            xtype: 'container',
                            layout: 'auto',
                            items: [
                                me.btnSaveAdjustments,
                                me.btnCancelAdjustments,
                                me.btnEditShipmentTotals,
                            ],
                            flex: 1,
                            style: {
                                'padding-right': '37px',
                                'text-align': 'right'
                            }
                        }
                        
                    ]
                },
                {
                    xtype: 'container',
                    layout: {
                        type: 'vbox',
                        align: 'right'
                    },
                    items: [
                        this.summaryPanel,
                        this.editablePanel,
                        this.adjustedTotalField
                    ]
                }
            ]
        });

        this.items.push(this.totalsContainer);
    },

    toggleEdit: function(toggle){
        if(toggle){
            this.isEditable = true;
            this.editablePanel.show();
            this.btnSaveAdjustments.show();
            this.btnCancelAdjustments.show();
            
            this.summaryPanel.hide();
            this.btnEditShipmentTotals.hide();
            return; 
        }
            this.editablePanel.hide();
            this.btnSaveAdjustments.hide();
            this.btnCancelAdjustments.hide();

            this.summaryPanel.show();
            this.btnEditShipmentTotals.show();
    },

    isShipmentAction: function () {
        if (this.shipmentRecord.shipmentStatus.toLowerCase() == 'fulfilled' || this.shipmentRecord.shipmentStatus.toLowerCase() == 'canceled')
            return true;
        return false;
    },

    getShippingAdjustmentsPayload: function () {
        var me = this;
            return {
                "orderId": this.record.get('id'),
                "shipmentNumber": this.shipmentRecord.number,
                "shipmentAdjustment": {
                    itemAdjustment: me.store.getById('lineItemSubtotal').adjustmentAmount,
                    itemTaxAdjustment:  me.store.getById('lineItemTax').adjustmentAmount,
                    shippingAdjustment: me.store.getById('shippingSubtotal').adjustmentAmount,
                    shippingTaxAdjustment: me.store.getById('shippingTax').adjustmentAmount,
                    handlingAdjustment:me.store.getById('handlingSubtotal').adjustmentAmount,
                    handlingTaxAdjustment: me.store.getById('handlingTaxTotal').adjustmentAmount
                }
            }
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

    /**
     * Do any class level cleanup. Destroy and null any scoped refs.     
     */
    onDestroy: function () {
        this.callParent(arguments);
    }

});
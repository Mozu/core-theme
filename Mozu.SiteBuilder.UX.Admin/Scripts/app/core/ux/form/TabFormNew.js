/**
 * @class Taco.core.ux.form.TabForm
 */
Ext.define('Taco.core.ux.form.TabFormNew', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco.tabformnew',
    requires: [
        'Taco.core.ux.grid.plugins.AutoSelect',
        'Taco.view.order.widget.ShipmentTotalPanel',
        'Taco.view.order.widget.ShipmentTotalPanelEdit'
    ],

    // this is an offset adjustment to move the left nav up and down relative to the first subForm's top edge.
    // By defaul the left nav will adjust itself to align with the top of the first subform;
    // this is primarily here to support the tabs in the product navform;
    leftNavTopOffset: 0,

    subPanelMinHeight: 100,
    
    isCollapsed: false,    

    initComponent: function () {
        var me = this;
        this.cls = this.cls || '';
        this.cls += ' taco-tabform';

        var originalItems = [];
        var excludedItems = [];
        
        Ext.Array.each(this.items, function (item, index) {
            if (!item) return;

            if (item.excludeFromNavigation) {
                excludedItems.push(item);
            } else {
                // add a minHeight to the panel so that the tabs have a panel to engage;
                //item.minHeight = this.subPanelMinHeight;
                originalItems.push(item)
            }
        });

        this.formContainer = Ext.widget({
            xtype: 'container',
            layout: {
                type: 'card',
                deferredRender: true
            },
            cls: '',
            items: originalItems,
            listeners: {
                scope: me,
                beforeadd: function (view, component, index, eOpts) {
                    // add a minHeight to the panel so that the tabs have a panel to engage;
                    component.minHeight = me.subPanelMinHeight;
                }
            }
        });

        this.relayEvents(this.formContainer, ['add']);

        this.navStore = Ext.create('Ext.data.Store', {
            fields: ['title', 'tabTitle', 'hidden','isTabTitleHtml']
        });

        this.leftNav = Ext.widget({
            xtype: 'dataview',
            store: this.navStore,
            itemId: 'navFormNav',
            cls: 'taco-form-nav-new',
            autoShow: true,
            itemSelector: '.taco-link-button-item',
            plugins: ["autoselect"],
            width: '100%',
            height: 51,
            selModel: Ext.create('Ext.selection.DataViewModel', {
                enableKeyNav: false
            }),
            listeners: {
                itemclick: function (view, record, item, index, e, eOpts) {
                    this.setActiveItemUI(item);
                    if (item && !item.className.includes('taco-link-button-packages-collapsable'))
                        this.onNavClick(view, record, item, index, e);
                },
                itemkeydown: function (view, record, item, index, e) {
                    if (e.getKey() == Ext.EventObject.ENTER) {
                        item.click();
                    }
                },
                viewready: function (obj) {
                    var collapse = obj.el.dom.getElementsByClassName('taco-link-collapsable')[0];
                    Ext.create('Ext.Button', {
                        cls: 'package-tab-details' + (this.isCollapsed ? ' rotateIcon' : ''),
                        glyph: 'XE92A@mozicons',
                        width: 28,
                        ui: 'action',
                        scale: 'small',
                        margin: '0 0 0 0',
                        renderTo: collapse,
                        handler: function (button, event) {                            
                            if (me.formContainer.hidden) {
                                button.removeCls('rotateIcon');
                                me.removeCls('borderbottom');
                                me.formContainer.show(true);
                                me.shipmentTotals.show(true);
                            }
                            else {
                                button.addCls('rotateIcon');
                                me.addCls('borderbottom');
                                me.formContainer.hide(true);
                                me.shipmentTotals.hide(true);
                            }
                        },
                    })
                },
                scope: this
            },
            tpl: [
                '<ul class="package-tab-parent">',
                '<li class="taco-link-button taco-link-button-packages-collapsable"><div class="taco-link-collapsable"></div></li>',
                '<tpl for=".">',
                '<li class="taco-link-button-item taco-link-button <tpl if="xindex == 1">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Label.active + '</tpl> <tpl if="values.isTabTitleHtml">taco-link-button-html</tpl>" ><tpl if="values.tabTitle">{tabTitle}<tpl else>{title}</tpl></li>',
                '</tpl>',
                '</ul>',
                {

                }
            ]
        })

        this.scrollSpacer = Ext.widget({
            xtype: 'component',
            width: '100%',
            height: 0,
            html: ''
        });

        var items = excludedItems;
        items.push(this.leftNav);
        items.push(this.scrollSpacer);
        items.push(this.formContainer);

        this.createAdjustmentTotalStore = function() {
            var me = this;
            me.store = Ext.create('Ext.data.Store', {
                model: 'Taco.model.ShipmentAdjustment',
                data : [
                    {
                        id: 'item',
                        adjustmentId: "itemAdjustment",
                        name: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.item_subtotal,
                        originalAmount: me.shipmentRecord.lineItemSubtotal,
                        currentAmount: me.shipmentRecord.lineItemSubtotal,
                        originalAdjustmentAmount: me.shipmentRecord.shipmentAdjustment,
                        adjustmentAmount:  me.shipmentRecord.shipmentAdjustment
                        
                    },
                    {
                        id: 'itemTax',
                        adjustmentId: "itemTaxAdjustment",
                        name: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.item_tax,
                        originalAmount: me.shipmentRecord.lineItemTaxTotal,
                        currentAmount: me.shipmentRecord.lineItemTaxTotal,
                        originalAdjustmentAmount: me.shipmentRecord.lineItemTaxAdjustment,
                        adjustmentAmount: me.shipmentRecord.lineItemTaxAdjustment
                    },
                    {
                        id: 'shippingSubtotal',
                        adjustmentId: "shippingAdjustment",
                        name: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.shipping_subtotal,
                        originalAmount: me.shipmentRecord.shippingSubtotal,
                        currentAmount: me.shipmentRecord.shippingSubtotal,
                        originalAdjustmentAmount: me.shipmentRecord.shippingAdjustment,
                        adjustmentAmount:  me.shipmentRecord.shippingAdjustment
                    },
                    {
                        id: 'shippingTaxTotal',
                        adjustmentId: "shippingTaxAdjustment",
                        name: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.shipping_tax,
                        originalAmount: me.shipmentRecord.shippingTaxTotal,
                        currentAmount: me.shipmentRecord.shippingTaxTotal,
                        originalAdjustmentAmount: me.shipmentRecord.shippingTaxAdjustment,
                        adjustmentAmount: me.shipmentRecord.shippingTaxAdjustment
                    },
                    {
                        id: 'handlingSubtotal',
                        adjustmentId: "handlingAdjustment",
                        name: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.handling_subtotal,
                        originalAmount: me.shipmentRecord.handlingSubtotal,
                        currentAmount: me.shipmentRecord.handlingSubtotal,
                        originalAdjustmentAmount: me.shipmentRecord.handlingAdjustment,
                        adjustmentAmount: me.shipmentRecord.handlingAdjustment
                    },
                    {
                        id: 'handlingTaxTotal',
                        adjustmentId: "handlingTaxAdjustment",
                        name: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ShipmentTotalPanel.handling_tax,
                        originalAmount: me.shipmentRecord.handlingTaxTotal,
                        currentAmount: me.shipmentRecord.handlingTaxTotal,
                        originalAdjustmentAmount: me.shipmentRecord.handlingTaxAdjustment,
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
        };

        this.getShippingAdjustmentsPayload = function () {
            var me = this;
            var calcAdjustmentAmount = function(fieldName){
               //return  me.store.getById(fieldName).get('adjustmentAmount') + me.store.getById(fieldName).get('originalAdjustmentAmount');

               return me.store.getById(fieldName).get('adjustmentAmount');
            };
                return {
                    "orderId": this.record.get('id'),
                    "shipmentNumber": this.shipmentRecord.number,
                    "shipmentAdjustment": {
                        itemAdjustment: calcAdjustmentAmount('item'),
                        itemTaxAdjustment:  calcAdjustmentAmount('itemTax'),
                        shippingAdjustment: calcAdjustmentAmount('shippingSubtotal'),
                        shippingTaxAdjustment: calcAdjustmentAmount('shippingTaxTotal'),
                        handlingAdjustment: calcAdjustmentAmount('handlingSubtotal'),
                        handlingTaxAdjustment: calcAdjustmentAmount('handlingTaxTotal')
                    }
                }
        };

        this.validateShipmentAdjustmentFields = function() {
            var NEGATIVE_ADJUSTMENT_ERROR = Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.adjustment_totals_negative
            var validated = true;
            
            this.store.each(function(item){
                if(item.get('originalAmount') + item.get('adjustmentAmount') < 0) {
                    validated = false;
                };
            })

            if(!validated) {
                Taco.app.fireEvent('setmessage', NEGATIVE_ADJUSTMENT_ERROR, 'error');
            }

            return validated;
        };
    
        this.updateShipmentAdjustments = function () {
            var me = this;
            
            if(!this.validateShipmentAdjustmentFields()){
                return false;
            }

            me.setLoading(true, this.body);
            var payloadData = me.getShippingAdjustmentsPayload();

            this.record.updateShipmentAdjustments({
                jsonData: payloadData,
                success: function (response) {
                    me.setLoading(false, this.body);
                    var json = Ext.decode(response.responseText, true);
                    if (!json || !json.success) {
                        Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.error_updating_shipment_totals, 'error');
                        return;
                    }
                    Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.totals_updated_successfully, 'success');
                    me.fireEvent('shipmentRefresh');

                    me.shipmentTotals.show(true);
                    me.shipmentTotalsEdit.hide(true);

                    me.shipmentEditBtn.show(true);
                    me.shipmentSaveBtn.hide(true);
                    me.shipmentCancelBtn.hide(true);
                },
                failure: function (response) {
                    me.setLoading(false, this.body);
                    // error handling here
                    Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.error_updating_shipment_totals, 'error');
                    me.store.resetAdjustmentAmounts();
                },
                scope: me
            });
        };

        this.createAdjustmentTotalStore();

        //subtotals, orderlevel discounts, tax shipping, and totals
        this.shipmentTotals = Ext.create('Taco.view.order.widget.ShipmentTotalPanel', {
            itemId: Ext.id(),
            margin: '0 0 20 0',
            style: {
                clear: "both"
            },
            store: me.store,
            record: this.record,
            shipmentRecord: me.shipmentRecord,
            listeners: {
                shipmentRefresh: function () {
                    me.fireEvent('shipmentRefresh');
                }
            }
        });

        this.shipmentTotalsEdit = Ext.create('Taco.view.order.widget.ShipmentTotalPanelEdit', {
            margin: '0 0 20 0',
            style: {
                clear: "both"
            },
            record: this.record,
            shipmentRecord: me.shipmentRecord,
            store: me.store,
            hidden: true,
            listeners: {
                shipmentRefresh: function () {
                    me.fireEvent('shipmentRefresh');
                }
            }
        });

        this.shipmentEditBtn = Ext.create('Ext.Button', {
            itemId: Ext.id(),
            cls: 'Edit',
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Buttons.edit,
            style: {
                "float": "right",
                "margin": "0 10px 0 0"
            },
            ui: 'action',
            scale: 'medium',
            disabled: me.shipmentRecord.shipmentType == "Transfer",
            handler: function (button, event) {
                me.shipmentTotals.hide(true);
                me.shipmentTotalsEdit.show(true);

                me.shipmentEditBtn.hide(true);
                me.shipmentSaveBtn.show(true);
                me.shipmentCancelBtn.show(true);
            }
        });

        this.shipmentCancelBtn = Ext.create('Ext.Button', {
            itemId: Ext.id(),
            cls: 'cancel',
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Buttons.cancel,
            hidden: true,
            ui: 'action',
            scale: 'medium',
            style: {
                "float": "right",
                "margin": "0 10px 0 10px"
            },
            handler: function (button, event) {
                me.shipmentTotals.show(true);
                me.shipmentTotalsEdit.hide(true);

                me.shipmentEditBtn.show(true);
                me.shipmentSaveBtn.hide(true);
                me.shipmentCancelBtn.hide(true);
            }
        });

        this.shipmentSaveBtn = Ext.create('Ext.Button', {
            cls: 'save',
            hidden: true,
            style: {
                "float": "right"
            },
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Buttons.save,
            ui: 'action',
            scale: "medium",
            margin: '0 0 0 0',
            handler: function (button, event) {
                me.updateShipmentAdjustments() 
            }
        });

        var totalPanelItems = [
            this.shipmentEditBtn,
            this.shipmentCancelBtn,
            this.shipmentSaveBtn,
            this.shipmentTotals,
            this.shipmentTotalsEdit
        ];

        this.totalPanel = Ext.widget({
            xtype: 'container',
            width: '500px',
            items: totalPanelItems
        });

        items.push(this.totalPanel);

        this.items = items;

        this.callParent(arguments);

        this.nav = this.down('#navFormNav');

        if (this.isCollapsed) {
            me.addCls('borderbottom');
            me.formContainer.hide(true);
            me.shipmentTotals.hide(true);
        }
    },

    initPosition: function () {
        this.formContainer.getPosition();
    },

    getWrapper: function () {
        if (!this._wrapper) {
            this._wrapper = Ext.ComponentQuery.query('fulleditor')[0];
        }
        return this._wrapper;
    },

    setActiveItemUI: function (item) {
        if (item) {
            Ext.each(this.getEl().query('li.active'), function (dom) {
                Ext.fly(dom).removeCls('active');
            });

            if (item)
                Ext.fly(item).focus().addCls('active');
        }
    },

    onNavClick: function (view, record, item) {
        if (record.raw.getEl && !item) {
            var panel = Ext.getCmp(record.get('id'));
            var layout = this.formContainer.getLayout();
            layout.setActiveItem(panel);
        }
        else {
            var layout = this.formContainer.getLayout();
            layout.setActiveItem(this.getItemIndex(item.innerHTML));
        }
    },

    getItemIndex: function (itemName) {
        for (var i = 0; i < this.formContainer.items.items.length; i++) {
            if (this.formContainer.items.items[i].tabTitle == itemName)
                return i;
        }
        return 0;
    },

    loadNavItems: function (items) {
        var components,
            recordsToAdd = [],
            previousSelectedForm;

        // need to determine the current selection before reloading the nav;
        var selection = this.leftNav.getSelectionModel().getSelection();
        if (selection && selection.length) {
            previousSelectedForm = selection[0];
        }

        if (items) {
            this.formContainer.removeAll();
            components = this.formContainer.add(items);
        } else {
            components = this.formContainer.items.items;
        }

        // need to cull hidden panels from the store so that the dataview doesn't mismatch the record to the item clicked;  It currently uses index position and the hidden records are causing the mismatch;
        Ext.Array.each(components, function (item) {
            recordsToAdd.push(item);
        });

        this.navStore.loadRawData(recordsToAdd);

        if (this.navStore.count()) {
            this.formContainer.show();
            this.leftNav.show();
        } else {
            this.formContainer.hide();
            this.leftNav.hide();
        }
    }
});
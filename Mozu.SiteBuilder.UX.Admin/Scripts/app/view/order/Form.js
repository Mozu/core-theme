/**
 * @class Taco.view.order.Form
 */
Ext.define('Taco.view.order.Form', {
    //extend: 'Taco.core.ux.form.NavForm2',
    extend: 'Taco.core.ux.form.TabForm',
    
    alias: 'widget.taco-orderform',
    requires: [
        'Taco.model.Order',
        'Taco.model.OrderPayment',
        'Taco.view.order.Header',
        'Taco.view.order.subform.Customer',
        'Taco.view.order.subform.Detail',
        'Taco.view.order.subform.Payment',
        'Taco.view.order.subform.Return',
        'Taco.view.order.subform.InternalNotes',
        'Taco.view.order.subform.Fulfillment',
        'Taco.view.order.subform.FulfillmentNew',
        'Taco.view.order.subform.Attributes',
        'Taco.view.order.subform.AuditLog',
        'Taco.view.order.subform.fulfillment.DirectShip',
        'Taco.store.PackagingTypes',
        'Taco.store.Channels',
        'Taco.store.Countries',
        'Taco.store.Attributes',
        'Taco.store.OrderAttributes',
        'Taco.model.CheckoutSettings'
    ],

    model: 'Taco.model.Order',

    config: {
        customer: null
    },

    stickyClass: 'taco-fixed-navForm2-no-padding',

    editTitle: [
        Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.edit_order_no + ' {number}',
        '<span class="taco-order-status {status}">',
            //'{status}',
            'Site: {siteName}',
        '</span>'
    ],

    createTitle: [
        Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.create_order_no + ' {number}',
        '<span class="taco-order-status">',
            //'{status}',
            'Site: {siteName}',
        '</span>'
    ],

    // layout: 'card',
    //enableScrollSpy: false,

    setNavDimensions: function() {
        var navStyle = this.sectionNav.getEl().dom.style;

        navStyle.left = this.getX() + 'px';

        navStyle.top = this.getHeaderHeight() + this.sectionNavTopOffset + 'px';
    },

    initComponent: function () {
        var me = this;
        this.checkoutSettings = null;

        var fields = Taco.model.CheckoutSettings.getFields(),
            purchaseOrder = {};

        fields.forEach(function (field) {
            if (field.name == 'purchaseOrder') {
                purchaseOrder = field;
                return;
            }
        });

        Taco.model.CheckoutSettings.load(123, {
            scope: this,
            failure: function () {
            },
            success: function (record) {
            },
            callback: function (record) {
                me.checkoutSettings = record;
            }
        });

        // after the record is reloaded we will need to refresh the ui
        me.mon(me.record, 'aftercommit', function () {
            me.onRecordChange();
        }, me);

        me.ajaxBeforeListener = Ext.Ajax.on('beforerequest', function (conn, options) {

            // set order price list on the ajax call!
            // This should be called before the TaContext...find settings.
            var priceListHeader = {};
            priceListHeader['x-vol-pricelist'] = me.record.get('priceListCode');

            if (options && options.headers) {
                Ext.applyIf(options.headers, priceListHeader);
            }

            //if (options && options.operation && options.operation.headers) {
            //    Ext.apply(options.headers, options.operation.headers);
            //}
        }, me, { destroyable: true });

        this.customer = {};
        // todo: get the customer record right away if an id exists;

        this.updateTitleData();

        this.buildForm();

        this.callParent(arguments);
        this.loadNavItems();
    },

    onDestroy: function () {
        // Turn off the ajaxBeforeListener to halt the pricelist header addition.
        if (this.ajaxBeforeListener) {
            this.ajaxBeforeListener.destroy();
        }
    },

    onCustomerChange: function (view, customerRecord) {
    },

    onBeforeReload: function () {
        //save the scrollTop position so that the main form container will be able to restore the scroll position
        var scrollPanel = this.el.up(".taco-content-body").el.dom;
        this.record.scrollTopTarget = scrollPanel.scrollTop;
    },
    
    updateTitleData: function () {
        this.titleData = {
            number: this.record.get('orderNumber'),
            status: this.record.get('orderStatus'),
            siteName: this.record.get('siteName')
        };
    },

    isHeaderDataComplete: function () {
        var me = this,
            fulfillmentContact = me.record.get("fulfillmentContact");

        // BillingContact is no longer checked here. See issue #70588 for details.

        // Pickup-only orders don't require fulfillment info.
        if (me.record.isPickupOnlyOrder()) return true;

        // If we have a fulfillment contact and its not an empty object
        if (!fulfillmentContact || Ext.Object.isEmpty(fulfillmentContact)) return false;

        return true;
    },

    updatePanelVisibility: function () {
        var me = this,
            orderItems = this.record.get("items"),
            navUpdateRequired = false;
        

        // need to cache what's selected 
        

        // begin if statement from hell...
        // if a admin entered order that has not been submitted we need to do some visibility magic;
        if (this.record.get("orderStatus") == "Pending") {
            // need to adjust the visibility of subforms based on the progression of data entry in phone orders
            if (me.isHeaderDataComplete()) {
                //this.formContainer.show()

                navUpdateRequired = true;
                if (!this.orderDetailPanel.rendered) {
                    this.formContainer.add(this.orderDetailPanel);
                }

                if (!this.auditLogPanel.rendered) {
                    this.formContainer.add(this.auditLogPanel);
                }

                // If the order has some order items
                if (orderItems.length) {
                    // If the paymentPanel is not rendered
                    if (!this.paymentPanel.rendered) {
                        this.formContainer.insert(1, this.paymentPanel);
                        navUpdateRequired = true;
                    }
                }

            } else {
                navUpdateRequired = true;
            }

            if (navUpdateRequired) {
                this.loadNavItems();
            }
        }

    },

    onRecordChange: function () {
        var me = this;
        
        this.updatePanelVisibility();

        if (this.record.scrollTopTarget) {
            Ext.Function.defer(function () {
                me.el.up('.taco-content-body').dom.scrollTop = me.record.scrollTopTarget;
            }, 1000, me);
        }

        // update the title data with the latest version of the record
        this.updateTitleData();
        // update the superclasses title logic.
        this.initTitle();
    },

    buildForm: function () {
        var me = this;
        var items = [];
        
        var subformCfg = {
            record: this.record,
            orderForm: this
        };

        this.headerCmp = Ext.create('Taco.view.order.Header', Ext.apply({
            excludeFromNavigation: true,
            listeners: {
                scope: this,
                afterlayout: function (view, width, height, oldWidth, oldHeight) {
                    // this one only exists if this is in navForm2 instead of tabForm; TODO: refactor navForm2 to not cache the panel heights in the store; ie get rid of the mapping.
                    if (this.rebuildMap) {
                        this.rebuildMap();
                    }
                }
            }
        }, subformCfg));

        this.mon(this.headerCmp, 'customerchanged', this.onCustomerChange, me);

        items.push(this.headerCmp);

        this.orderDetailPanel = Ext.create('Taco.view.order.subform.Detail', Ext.apply({}, subformCfg)); 

        this.paymentPanel = Ext.create('Taco.view.order.subform.Payment', Ext.apply({}, subformCfg));

        this.auditLogPanel = Ext.create('Taco.view.order.subform.AuditLog', subformCfg);

        var isOnlineOrder = me.record.get("orderType") === "Online";
        var isFulfillerUser = Taco.user.isFulfillerUser;

        // we always show for online orders. for offline orders we need hide the detail panel until the header is filled out.
        if (isOnlineOrder || me.isHeaderDataComplete()) {
            items.push(this.orderDetailPanel);
        }

        //If this is legacy order then dont show the shipments,payment and returns tab
        if (this.record.get('isUnified')) {
            //Todo:here we have to switch new or old tabs based on tenant configs
            if (this.isEdit()) {
                items.push(Ext.create('Taco.view.order.subform.FulfillmentNew', subformCfg));
            }
        }

        if (this.record.get('isUnified')) {
            // we always show for online orders and conditionaly show for offline orders
            if (!isFulfillerUser && (isOnlineOrder || (me.isHeaderDataComplete() && this.record.get("items").length))) {
                items.push(this.paymentPanel);
            }
        }

        if (this.record.get('isUnified')) {
            // adding the header data check here because there are instances of old data that lack shipping and billing contact.
            if (this.isEdit() && (isOnlineOrder || me.isHeaderDataComplete())) {
                items.push(Ext.create('Taco.view.order.subform.Return', subformCfg));
            }
        }

        // we always show for online orders. for offline orders we need hide the audit panel until the header is filled out.
        if (isOnlineOrder || me.isHeaderDataComplete()) {
            items.push(this.auditLogPanel);
        }

        this.items = items;
    },

    isEdit: function () {
        var status = this.record.get('orderStatus');
        return status !== 'Pending' && status !== 'Abandoned';
    },

    isErrored: function () {
        return this.record.get('orderStatus') === 'Errored';
    },

    isValid: function () {
        var me = this,
            isValid = true,
            errors = [];

        if (this.isErrored()) return true;

        var isPickupOnly = this.record.isPickupOnlyOrder();
        var isShippable = this.record.isShippable();
        // Only validate when in create mode
        if (this.isEdit()) isValid = false;

        if (!this.record.get("customerId")) {
            isValid = false;
            errors.push(Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.submitting_order);
        } else if (!isPickupOnly && Ext.Object.isEmpty(this.record.get("fulfillmentContact"))) {
            isValid = false;
            errors.push(Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.added_shipping_address);
        } else if (!isPickupOnly && !this.record.get("fulfillmentContact").email) {
            isValid = false;
            errors.push(Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.contain_email_address);
        } else if (Ext.Object.isEmpty(this.record.get("billingContact"))) {
            isValid = false;
            errors.push(Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.added_billing_address);
        } else if (!this.record.itemsStore.count()) {
            isValid = false;
            errors.push(Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.add_products);
        } else if (isShippable && !this.record.get("shippingMethodCode")) {
            isValid = false;
            errors.push(Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.selected_shipping_method);
        }
        
        if (errors.length) {
            Taco.app.fireEvent('setmessage', errors.join("<br/>"), 'error', me);

            // fire an event so that the editor wrapper can reenable the save button;
            this.fireEvent('beforesavefailure', me, errors);
        }

        return isValid;
    },

    beforeSave: function () {
        var retVal = this.isValid();
        return retVal;
    },

    addSaveTasks: function (tasks) {
        var me = this;

        tasks.add({ 
            key: 'submitorder',
            fn: function (task) {
                Ext.Ajax.request({
                    url: '/admin/app/order/submit',
                    method: 'POST',
                    jsonData: {
                        orderId: me.record.getId()
                    },
                    success: function () {                        
                        //alert("Your order was created! Yay! You should probably close this window now.");
                        task.callback();                        
                    },
                    failure: function (response) {                        
                        var json = Ext.decode(response.responseText, true),
                            msg = (json && json.message) ? json.message : Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.error_adding_saving_order;

                        // this is the validation message that you get when you have not met the min. requirements for saving a form.
                        if (msg == "Item not found: Action 'SubmitOrder' not found or available. ") {
                            // TODO: This is probably not the only reason submit can fail. Handle this scenario better.
                            msg = Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.unable_to_submit_order;
                        }

                        Taco.app.fireEvent('setmessage', msg, 'error');
                        task.callback(true);
                    }
                });
            }
        });
        return tasks;
    }
})

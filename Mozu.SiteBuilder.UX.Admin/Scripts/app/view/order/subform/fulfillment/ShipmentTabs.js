/**
 * @class Taco.view.order.subform.fulfillment.ShipmentTabs
 */
Ext.define('Taco.view.order.subform.fulfillment.ShipmentTabs', {
    extend: 'Taco.core.ux.form.TabFormNew',

    alias: 'widget.taco-shipmentform',
    requires: [
        'Taco.view.order.subform.fulfillment.AllItemsTab',
        'Taco.view.order.subform.fulfillment.ShippedFromTab',
        'Taco.view.order.subform.fulfillment.CancellationTab'
    ],

    //model: 'Taco.model.Order',
    //this will hide Edit header
    showTitle: false,
    stickyClass: 'taco-fixed-navForm2-no-padding',
    cls: 'taco-shipmentform-packages',

    setNavDimensions: function () {
        var navStyle = this.sectionNav.getEl().dom.style;

        navStyle.left = this.getX() + 'px';

        navStyle.top = this.getHeaderHeight() + this.sectionNavTopOffset + 'px';
    },

    initComponent: function () {
        var me = this;

        if (this.shipmentRecord.shipmentStatus.toLowerCase() == 'fulfilled' || this.shipmentRecord.shipmentStatus.toLowerCase() == 'canceled')
            this.isCollapsed = true;

        this.buildForm();
        this.callParent(arguments);
        this.loadNavItems();
    },

    onDestroy: function () {

    },

    onBeforeReload: function () {
        //save the scrollTop position so that the main form container will be able to restore the scroll position
        var scrollPanel = this.el.up(".taco-content-body").el.dom;
        this.record.scrollTopTarget = scrollPanel.scrollTop;
    },

    buildForm: function () {
        var me = this;

        var subformCfg = {
            record: this.record
        };

        var items = [];
        items.push(Ext.create('Taco.view.order.subform.fulfillment.AllItemsTab', {
            record: this.record,
            shipmentRecord: this.shipmentRecord,
            listeners: {
                shipmentRefresh: function () {
                    me.fireEvent('shipmentRefresh');
                }
            }
        }));
        if (this.shipmentRecord.fulfillmentLocationCode && this.shipmentRecord.location) {
            items.push(Ext.create('Taco.view.order.subform.fulfillment.ShippedFromTab', {
                record: this.record,
                shipmentRecord: this.shipmentRecord,
                listeners: {
                    shipmentRefresh: function () {
                        me.fireEvent('shipmentRefresh');
                    }
                }
            }));
        }

        var tracking = this.fetchTrackingNumbersfromPackages();

        if (tracking.count>0) {
            items.push(Ext.create('Taco.view.order.subform.fulfillment.TrackingNumberTab', {
                record: this.record,
                tracking: tracking,
                shipmentRecord: this.shipmentRecord,
                listeners: {
                    shipmentRefresh: function () {
                        me.fireEvent('shipmentRefresh');
                    }
                }
            }));
        }
        
        if (this.shipmentRecord.canceledItems && this.shipmentRecord.canceledItems.length > 0) {
            items.push(Ext.create('Taco.view.order.subform.fulfillment.CancellationTab', {
                record: this.record,
                shipmentRecord: this.shipmentRecord,
                listeners: {
                    shipmentRefresh: function () {
                        me.fireEvent('shipmentRefresh');
                    }
                }
            }));
        }
        this.items = items;
    },

    fetchTrackingNumbersfromPackages: function () {
        var result = {
            count: 0,
            trackingData:[]
        };
        if (this.shipmentRecord.packages && this.shipmentRecord.packages.length > 0) {
            for (var count = 0; count < this.shipmentRecord.packages.length; count++) {
                if (this.shipmentRecord.packages[count].trackingNumbers && this.shipmentRecord.packages[count].trackingNumbers.length > 0) {
                    var isMethodExists = this.isShippingMethodExists(result.trackingData, this.shipmentRecord.packages[count].shippingMethodCode);
                    if (isMethodExists >= 0) {
                        result.trackingData[isMethodExists].trackingNumbers = result.trackingData[isMethodExists].trackingNumbers.concat(this.shipmentRecord.packages[count].trackingNumbers);
                    }
                    else {
                        result.trackingData.push({
                            shippingMethodCode: this.shipmentRecord.packages[count].shippingMethodCode,
                            trackingNumbers: this.shipmentRecord.packages[count].trackingNumbers
                        });
                    }
                    result.count += parseInt(this.shipmentRecord.packages[count].trackingNumbers.length);
                }
            }
        }
        return result;
    },

    isShippingMethodExists: function (trackingData, methodCode) {
        var trackingIndex = -1;
        if (methodCode) {
            for (var count = 0; count < trackingData.length; count++) {
                if (trackingData[count].shippingMethodCode == methodCode)
                    return count;
            }
        }
        else if (trackingData.length > 0)
            trackingIndex = 0;
        return trackingIndex;
    }
})

/**
 * @class Taco.view.order.subform.fulfillment.ShipmentTabs
 */
Ext.define('Taco.view.order.subform.fulfillment.ShipmentTabs', {
    extend: 'Taco.core.ux.form.TabFormNew',

    alias: 'widget.taco-shipmentform',
    requires: [
        'Taco.view.order.subform.fulfillment.AllItemsTab',
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
        if (this.shipmentRecord.locationCode && this.shipmentRecord.location) {
            items.push(Ext.create('Taco.view.order.subform.fulfillment.ShippedFromTab', {
                record: this.record,
                shipmentRecord: this.shipmentRecord

            }));
        }

        //todo: following static data is only for demo
        //this.shipmentRecord.trackingNumbers = ['TR1873917231973917', 'TR1873917231973954'];

        if (this.shipmentRecord.trackingNumbers && this.shipmentRecord.trackingNumbers.length > 0) {
            items.push(Ext.create('Taco.view.order.subform.fulfillment.TrackingNumberTab', {
                record: this.record,
                shipmentRecord: this.shipmentRecord
            }));
        }

        //todo: following static data is only for demo
        //this.shipmentRecord.canceledItems = this.shipmentRecord.items;
        
        if (this.shipmentRecord.canceledItems && this.shipmentRecord.canceledItems.length > 0) {
            items.push(Ext.create('Taco.view.order.subform.fulfillment.CancellationTab', {
                record: this.record,
                shipmentRecord: this.shipmentRecord
            }));
        }
        this.items = items;
    }
})

/**
 * @class Taco.view.order.subform.fulfillment.Packages
 */
Ext.define('Taco.view.order.subform.fulfillment.Packages', {
    extend: 'Taco.core.ux.form.TabForm',

    alias: 'widget.taco-shipmentform',
    requires: [
        'Taco.view.order.subform.fulfillment.PackageTab',
        'Taco.view.order.widget.OrderTotalPanel'
    ],

    //model: 'Taco.model.Order',
    showTitle:false,
    stickyClass: 'taco-fixed-navForm2-no-padding',
    cls: 'taco-shipmentform-packages',
    collapsible:true,
    setNavDimensions: function () {
        var navStyle = this.sectionNav.getEl().dom.style;

        navStyle.left = this.getX() + 'px';

        navStyle.top = this.getHeaderHeight() + this.sectionNavTopOffset + 'px';
    },

    initComponent: function () {
        var me = this;

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
        var items = [];
        var subformCfg = {
            record: this.record
        };

        //Loop through all packages and 
        //var packages = this.record.get('packages');
        //for (var packageCount = 0; packageCount < packages.length; packageCount++) {
        //    items.push(Ext.create('Taco.view.order.subform.fulfillment.PackageTab', {
        //        record: this.record,
        //        packageRecord: packages[packageCount]
        //    }));
        //}


        //Following are only for demo
        var packages = this.record.get('packages');
        for (var packageCount = 0; packageCount <= Math.floor(Math.random() * 10); packageCount++) {

            var name = packageCount == 0 ? 'All Items' : 'package-' + packageCount;
            packages[0].code = name;
            items.push(Ext.create('Taco.view.order.subform.fulfillment.PackageTab', {
                record: this.record,
                packageRecord: packages[0]
            }));
        }

        // subtotals, orderlevel discounts, tax shipping, and totals
        //this.orderTotals = Ext.create('Taco.view.order.widget.OrderTotalPanel', {
        //    margin: '0 0 20 0',
        //    record: this.record
        //});
        //items.push(this.orderTotals);

        this.items = items;
    }
    
})

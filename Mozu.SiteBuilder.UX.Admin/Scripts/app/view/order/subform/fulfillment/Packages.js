/**
 * @class Taco.view.order.subform.fulfillment.Packages
 */
Ext.define('Taco.view.order.subform.fulfillment.Packages', {
    extend: 'Taco.core.ux.form.TabFormNew',

    alias: 'widget.taco-shipmentform',
    requires: [
        'Taco.view.order.subform.fulfillment.PackageTab'
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


        //Show All items
        //items.push(Ext.create('Taco.view.order.subform.fulfillment.AllItemsTab', {
        //    record: this.record,
        //    shipmentRecord: this.shipmentRecord
        //}));

        //Loop through all packages and 
        //var packages = this.record.get('packages');
        //if (packages && packages.length > 0) {
        //    for (var packageCount = 0; packageCount < packages.length; packageCount++) {
        //        items.push(Ext.create('Taco.view.order.subform.fulfillment.PackageTab', {
        //            record: this.record,
        //            packageRecord: packages[packageCount]
        //        }));
        //    }
        //}

        //Following are only for demo
        var packages = this.record.get('packages');
        //var temp = Math.floor(Math.random() * 10);
        for (var packageCount = 0; packageCount < 10; packageCount++) {

            var name = packageCount == 0 ? 'All Items' : 'package-' + packageCount;            
            packages[0].code = name;
            items.push(Ext.create('Taco.view.order.subform.fulfillment.PackageTab', {
                record: this.record,
                packageRecord: packages[0]
            }));            
        }
        this.items = items;
    }
    
})

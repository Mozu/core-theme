/**
 * @class  Taco.view.discount.Edit
 */

Ext.define('Taco.view.settings.inventoryExportJob.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    //requires: [
    //    'Taco.view.settings.inventoryExportJob.subform.PaymentGateway'
    //],
    //formCls: 'Taco.view.settings.inventoryExportJob.subform.PaymentGateway',
    enableSearchBarInHeader: false,
    indexRoute: 'settings/inventoryExportJob',
    editorRoute: 'settings/inventoryExportJobedit',

    getIndexRoute: function () {
        return this.indexRoute;
    },

    getEditRoute: function () {
        return this.editorRoute;
    },

    initComponent: function () {
        var me = this;

        this.parentTitleCfg = {
            title: 'Inventory Export Job',
            controller: this.indexRoute
        };

        me.callParent(arguments);
    }

});
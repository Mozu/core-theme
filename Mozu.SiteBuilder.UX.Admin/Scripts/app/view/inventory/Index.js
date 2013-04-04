/**
 * @class Taco.view.inventory.Index
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.inventory.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.taco.index.inventory',
    requires: ['Taco.model.InventoryProduct'],

    typeName: 'Inventory Product',
    modelName: 'Taco.model.InventoryProduct',
    store: { type: 'Taco.store.InventoryProducts' },
    editorName: 'Taco.view.product.Edit',
    filterProperty: 'name',

    gridPanelConf: {
        columns: [{
            dataIndex: 'productName',
            text: 'Name',
            minWidth: 120,
            resizable: false,
            flex: 1,
            renderer: function(value) {
                return '<a href="#" class="taco-launch-editor">' + value + '</a>';
            }
        }]
    },

    initSaveTasks: function (chain) {
        chain.addSyncStoreTask({
            key: 'inventoryStore',
            depends: [],
            store: this.store
        });

        this.callParent(arguments);
    },

    isDirty: function () {
        return (this.store.getNewRecords().length > 0 ||
            this.store.getUpdatedRecords().length > 0 ||
            this.store.getRemovedRecords().length > 0);
    },

    // onCellClick: function (view, tdEl, cellIndex, record) {

    //     // *** Cell must have 'taco-stock' class and inventory tracking not turned off
    //     if ( Ext.fly(tdEl).hasCls(Taco.baseCSSPrefix + 'stock') && record.get('inventoryHandling') !== 0 ) {
    //         var form = Ext.create('Taco.view.inventory.QuantityEdit', {
    //             record: record
    //         }),

    //         modal = Ext.create('Taco.core.ux.modal.Mini', {
    //             autoShow: true,
    //             target: tdEl,
    //             offset: [0,-30],
    //             content: {
    //                 items: [form]
    //             },
    //             actions: {
    //                 items: [{
    //                     xtype: 'dirtybutton',
    //                     dirtyState: true,
    //                     text: 'OK',
    //                     click: function () {
    //                         form.update();
    //                         modal.hide();
    //                     },
    //                     scope: this
    //                 }, {
    //                     xtype: 'secondaryaction',
    //                     text: 'Cancel',
    //                     click: function () {
    //                         modal.hide();
    //                     },
    //                     scope: this
    //                 }]
    //             }
    //         });

    //         //modal.show();
    //     }
    // },

    onStoreStateChange: function (form) {
        var isDirty = this.isDirty(),
            dirtyButton = this.down('dirtybutton');

        dirtyButton.setDirty(isDirty);
    }    
});
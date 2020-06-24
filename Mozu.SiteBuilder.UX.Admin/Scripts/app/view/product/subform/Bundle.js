/**
 * @class Taco.view.product.subform.Bundle 
 *
 */

Ext.define('Taco.view.product.subform.Bundle', {
    extend: 'Taco.view.product.subform.Subform',
    requires: [
        'Taco.view.product.widget.ProductBundleGrid'
    ],
    itemId: 'bundleSubForm',
    title: Localizer.langResources.CATALOG.Products.ProductEdit.bundle_items,
    margin: '20 0',
    isGlobal: false,
    product: null,
    productInCatalogInfo: null,
    tools: [],
    initComponent: function () {
        var me = this,
            readOnly = this.isEdit() && !(this.isGlobal);

        if (!readOnly) {
            me.tools = [{
                xtype: 'button',
                ui: "action-primary",
                scale: "medium",
                margin: "0 0 0, 0",
                text: Localizer.langResources.SHARED.add,
                handler: function () {
                    this.productBundleGrid.addItem();
                },
                scope: me
            }];
        }

        this.defaults = {
            width: 200,
            product: this.product,
            productInCatalogInfo: this.productInCatalogInfo,
            labelAlign: 'top',
            labelSeparator: '',
            persistChangesToModel: true
        };

        this.record = this.product;

        this.productBundleGrid = Ext.create('Taco.view.product.widget.ProductBundleGrid', {
            product: me.product,
            bundleProductSource: me.isGlobal ? me.product: me.productInCatalogInfo,
            isReadOnly: !me.isGlobal,
            isGlobal: me.isGlobal
        });

        this.items = [
            this.productBundleGrid
        ];

        this.callParent(arguments);
        if (!this.isGlobal) {
            if (this.product.get('productUsage') === 'Bundle' && this.productInCatalogInfo.phantom) {
                this.syncBundleItemsForNewCatalog();
            }
            return;
        }

        // communicates to catalog tabs
        me.mon(me.productBundleGrid.store, 'add', me.onBundleItemAdded, me);
        me.mon(me.productBundleGrid.store, 'update', me.onBundleItemUpdated, me);
        me.mon(me.productBundleGrid.store, 'remove', me.onBundleItemRemoved, me);
    },

    retrieveBundleItemCatalogInfo: function (productCodes, records) {
        var me = this;
        this.setLoading(true);
        Ext.Ajax.request({
            url: '/admin/app/product/bundleitems',
            method: 'get',
            params: {
                productCodes: productCodes.join(",")
            },
            success: function (response) {
                var bundleItems = JSON.parse(response.responseText).items;
                if (!bundleItems || bundleItems.length === 0) return;
                Ext.Array.each(bundleItems, function (bundleItem) {
                    var matchedRecord = Ext.Array.findBy(records, function (record) {
                        return record.get('productCode') === bundleItem.productCode;
                    });
                    if (!matchedRecord) return;
                    matchedRecord.set('productInCatalogs', bundleItem.productInCatalogs);
                });
                Taco.app.fireEvent('bundle-items-added', records);
            },
            failure: function (resp) {
                var json = Ext.decode(resp.responseText, true),
                  msg = (json && json.message) ? json.message : Localizer.langResources.CATALOG.Products.ProductEdit.error_retrieving_catalog_pricing;
                Taco.app.fireEvent('setmessage', msg, 'error');
            },
            callback: function() {
                me.setLoading(false);
            }
        });
    },

    syncBundleItemsForNewCatalog: function () {
        var bundledProducts = this.product.get('bundledProducts');
        if (bundledProducts && bundledProducts.length > 0) {
            //get list of product codes and fire event.
            var productCodes = Ext.Array.pluck(bundledProducts, 'productCode');
            var records = Ext.Array.map(bundledProducts, function (item) {
                return Ext.create('Taco.model.BundledProduct', item);
            });
            this.retrieveBundleItemCatalogInfo(productCodes, records);
        }
    },

    onBundleItemAdded: function (store, records) {
        //get new items from API, then publish event
        var productCodes = Ext.Array.map(records, function (item) {
            return item.get('productCode');
        });
        this.retrieveBundleItemCatalogInfo(productCodes, records);
        this.onStoreDataChanged();
    },

    onBundleItemUpdated: function (store, masterCatBundleItem, operation, modifiedFieldNames) {
        if (operation !== 'edit' || !modifiedFieldNames) return;

        Taco.app.fireEvent('bundle-item-quantity-changed', masterCatBundleItem);
        this.onStoreDataChanged();
    },

    onBundleItemRemoved: function (store, masterCatBundleItem) {
        Taco.app.fireEvent('bundle-item-removed', masterCatBundleItem);
        this.onStoreDataChanged();
    },

    onStoreDataChanged: function () {
        var me = this,
            productForm = me.up("productform");
        
        // when the contents of the bundle store changes, we need to notify the other subForms of the changes so that they can react. Specifically, the shipping and price area will update;
        //todo change this to fire on the record instead of the productForm
        if (productForm) {
            productForm.fireEvent('bundleItemChange');
        }
    },

    // Called before the updateTask of Taco.core.ux.form.Form is executed; Return false to cancel the save; Can be used to manipulate the record data prior to saving;
    beforeSave: function () {
        /*
        var me = this;
        // need to serialize the store into jsons for persistance
        var store = this.productBundleGrid.store;
        var data = [];
        store.each(function(record) {
            data.push(Ext.clone(record.data));
        });
        
        this.product.set('bundledProducts', data);
        */
        return true;
    }
});
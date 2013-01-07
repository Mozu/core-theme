/**
 * @class Taco.view.phoneOrder.Index
 * @author Michael Speed Elder
 */
Ext.define('Taco.view.phoneOrder.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.core.ux.form.Form',
        'Taco.core.ux.BaseGrid',
        'Taco.core.ux.action.DirtyButton',
        'Taco.store.RuntimeProductSearch'
    ],

    initComponent: function () {
        var customerStore, productStore;

        this.header = {
            title: 'Phone Orders'
        };

        Ext.define("CustomerModel", {
            extend: 'Ext.data.Model',
            fields: [
                { name: 'first', type: 'string' },
                { name: 'last', type: 'string' }
            ]
        });

        customerStore = Ext.create("Ext.data.Store", {
            model: "CustomerModel",
            data: [{
                first: 'Michael',
                last: 'Elder'
            }, {
                first: 'Chris',
                last: 'Missal'
            }]
        });

        // *** TODO: Convert to Ext.form.Panel?
        // this.customerForm = Ext.create('Taco.core.ux.form.Form', {
        this.customerForm = Ext.create('Ext.form.Panel', {
            // stores: customerStore,
            defaultType: 'textfield',
            defaults: {
                allowBlank: false
            },
            items: [{
                fieldLabel: 'First',
                name: 'first'
            }, {
                fieldLabel: 'Last',
                name: 'last'
            }]
        });

//        this.customerForm.loadRecord( customerStore.getAt(0) );

        Ext.define("RuntimeProductModel", {
            extend: "Ext.data.Model",
            fields: [
                { name: 'name', type: 'string' },
                { name: 'description', type: 'string' },
                { name: 'qty', type: 'int' }
            ]
        });

        productStore = Ext.create("Ext.data.Store", {
            model: "RuntimeProductModel",
            data: [
                { name: 'Shirt', description: 'This is a shirt.', qty: 2 },
                { name: 'Shirt', description: 'This is a shirt.', qty: 2 },
                { name: 'Shirt', description: 'This is a shirt.', qty: 2 },
                { name: 'Shirt', description: 'This is a shirt.', qty: 2 },
                { name: 'Shirt', description: 'This is a shirt.', qty: 2 },
                { name: 'Shirt', description: 'This is a shirt.', qty: 2 }
            ]
        });

        productSearchStore = Ext.create("Taco.store.RuntimeProductSearch");

        productSearchStore.load({
            params: {
                q: "windshirt"
            }
        });

         window.p = productSearchStore;

        this.productGrid = Ext.create('Taco.core.ux.BaseGrid', {
            store: productStore,
            columns: [{
                text: 'Product name (SKU)',
                dataIndex: 'name'
            }, {
                text: 'Description',
                dataIndex: 'description'
            }, {
                text: 'Qty',
                dataIndex: 'qty'
            }, {
                text: 'Actions'
            }]
        });

        this.proceedToCheckout = Ext.create('Taco.core.ux.action.DirtyButton', {
            text: 'Dirtybit'
        });

        Ext.apply(this.body, {
            items: [
                this.customerForm,
                this.productGrid,
                this.proceedToCheckout
            ]
        });

        this.callParent( arguments );
    }

});
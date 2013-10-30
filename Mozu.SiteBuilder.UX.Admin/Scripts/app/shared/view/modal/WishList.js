/**
 * @class Taco.view.shared.modal.Address
 */
Ext.define('Taco.shared.view.modal.Wishlist', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.model.Contact',
        'Taco.shared.view.form.Address',
        'Ext.window.MessageBox'
    ],

    autoShow: true,

    width: 900,
    title: 'Wishlist',

    addressHasNames: true,
    showCompanyName: true,
    showEmail: true,
    showPhoneNumbers: true,

    validateAddress: true,

    formCfg: null,

    actions: [{
        xtype: 'button',
        itemId: 'primaryAction',
        text: 'Close',
        handler: function () {
            var me = this;
            me.close();
        },
        formBind: true
    }],

    initComponent: function () {
        var me = this;
        this.cls += ' ' + Taco.baseCSSPrefix + 'address-editor';

        if (!this.record || !this.record.isModel) {
            this.record = Ext.create('Taco.model.Contact', this.record);
        }

        Ext.create('Ext.data.Store', {
            storeId: 'creditStore',
            fields: ['code', 'name', 'price', 'saleprice', 'stock', 'dateadded', 'datepurchased'],
            data: {
                'items': [
                    { 'code': 'Cartoon', "name": "CatBug", "price": "5.00", "saleprice": "2.00", 'stock': '1', "dateadded": "11/1/2013", "datepurchased": "12/1/2013" }
                ]
            },
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'items'
                }
            }
        });

        me.wishlistGrid = Ext.create('Ext.grid.Panel', {
            store: Ext.data.StoreManager.lookup('creditStore'),
            columns: [
                { text: 'Product Code', dataIndex: 'code' },
                { text: 'Name', dataIndex: 'name' },
                { text: 'Price', dataIndex: 'price' },
                { text: 'Sale Price', dataIndex: 'saleprice' },
                { text: 'In Stock', dataIndex: 'stock' },
                { text: 'Date Added', dataIndex: 'dateadded' },
                { text: 'Date Purchased', dataIndex: 'datepurchased', flex: 1 }
            ]
        });

        this.items = [me.wishlistGrid];

        this.callParent(arguments);
    }
});

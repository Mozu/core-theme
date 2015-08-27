Ext.define('Taco.model.Wishlist', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id', type: 'string' },
        { name: 'customerAccountId', type: 'int' },
        { name: 'name', type: 'string' },
        { name: 'items', type: 'auto' },
        { name: 'privacytype', type: 'string' }
    ],

    getItems: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.WishlistItem',
            associationKey: 'items',
            foreignProperty: 'customerAccountId'
        });
    },


    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/wishlist/items'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            type:'json'
        }
    }
});

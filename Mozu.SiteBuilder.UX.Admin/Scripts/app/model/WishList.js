Ext.define('Taco.model.WishList', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'code',       type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'price', type: 'string' },
        { name: 'saleprice',     type: 'string' },
        { name: 'stock',    type: 'string' },
        { name: 'dateadded',     type: 'string' },
        { name: 'datepurchased',    type: 'string' }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
        	read: '/admin/Scripts/app/mocks/wishlist.json'
            //read: '/admin/app/account/users/list'
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
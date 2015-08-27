Ext.define('Taco.model.WishlistItem', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id',  type: 'string' },
        { name: 'purchasableStatusType', type: 'string' },
        { name: 'comments', type: 'string' },
        { name: 'DiscountTotal', type: 'float' },
        { name: 'DiscountedTotal', type: 'float' },
        { name: 'quantity',   type: 'int' },
        { name: 'product',    type: 'auto' },
        { name: 'auditInfo',  type: 'auto' }
    ]
});
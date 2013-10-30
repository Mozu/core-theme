Ext.define('Taco.controller.WishLists', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.shared.view.modal.Wishlist'],
    modelName: 'WishLists',
    models: ['Taco.model.WishList'],
    stores: ['Taco.store.WishList']
});

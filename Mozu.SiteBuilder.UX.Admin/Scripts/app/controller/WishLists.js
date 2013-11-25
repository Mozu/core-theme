/**
 * @class Taco.controller.wishLists
 */

Ext.define('Taco.controller.WishLists', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.shared.view.modal.Wishlist'],
    modelName: 'WishLists',
    models: ['Wishlist'],
    stores: ['Wishlists']
});

/**
 * @class Taco.view.storefrontProduct.modal.NoNavContextBox
 * Version of Context menu that won't cause any navigation
 * @extends Taco.core.ux.content.ContextMenu * 
 */
Ext.define("Taco.view.storefrontProduct.NoNavContextBox", {
    extend: 'Taco.core.ux.content.ContextMenu',
    requires: [],
    fieldLabel: 'Site',

    changeContext: Ext.emptyFn
});
/**
 * @class Taco.view.site.page.entityAdapters.ProductEntityAdapter
 */
Ext.define('Taco.view.site.page.entityAdapters.ProductEntityAdapter', {

	extend: 'Taco.view.site.page.entityAdapters.BaseEntityAdapter',
	modelName: 'Taco.model.Product',
	getStore: function() {
		return this.editor.products;
	},

	isHidden: function() {
		return !this.get().get('isActive');
	},
	setHidden: function(hide) {
		this.get().set('isActive', !hide);
	},

	getId: function() {
		return this.pageProps.pageContext.productCode;
	},

	doFormView: function() {
		Taco.core.StateManager.attemptNavigate('products/edit/' + this.get().getId());
	}
})
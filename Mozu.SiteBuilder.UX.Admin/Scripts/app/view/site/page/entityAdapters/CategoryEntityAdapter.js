/**
 * @class Taco.view.site.page.entityAdapters.CategoryEntityAdapter
 */
Ext.define('Taco.view.site.page.entityAdapters.CategoryEntityAdapter', {
	extend: 'Taco.view.site.page.entityAdapters.BaseEntityAdapter',
	modelName:'Taco.model.Category',
	getStore:function(){
		return this.editor.categories;
	},
	
	isHidden:function(){
	    return this.get().get('isHidden');
	},
	setHidden: function (hide) {
	    this.get().set('isHidden', hide);
	},
	
	getId: function() {
		return this.pageProps.pageContext.categoryId;
	}
	
});
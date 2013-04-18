/**
 * @class Taco.view.site.page.entityAdapters.DocumentEntityAdapter
 */
Ext.define('Taco.view.site.page.entityAdapters.DocumentEntityAdapter', {
	extend: 'Taco.view.site.page.entityAdapters.BaseEntityAdapter',
	modelName: 'Taco.model.CmsDocument',
	getStore:function(){
		return this.editor.cmsDocs;
	},
	

	getId: function() {
		return this.pageProps.pageContext.collectionId + "_" + this.pageProps.pageContext.documentId;
	},

	getPageSettings: function () {
	    return Ext.JSON.decode(this.model.get('settings'));
	},

	setPageSettings: function (newSettings) {
	    this.model.set('settings', Ext.JSON.encode(newSettings));
	},

	settingsPanels: ['Taco.view.site.page.settings.General', 'Taco.view.site.page.settings.Templates', 'Taco.view.site.page.settings.Seo']
});
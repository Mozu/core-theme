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
    },


   

    getPageSettings: function () {
        var me = this;
        return [
            {
                panelCls: 'Taco.view.site.page.settings.General',
                getRecord: function() {
                    return me.get();
                }
            },
            {
                panelCls: 'Taco.view.site.page.settings.Templates',
                getRecord: function() {
                    return me.get();
                }
            }, {
                panelCls:  'Taco.view.site.page.settings.Seo',
                getRecord: function() {
                    return me.get();
                }
            }, {
                panelCls: 'Taco.view.site.page.settings.Facets',
                getRecord: function() {
                    return me.get();
                }
            }];
    }
	

//settingsPanels:[]
});
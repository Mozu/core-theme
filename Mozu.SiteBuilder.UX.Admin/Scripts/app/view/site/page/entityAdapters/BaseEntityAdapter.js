/**
 * @class Taco.view.site.page.entityAdapters.BaseEntityAdapter
 */
Ext.define('Taco.view.site.page.entityAdapters.BaseEntityAdapter', {
    extend: 'Ext.util.Observable',
    requires: ['Taco.view.site.page.settings.General', 'Taco.view.site.page.settings.Templates', 'Taco.view.site.page.settings.Seo', 'Taco.view.site.page.settings.Facets'],
	allowedActions:{add:true,copy:true,settings:true,preview:true,destroy:true},
	load: function() {
		var me = this,
			key=this.getId(),
			modelFactory=Ext.ModelManager.getModel(this.modelName),
			store=this.getStore();
		
		me.model = store.getById(key);
		if (me.model === null) {
			me.isLoading= true;
			modelFactory.load(key, {
                    success: function (record) {
                    	me.set(record, true);
                    }
             });
		}else{
			this.set(this.model);
		}

	},
	set:function(model, add){
		this.isLoading= false;
		this.model = model;
		if ( add ){
			this.getStore().add(this.model);
		}

	    // TODO Z make sure this acrees with the features/options for each page type in http://vconfluence.ads.volusion.com/display/Product/Pages+-+V1
		var actions = Ext.applyIf( Ext.apply ( {}, this.allowedActions)  , { add: true, settings: this.editors, hide: this.setHidden != Ext.emptyFn, formView: !!this.doFormView });
		this.editor.toolBar.enableButtons(actions);
		this.editor.toolBar.getButton('hide').toggle(this.isHidden(), true);
		this.fireEvent('load', model);
	},
	isHidden: function () { return false; },
	setHidden:Ext.emptyFn,
	deleteRecord:function(){
		var me=this,
		model = this.get();
		if ( me.fireEvent('destroy', model)!= false )
		{
			if ( model ){
				model.destroy({
					callback:function(){
						me.fireEvent('destroy', model);
					}
					});
			}
		}
	},
	get:function(){
		return this.model;
	},
	getStore:function(){

	},
	

	
	getId: function() {

	}

});
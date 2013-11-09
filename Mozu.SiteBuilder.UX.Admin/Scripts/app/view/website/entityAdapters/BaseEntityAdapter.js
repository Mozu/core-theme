/**
 * @class Taco.view.website.entityAdapters.BaseEntityAdapter
 */
 Ext.define('Taco.view.website.entityAdapters.BaseEntityAdapter', {
     extend: 'Ext.util.Observable',
     requires: [],

 	allowedActions:{copy:false,preview:false,destroy:false,more: false},
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
     isDirty:function() {
         return false;
     },
     addSaveTasks: Ext.emptyFn,
 	unload: Ext.emptyFn,
 	set:function(model, add){
 		this.isLoading= false;
 		this.model = model;
 		if ( add ){
 			this.getStore().add(this.model);
 		}
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
/**
* @class Taco.controller.Websites
* The Websites controller
*/

Ext.define('Taco.controller.Website', {
    extend: 'Taco.core.Controller',
    views: ['website.Index'],
    
    // modelName: 'Website'
    


    /************************************
    *  
    * PUBLIC METHODS ON THE sitebuilderEditor
    * accesed by : Taco.app.controllers.get('sitebuilder')
    *
    *************************************/
    //returns a  store of widgetTypeDefinition
    findWidgetTypeDefinitions: function (filter) {
        return Taco.core.data.StoreManager.getOrCreate("Taco.store.WidgetDefinitions");

    }
});

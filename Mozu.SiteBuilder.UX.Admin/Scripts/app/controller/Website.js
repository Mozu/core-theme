/**
* @class Taco.controller.Websites
* The Websites controller
*/

Ext.define('Taco.controller.Website', {
    extend: 'Taco.core.Controller',
    views: ['website.Index'],
    editorView :'website.Index',
    // modelName: 'Website'
    

    page: function () {
        var url = '';
        Ext.Array.each(arguments, function (item) {
            if (Ext.isString(item)) {
                if (url.length) {
                    url += "/";
                }
                url += item;
            }
        });
        
        this.ensureRequiredStores(function () {
            this.buildIndex(null, { startUrl: url } );
        });
    },

    /************************************
    *  
    * PUBLIC METHODS ON THE sitebuilderEditor
    * accesed by : Taco.app.controllers.get('sitebuilder')
    *
    *************************************/
    //returns a  store of widgetTypeDefinition
    findWidgetTypeDefinitions: function (filter, callback) {

        var store = Taco.core.data.StoreManager.getOrCreate("Taco.store.WidgetDefinitions"),
            cb = function () {
                var json = [],
                    convertedData = [];
                
                store.each(function (item) {
                    json.push(item.data);
                });
                
                json.forEach(function (widget) {
                    console.log(widget);
                    convertedData.push({
                        name: widget.displayName,
                        isRichText: widget.id == 'content',
                        icon: widget.icon,
                        id: widget.id
                    });
                });
                callback(convertedData);
            };


        if (store.hasCompletedLoading()) {
            cb();
        }
        else {
            store.on('load', cb, {single :true});
        }
        
    }
});

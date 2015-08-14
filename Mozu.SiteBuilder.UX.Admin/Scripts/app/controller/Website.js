/**
 * @class Taco.controller.Websites
 * The Websites controller
 */

Ext.define('Taco.controller.Website', {
    extend: 'Taco.core.Controller',
    views: ['website.Index'],
    editorView: 'website.Index',
    // modelName: 'Website'
    requires: ['Taco.store.WidgetDefinitions'],

    page: function () {
        var url = '';
        Ext.Array.each(arguments, function (item) {
            if (Ext.isString(item)) {
                if (url.length) {
                    url += '/';
                }
                url += item;
            }
        });

        this.ensureRequiredStores(function () {
            this.buildIndex(null, {
                startUrl: url
            });
        });
    },
    /************************************
     *
     * PUBLIC METHODS ON THE sitebuilderEditor
     * accesed by : Taco.app.controllers.get('sitebuilder')
     *
     *************************************/
    //returns an array of cms text styles
    getCmsTextStyles: function (win, callback) {
        var defaultStyles = [
            {
                label: 'Heading 1',
                tagName: 'h1'
            }
        ];

        win.require(['hyprlivecontext'], function (hyperContext) {
            callback(hyperContext.locals.themeSettings.cmsTextStyles || defaultStyles);
        });
    },

    /************************************
     *
     * PUBLIC METHODS ON THE sitebuilderEditor
     * accesed by : Taco.app.controllers.get('sitebuilder')
     *
     *************************************/
    //returns a  store of widgetTypeDefinition
    findWidgetTypeDefinitions: function (win, callback) {


        var themeId=win.require.mozuData('pagecontext').themeId;


        var store = Taco.core.data.StoreManager.getOrCreate({
            id:'Taco.store.WidgetDefinitions'+ themeId,
            type:'Taco.store.WidgetDefinitions',
            themeId:themeId
        }),
            cb = function () {
                var json = [],
                    convertedData = [],
                    pageContext = win.require.mozuData('pagecontext');

                store.each(function (item) {
                    var validPageTypes = item.get('validPageTypes');
                    if (Ext.isEmpty(validPageTypes) || Ext.Array.contains(validPageTypes, '*') || Ext.Array.contains(validPageTypes, pageContext.pageType)) {
                        json.push(item.data);
                    }
                });

                json.forEach(function (widget) {

                    convertedData.push({
                        name: widget.displayName,
                        isRichText: widget.id === 'content',
                        icon: widget.icon,
                        id: widget.id
                    });
                });
                callback(convertedData);
            };


        if (store.hasCompletedLoading()) {
            cb();
        } else {
            store.on('load', cb, {
                single: true
            });
        }
    }
});
/**
 * @class Taco.controller.Themes
 * The Themes controller.
 */
Ext.define('Taco.controller.Themes', {
    extend: 'Taco.core.Controller',
    modelName: 'Taco.model.ThemeListing',
    requires: ['Taco.view.theme.Index'],
    views: ['theme.Index'],
    contextPlaceholders: {
        tc: function () {
            return Ext.create('Taco.core.ux.content.Container', {
                header: {
                    title: "choose a site"
                },

                body: {
                    layout: 'auto',
                    items: [{
                        html: 'placeholder for choose site  interstitial '
                    }]
                }
            });
        }
    }
   
});

/**
 * @class Taco.view.website.settings.General
 */

Ext.define('Taco.view.website.settings.DocumentSeo', {
    extend: 'Taco.view.website.settings.CmsBaseForm',
    requires: [
        'Taco.core.ux.form.OnOffSliderButton',
    'Taco.core.ux.form.SlugField'
    ],

    title: 'SEO',
  
    
    initComponent: function () {
        this.items = [{
            xtype: 'taco-slugfield',
            name: 'name',
            fieldLabel: 'Page Name'
            
        }];

        this.callParent(arguments);
    }
   
   
});

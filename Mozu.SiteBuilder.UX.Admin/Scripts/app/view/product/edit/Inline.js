/**
 * @class Taco.view.product.edit.Inline
 */
Ext.define('Taco.view.product.edit.Inline', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.core.ux.form.SlugField'],

    defaults: {
        xtype: 'textfield',
        labelAlign: 'top',
        labelSeparator: '',
        width: 544
    },
    items: [{
        xtype: 'slugfield',
        name: 'seoFriendlyUrl',
        fieldLabel: 'SEO Friendly URL',
        slugPrefix: 'www.mystore.com/category/'
    }, {
        name: 'pageTitle',
        fieldLabel: 'Page Title'
    }, {
        name: 'metaTagTitle',
        fieldLabel: 'Meta Title'
    }, {
        name: 'metaTagDescription',
        fieldLabel: 'Meta Description'
    }, {
        name: 'metaTagKeywords',
        fieldLabel: 'Keywords'
    }]
});
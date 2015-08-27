/**
 * @class Taco.view.website.settings.CatalogSeo
 */
Ext.define('Taco.view.website.settings.CatalogSeo', {
    extend: 'Taco.core.ux.form.Form',

    title: 'SEO',
    ui: 'subform',

    layout: {
        type: 'vbox'
    },

    initComponent: function () {
        this.items = [{
            xtype: 'taco-slugfield',
                name: 'slug',
                fieldLabel: 'Slug',
                width: '95%'
            }, {
                xtype: 'textfield',
                name: 'metaTitle',
                fieldLabel: 'Meta Title',
                width: '95%'
            }, {
                xtype: 'textarea',
                name: 'metaDescription',
                fieldLabel: 'Meta Description',
                width: '95%'
            },
            {
                xtype: 'textarea',
                name: 'metaKeywords',
                fieldLabel: 'Meta Keywords',
                width: '95%'                
            }];

        this.callParent(arguments);
    },
    persistFormValues: function () {
        var values = this.getValues(false, false, false, true);
        
        Ext.Object.each(values, function(key, value, myself) {
            if (!values[key] && !this.record.get(key)) {
                delete values[key];
            }
        }, this);

        if (!Ext.isEmpty(values)) {
            values.isSEOContentOverridden = true;
        }
        this.record.beginEdit();
        this.record.set(values);
        this.record.endEdit();

    }
});
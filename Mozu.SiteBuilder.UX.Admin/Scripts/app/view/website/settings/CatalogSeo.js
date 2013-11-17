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
                xtype: 'textfield',
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
        var values = this.getValues();
        
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




//{
//    xtype: 'panel',
//    title: 'Advanced',
//    collapsible: true,
//    layout: 'vbox',
//    width: '95%',
//    items: [{
//        xtype: 'textfield',
//        name: 'customMetaTags',
//        fieldLabel: 'Custom Meta Tags',
//        width: '100%'
//    }, {
//        xtype: 'label',
//        text: 'Meta Robots'
//    }, {
//        xtype: 'box',
//        autoEl: 'hr'
//    }, {
//        xtype: 'radiogroup',
//        width: '100%',
//        columns: 2,
//        items: [{
//            name: 'metaRobotsIndex',
//            boxLabel: 'Index',
//            inputValue: 'true',
//            checked: true
//        }, {
//            name: 'metaRobotsIndex',
//            boxLabel: 'No Index',
//            inputValue: 'false'
//        }]
//    }, {
//        xtype: 'box',
//        autoEl: 'hr'
//    }, {
//        xtype: 'radiogroup',
//        width: '100%',
//        columns: 2,
//        items: [{
//            name: 'metaRobotsFollow',
//            boxLabel: 'Follows',
//            inputValue: 'true',
//            checked: true
//        }, {
//            name: 'metaRobotsFollow',
//            boxLabel: 'No Follow',
//            inputValue: 'false'
//        }]
//    }, {
//        xtype: 'box',
//        autoEl: 'hr'
//    }, {
//        xtype: 'checkboxgroup',
//        width: '100%',
//        columns: 2,
//        items: [{
//            name: 'metaNoODP',
//            boxLabel: 'No ODP'
//        }, {
//            name: 'metaNoArchive',
//            boxLabel: 'No Archive'
//        }, {
//            name: 'metaNoYDIR',
//            boxLabel: 'No YDIR'
//        }, {
//            name: 'metaNoSnippet',
//            boxLabel: 'No Snippet'
//        }]
//    }, {
//        xtype: 'textfield',
//        name: 'canonicalURL',
//        fieldLabel: 'Canonical URL',
//        width: '100%'
//    }]
//}
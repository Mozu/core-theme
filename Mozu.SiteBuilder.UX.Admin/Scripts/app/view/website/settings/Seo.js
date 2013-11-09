/**
 * @class Taco.view.website.settings.Seo
 */
Ext.define('Taco.view.website.settings.Seo', {
    extend: 'Taco.core.ux.form.Form',

    title: 'SEO',
    ui: 'subform',

    layout: {
        type: 'vbox'
    },

    initComponent: function () {
        this.items = [{
            xtype: 'textfield',
            name: 'seoFriendlyUrl',
            fieldLabel: 'SEO Friendly URL',
            width: '95%'
        }, {
            xtype: 'textfield',
            name: 'seoTitle',
            fieldLabel: 'Title',
            width: '95%'
        }, {
            xtype: 'textarea',
            name: 'metaDescription',
            fieldLabel: 'Meta Description',
            width: '95%'
        }, {
            xtype: 'panel',
            title: 'Advanced',
            collapsible: true,
            layout: 'vbox',
            width: '95%',
            items: [{
                xtype: 'textfield',
                name: 'customMetaTags',
                fieldLabel: 'Custom Meta Tags',
                width: '100%'
            }, {
                xtype: 'label',
                text: 'Meta Robots'
            }, {
                xtype: 'box',
                autoEl: 'hr'
            }, {
                xtype: 'radiogroup',
                width: '100%',
                columns: 2,
                items: [{
                    name: 'metaRobotsIndex',
                    boxLabel: 'Index',
                    inputValue: 'true',
                    checked: true
                }, {
                    name: 'metaRobotsIndex',
                    boxLabel: 'No Index',
                    inputValue: 'false'
                }]
            }, {
                xtype: 'box',
                autoEl: 'hr'
            }, {
                xtype: 'radiogroup',
                width: '100%',
                columns: 2,
                items: [{
                    name: 'metaRobotsFollow',
                    boxLabel: 'Follows',
                    inputValue: 'true',
                    checked: true
                }, {
                    name: 'metaRobotsFollow',
                    boxLabel: 'No Follow',
                    inputValue: 'false'
                }]
            }, {
                xtype: 'box',
                autoEl: 'hr'
            }, {
                xtype: 'checkboxgroup',
                width: '100%',
                columns: 2,
                items: [{
                    name: 'metaNoODP',
                    boxLabel: 'No ODP'
                }, {
                    name: 'metaNoArchive',
                    boxLabel: 'No Archive'
                }, {
                    name: 'metaNoYDIR',
                    boxLabel: 'No YDIR'
                }, {
                    name: 'metaNoSnippet',
                    boxLabel: 'No Snippet'
                }]
            }, {
                xtype: 'textfield',
                name: 'canonicalURL',
                fieldLabel: 'Canonical URL',
                width: '100%'
            }]
        }];

        this.callParent(arguments);
    }
});

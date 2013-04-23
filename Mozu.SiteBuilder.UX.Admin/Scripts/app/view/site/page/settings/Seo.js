/**
 * @class Taco.view.site.page.settings.Seo
 */
Ext.define('Taco.view.site.page.settings.Seo', {
    extend: 'Taco.view.site.page.PageSettingsPanel',
    title: 'SEO',
    form: {
        layout: 'vbox',
        items: [
            {
                xtype: 'textfield',
                fieldLabel: 'SEO Friendly URL',
                name: 'seoFriendlyUrl'
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Title',
                name: 'seoTitle'
            },
            {
                xtype: 'textarea',
                fieldLabel: 'Meta Description',
                name: 'metaDescription'
            },
            {
                xtype: 'box',
                autoEl: 'hr'
            },
            {
                xtype: "panel",
                title: "Advanced",
                collapsible: true,
                layout: 'vbox',
                items: [
                    {
                        xtype: 'textfield',
                        title: 'Custom Meta Tags',
                        name: 'customMetaTags'
                    },
                    {
                        html: "<h4>Meta Robots</h4>"
                    },
                    {
                        xtype: 'box',
                        autoEl: 'hr',
                    },
                    {
                        xtype: 'radiogroup',
                        columns: 2,
                        items: [
                            {
                                boxLabel: 'Index',
                                name: 'metaRobotsIndex',
                                inputValue: 'true',
                                checked: true
                            },
                            {
                                boxLabel: 'No Index',
                                name: 'metaRobotsIndex',
                                inputValue: 'false'
                            }
                        ]
                    },
                    {
                        xtype: 'box',
                        autoEl: 'hr',
                    },
                    {
                        xtype: 'radiogroup',
                        columns: 2,
                        items: [
                            {
                                boxLabel: 'Follows',
                                name: 'metaRobotsFollow',
                                inputValue: 'true',
                                checked: true
                            },
                            {
                                boxLabel: 'No Follow',
                                name: 'metaRobotsFollow',
                                inputValue: 'false'
                            }
                        ]
                    },
                    {
                        xtype: 'box',
                        autoEl: 'hr',
                    },
                    {
                        xtype: 'checkboxgroup',
                        columns: 2,
                        items: [
                            {
                                boxLabel: 'No ODP',
                                name: 'metaNoODP'
                            },
                            {
                                boxLabel: 'No Archive',
                                name: 'metaNoArchive'
                            },
                            {
                                boxLabel: 'No YDIR',
                                name: 'metaNoYDIR'
                            },
                            {
                                boxLabel: 'No Snippet',
                                name: 'metaNoSnippet'
                            }
                        ]
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Canonical URL',
                        name: 'canonicalURL'
                    }
                ]
            }
        ]
    }
});
/**
 * @class Taco.view.site.page.settings.Seo
 */
Ext.define('Taco.view.site.page.settings.Seo', {
    extend: 'Taco.view.site.page.PageSettingsPanel',
    title: 'SEO',
    cls: 'taco-sidebar-model-seo',
    form: {
        layout: 'vbox',
        items: [
            {
                xtype: 'label',
                text: 'SEO Friendly URL'
            },
            {
                xtype: 'label',
                cls: 'taco-sublabel-text',
                text: 'http://wwww.mymozu.com/'
            },
            {
                xtype: 'textfield',
                width: '95%',
                name: 'seoFriendlyUrl'
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Title',
                width: '95%',
                name: 'seoTitle'
            },
            {
                xtype: 'textarea',
                fieldLabel: 'Meta Description',
                width: '95%',
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
                width: '95%',
                cls: 'taco-sidebar-submenu',
                items: [
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Custom Meta Tags',
                        width: '100%',
                        name: 'customMetaTags'
                    },
                    {
                        xtype: 'label',
                        text: 'Meta Robots'
                    },
                    {
                        xtype: 'box',
                        autoEl: 'hr',
                    },
                    {
                        xtype: 'radiogroup',
                        width: '100%',
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
                        width: '100%',
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
                        width: '100%',
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
                        width: '100%',
                        name: 'canonicalURL'
                    }
                ]
            }
        ]
    }
});
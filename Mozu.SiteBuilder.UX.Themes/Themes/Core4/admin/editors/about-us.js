Ext.create('Taco.core.ux.form.entities.WebPageEditorForm', {
    title: 'About us',
    items: [
        {
            fieldLabel: 'banner',
            xtype: 'taco-singleimagefield',
            name: 'bannerImage'
        },
        {
            fieldLabel: 'blurb',
            xtype: 'taco-htmleditor',
            name: 'blurb'
        }
    ]
});
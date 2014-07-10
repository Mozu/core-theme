Ext.create('Taco.core.ux.form.EntityEditorForm', {
    title: 'A Simple core4 page to show jon',
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
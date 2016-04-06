Ext.widget({
    xtype:'mz-form-webpage',
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
            name: 'blurb',
            enableFont: false
        }
    ]
});
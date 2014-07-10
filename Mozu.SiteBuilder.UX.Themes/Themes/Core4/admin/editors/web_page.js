Ext.create('Taco.core.ux.form.EntityEditorForm', {
    title: 'A Simple core4 page to show jon',
    items: [
        {
            fieldLabel: 'title',
            name: 'title',
            allowBlank: false
        }, {
            fieldLabel: 'meta_title',
            name: 'meta_title',
            allowBlank: false
        }, {
            fieldLabel: 'link_title',
            name: 'link_title',
            allowBlank: true
        }, {
            fieldLabel: 'template',
            name: 'template',
            allowBlank: true
        }
    ]
});
Ext.create('Taco.core.ux.form.WebPageEditorForm', {
    title: 'Blog Post',
    items: [
        {
            fieldLabel: 'banner',
            xtype: 'taco-singleimagefield',
            name: 'bannerImage'
        },
        {
            fieldLabel: 'title',
            xtype: 'textfield',
            name: 'title'
        },
         {
             fieldLabel: 'body',
             xtype: 'taco-htmleditor',
             name: 'body'
         },
          {
              xtype: 'boxselect',
              fieldLabel: 'tags',
              name: 'tags',
              delimiter: ',',
              store: [],
              "queryMode": 'local',
              "forceSelection": false,
              "createNewOnEnter": true,
              "createNewOnBlur": true,

          },
    ]
});
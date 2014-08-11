Ext.widget({
    xtype: 'mz-form-webpage',
    title: 'PoKEmon!!!!!!!',
    items: [
        
       
          {
              "fieldLabel": "image",
              "xtype": "mz-input-image",
              "name": "image"
          },
        {
            "fieldLabel": "category",
            "xtype": "mz-input-dropdown",
            "name": "category",
            "store": [
                "Avianoid",
                "Blazing",
                "Cactus",
                "Hoodlum",
                "Intimidation",
                "Rock Inn",
                "Shedding",
                "Stone Home",
                "Zen Charm"
            ]
        },
        {
            "fieldLabel": "Type",
            "xtype": "boxselect",
            "name": "types",
            "store": [
                "Bug",
                "Dark",
                "Fighting",
                "Fire",
                "Flying",
                "Grass",
                "Rock"
            ]
        },
        {
            "fieldLabel": "Description",
            "xtype": "taco-htmleditor",
            "name": "description"
        }
    ]
});
Ext.create('Taco.core.ux.form.entities.WebPageEditorForm', {
    title: 'PoKEmon!!!!!!!',
    items: [
        
        {
            "fieldLabel": "imageUrl",
            "name": "imageUrl"
        },
        {
            "fieldLabel": "category",
            "xtype": "selectfield",
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
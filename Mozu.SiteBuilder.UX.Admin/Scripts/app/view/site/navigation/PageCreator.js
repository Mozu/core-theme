Ext.define('Taco.view.site.navigation.PageCreator', {
    extend: 'Taco.view.site.ToolboxPanel',
    html: 'hey mom',
    title: 'foods',
    showInNav: false,
    layout: { type: 'vbox', align: 'top' },
    initComponent: function () {

      
        this.items = [
              {
                 name: 'title',
                 xtype: 'textfield',
                 fieldLabel: 'Page Name',
                 regex: /^[^&^/\^//^#^+%]+$/,
                 labelAlign: 'top',
                 width: 300,
                 emptyText: "Name your page..."
             }, {
                name: 'docInfo',
                xtype: 'selectfield',
                labelAlign: 'top',
              
                fieldLabel: 'Choose type',
                mode: 'local',
                valueField: 'id',
                displayField: 'displayName',
                width: 300,
                emptyText: 'Select',
                store: Ext.create('Ext.data.Store', {
                    model: 'Taco.model.PageTypeDefinition',
                    autoLoad: true,
                    filters: [
                        function(item) {

                            return item.get('userCreatable') === true;
                        }
                    ]
                })
            }];
      

        this.callParent(arguments);
    }
});
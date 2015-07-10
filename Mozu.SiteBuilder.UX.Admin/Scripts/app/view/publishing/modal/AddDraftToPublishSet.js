Ext.define('Taco.view.publishing.modal.AddDraftToPublishSet', {
    extend: 'Taco.core.ux.window.Drawer',
    requires: [
        'Taco.view.publishing.grid.Publish'
    ],
    scale: 'medium',
    title: 'Add Draft to Publish Set',
    modal: true,
    closeAction: 'destroy',
    height: 400,
    secondaryText: 'Ok',
    layout: { 
        type: 'fit' 
    },
    actions: [
        {
            itemId: 'secondaryAction'
        }
    ],
    initComponent: function() {

        this.picker = this.getPublishGridPickerConfig();

        this.items = [{
            xtype: 'panel',
            layout: { 
                type: 'fit' 
            },
            items: [this.picker]
        }];

        this.callParent(arguments);
    },
    getPublishGridPickerConfig: function() {
        return Ext.create('Taco.view.publishing.grid.Publish', {
            storeConfig: {
                title: 'Publish Sets',
                name: 'Taco.store.PublishSets',
                options:  {
                    includeCounts: true
                }
            },
            isPicker: true,
            advancedFormCls: 'Taco.view.publishing.advancedSearchForm.Publish'
        });
    }   
});
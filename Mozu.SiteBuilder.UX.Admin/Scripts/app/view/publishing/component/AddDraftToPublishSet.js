Ext.define('Taco.view.publishing.component.AddDraftToPublishSet', {   
    extend: 'Ext.button.Button',
    requires: [
        'Taco.view.publishing.modal.AddDraftToPublishSet'
    ],
    ui: 'action-primary',
    scale: 'medium',
    itemId: 'addDraftToPublishSet',
    text: 'Add Draft To Publish Set',
    margin: '0 0 0 10',
    handler: function () {
        var modal = Ext.create('Taco.view.publishing.modal.AddDraftToPublishSet', {
            calback: this.callback
        });
        modal.show();
    },
    initComponent: function () {
        this.callParent(arguments);
    }
});

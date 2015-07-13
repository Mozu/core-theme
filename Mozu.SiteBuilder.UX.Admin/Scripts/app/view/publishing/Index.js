/**
 * @class  Taco.view.publishing.Edit
 */

Ext.define('Taco.view.publishing.Index', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.publishing.Form',
        'Taco.view.publishing.grid.GridWrapper',
        'Taco.core.ux.grid.plugins.AutoSelect'
    ],
    typeName: 'Publish Set',
    formCls: 'Taco.core.ux.form.Form',
    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },    
    editorName: 'Taco.view.publishing.Edit',
    autoTitle: true,
    autoScroll: true,
    title: 'Pending Changes',
    cancelButtonVisible: false,
    saveText: 'Create New Publish Set',
    initComponent: function () {

        this.items = [
            Ext.create('Taco.view.publishing.component.AddDraftToPublishSet'), // just for testing component
            this.eastGrid(),
            this.eastTwoGrid(),
            this.westGrid()
        ];

        this.callParent(arguments);
    },
    eastGrid: function() {
        return Ext.create('Taco.view.publishing.grid.GridWrapper', {
            title: 'Drafts',
            gridClass: 'getDraftGridConfig'
        });
    },
    eastTwoGrid: function() {
        return Ext.create('Taco.view.publishing.grid.GridWrapper', {
            title: 'Publish Sets',
            gridClass: 'getPublishGridConfig'
        });
    },
    westGrid: function() {
        return Ext.create('Taco.view.publishing.grid.GridWrapper', {
            title: 'Contents',
            gridClass: 'getDraftGridConfig'
        });
    },
    onSave: function() {
        var modal = Ext.create('Taco.view.publishing.modal.CreatePublishSet');
        modal.show();
    }
});
Ext.define('Taco.view.site.page.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.site.page.Form'
    ],

    requiresContextOfType: 's',

    cls: Taco.baseCSSPrefix + 'content-inline-editor',

    bodyLayout: 'auto',
    formCls: 'Taco.view.site.page.Form',

    initComponent: function() {
        this.toolBox = Ext.create('Taco.view.site.Toolbox');
        this.toolBar = Ext.create('Taco.view.site.Toolbar');

        this.formCfg = {
            pageSrc: this.pageSrc,
            toolBox: this.toolBox
        };
        
        this.sidebar = {
            items: [this.toolBox]
        };

        this.actions = [
            this.toolBar,
            {
                xtype: 'secondarybutton',
                text: 'Cancel',
                eventName: 'cancel'
            }, {
                xtype: 'dirtybutton',
                text: 'Save',
                eventName: 'save'
            }];

        
        this.callParent(arguments);

        this.toolBar.editor = this.form;
    }
});
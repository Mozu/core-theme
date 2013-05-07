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
            toolBox: this.toolBox,
            toolBar: this.toolBar
        };
        
        this.sidebar = {
            items: [this.toolBox]
        };

        this.actions = [
            this.toolBar,
            {
                xtype: 'secondarybutton',
                text: 'Cancel',
                click: this.cancel,
                scope: this
            }, {
                xtype: 'dirtybutton',
                text: 'Save',
                click: this.save,
                scope:this
            }];

        
        this.callParent(arguments);
        this.on('boxready', function () {
            this.toolBar.editor = this.form;
        }, this);
    }
});
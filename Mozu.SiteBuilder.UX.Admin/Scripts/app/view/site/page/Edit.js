Ext.define('Taco.view.site.page.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.site.page.Form'
    ],

    cls: Taco.baseCSSPrefix + 'content-inline-editor',

    bodyLayout: 'auto',
    formCls: 'Taco.view.site.page.Form',

    initComponent: function() {
        this.toolBox = Ext.create('Taco.view.site.Toolbox');

        this.formCfg = {
            pageSrc: this.pageSrc,
            toolBox: this.toolBox
        };
        
        this.sidebar = {
            items: [this.toolBox]
        };
        
        this.callParent(arguments);
    }
});
Ext.define('Taco.view.report.Index', {
    //extend: 'Taco.core.ux.content.Container',
    extend: 'Ext.panel.Panel',
    initComponent: function () {
        var me = this;

        this.items = [
            {
                html: "comming soon",
                padding:'30 30 30 30 '
            }
        ];

        me.callParent(arguments);
    }
})

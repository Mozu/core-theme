Ext.define('Taco.overrides.panel.Header', {
    override: 'Ext.panel.Header',

    onRender: function () {
        this.callParent(arguments);

        this.move(this.titleCmp, this.titlePosition);
    }
});

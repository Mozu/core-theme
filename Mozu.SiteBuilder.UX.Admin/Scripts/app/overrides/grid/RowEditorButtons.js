Ext.define('Taco.overrides.grid.RowEditorButtons', {
    override: 'Ext.grid.RowEditorButtons',

    constructor: function (config) {
        var me = this,
            rowEditor = config.rowEditor,
            cssPrefix = Ext.baseCSSPrefix,
            plugin = rowEditor.editingPlugin;

        config = Ext.apply({
            baseCls: cssPrefix + 'grid-row-editor-buttons',
            defaults: {
                xtype: 'button',
                scale: 'medium',
                scope: plugin,
                flex: 1,
                minWidth: Ext.panel.Panel.prototype.minButtonWidth
            },
            items: [{
                ui: 'action-primary',
                cls: cssPrefix + 'row-editor-update-button',
                itemId: 'update',
                handler: plugin.completeEdit,
                text: rowEditor.saveBtnText,
                disabled: rowEditor.updateButtonDisabled
            }, {
                ui: 'action',
                cls: cssPrefix + 'row-editor-cancel-button',
                handler: plugin.cancelEdit,
                text: rowEditor.cancelBtnText
            }]
        }, config);

        me.callSuper([config]);

        me.addClsWithUI(me.position);
    },

    onRender: function () {
        this.callParent(arguments);

        this.setMargin('5 0 -5 0');
    },

    setButtonPosition: function (position) {
        this.callParent(arguments);

        if (position === 'top') {}
    }
});

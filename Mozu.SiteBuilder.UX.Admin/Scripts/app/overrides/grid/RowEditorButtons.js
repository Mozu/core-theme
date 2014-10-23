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
                listeners: {
                    'keydown': {
                        element: "el",
                        fn: function (e) {
                            var k = e.getKey(),
                            btn;
                            // SPACE and ENTER trigger a click
                            if (k === e.SPACE || k === e.ENTER) {
                                // need to prevent the button keypress event from bubbling since the row editor is also listening for the enter key and will persist the record even though you are hitting enter on the cancel key;
                                e.stopPropagation();

                                // get the button component and trigger the click event
                                btn = Ext.getCmp(this.id);
                                if (btn && btn.onClick) {
                                    btn.onClick(e);
                                }
                            }
                        }
                    }
                },
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
                listeners: {
                    'keydown': {
                        element: "el",
                        fn: function (e) {
                            var k = e.getKey(),
                            btn;
                            // SPACE and ENTER trigger a click
                            if (k === e.SPACE || k === e.ENTER) {
                                // need to prevent the button keypress event from bubbling since the row editor is also listening for the enter key and will persist the record even though you are hitting enter on the cancel key;
                                e.stopPropagation();

                                // get the button component and trigger the click event
                                btn = Ext.getCmp(this.id);
                                if (btn && btn.onClick) {
                                    btn.onClick(e);
                                }
                            }
                        }                        
                    }
                },
                handler: plugin.cancelEdit,
                text: rowEditor.cancelBtnText
            }]
        }, config);

        me.callSuper([config]);

        me.addClsWithUI(me.position);
    },

    onRender: function () {
        this.callParent(arguments);

        this.setMargin('0 0 -5 0');
    },

    //this is running too early, if the editor is l
    setButtonPosition: function (position, secondCall) {
        var me = this;
        this.callParent(arguments);
        if (secondCall !== true) {
            Ext.defer(function () {
                me.setButtonPosition(position, true);
            }, 1);
        }
        
    }
});

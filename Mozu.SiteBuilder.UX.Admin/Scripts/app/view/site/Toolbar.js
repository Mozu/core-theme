/**
 * @class Taco.view.site.Toolbar
 */
Ext.define('Taco.view.site.Toolbar', {
    extend: 'Ext.container.Container',

    cls: Taco.baseCSSPrefix + 'inline-editor-tools',
    layout: {
        type: 'hbox',
        align: 'middle',
        pack: 'end',
        defaultMargins: '0 0 0 10'
    },
    defaults: {
        xtype: 'button',
        ui: 'action',
        scale: 'medium'
    },

    inMoreMenu: {
        'destroy': true,
        'copy': true
    },

    initComponent: function () {
        var me = this;

        this.items = [{
            itemId: 'more',
            text: 'More',
            menu: {
                plain: true,
                items: [{
                    text: 'Delete',
                    itemId: 'destroy',
                    handler: function () {
                        me.editor.deleteRecord();
                    }
                }, {
                    text: 'Duplicate',
                    itemId: 'copy',
                    handler: function () {
                        alert('tbd!');
                    }
                }]
            }
        }, {
            itemId: 'preview',
            text: 'Preview',
            handler: function () {
                me.editor.viewPage();
            }
        }, {
            itemId: 'publish',
            text: 'Publish',
            menu: {
                plain: true,
                items: [{
                    text: 'Page',
                    itemId: 'publishPage',
                    handler: function () {
                        me.editor.adapter.publish();
                    }
                }, {
                    text: 'All Items',
                    itemId: 'publishAll',
                    handler: function () {
                        me.editor.publishAll();
                    }
                }]
            }
        }];

        this.callParent(arguments);

        this.on({
            added: function (cmp) {
                cmp.resetButtons();
            }
        });
    },

    getButton: function (key) {
       return this.down('#'+key);
    },

    populate: function (adapter) {
        this.enableButtons(adapter.allowedActions);
    },

    resetButtons: function () {
        this.enableButtons({
            copy: false,
            more: false,
            destroy: false,
            publishPage: false
        });
    },

    enableButtons: function (config) {
        var enableMoreMenu = false;

        Ext.Object.each(config, function (key, value) {
            if (value && (key in this.inMoreMenu)) enableMoreMenu = true;
            var button = this.getButton(key);
            if (button) button[value ? "show" : "hide"]();
        }, this);
        this.getButton('more')[enableMoreMenu ? "show" : "hide"]();
    }
});

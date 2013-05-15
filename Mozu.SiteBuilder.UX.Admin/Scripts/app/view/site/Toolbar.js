/**
 * @class Taco.view.site.Toolbar
 */
Ext.define('Taco.view.site.Toolbar', {
    extend: 'Ext.container.Container',
    requires: ['Taco.core.ux.action.Button', 'Taco.core.ux.action.SplitButton'],

    cls: Taco.baseCSSPrefix + 'inline-editor-tools',
    layout: 'auto',
    defaults: {
        xtype: 'taco.button'
    },

    inMoreMenu: {
        'destroy': true,
        'copy': true
    },

    initComponent: function () {
        var self = this;

        this.items = [{
            text: 'Preview',
            itemId: 'preview',
            onClick: function () {
                self.editor.viewPage()
            }
        }, {
            text: 'More',
            xtype: 'taco.splitbutton',
            itemId: 'more',
            menu: {
                plain: true,
                items: [{
                    text: 'Delete',
                    itemId: 'destroy',
                    handler: function () {
                        self.editor.deleteRecord();
                    }
                }, {
                    text: 'Duplicate',
                    itemId: 'copy',
                    handler: function () {
                        alert('tbd!');
                    }
                }]
            }
        },
        {
            text: 'Publish',
            xtype: 'taco.splitbutton',
            itemId: 'publish',
            menu: {
                plain: true,
                items: [{
                    text: 'Page',
                    itemId: 'publishPage',
                    handler: function () {
                        alert('tbd!');
                    }
                }, {
                    text: 'All Items',
                    itemId: 'publishAll',
                    handler: function () {
                        alert('tbd!');
                    }
                }]
            }
        }



        ];

        this.callParent(arguments);

        this.on({
            added: function (cmp) {
                cmp.resetButtons();
            }
        });
    },

    getButton: function (key) {
       return  this.down('#'+key);
    },

    populate: function (adapter) {
        this.enableButtons(adapter.allowedActions);
    },

    resetButtons: function () {
        this.enableButtons({
            copy: false,
            more: false,
           // preview: false,
            destroy: false,
            publishPage: false,
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
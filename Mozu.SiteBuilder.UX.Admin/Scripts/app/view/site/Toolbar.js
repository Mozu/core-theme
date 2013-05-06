/**
 * @class Taco.view.site.Toolbar
 */
Ext.define('Taco.view.site.Toolbar', {
    extend: 'Ext.container.Container',
    requires: ['Taco.core.ux.action.Button'],
    cls: Taco.baseCSSPrefix + 'inline-editor-tools',
    margin: '3 0 0 0',
    layout: 'auto',
    inMoreMenu: {
        'destroy': true,
        'copy': true
    },
    defaults: {
        xtype: 'taco.button'
    },
    getButton:function(key){
       return  this.down('#'+key);
    },
    populate: function (adapter) {
        this.enableButtons(adapter.allowedActions);
    },
    resetButtons:function()
    {
        this.enableButtons( {
            copy: false,
            more: false,
            preview: false,
            destroy: false
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
    },
    listeners: {
        added: function (me) {
            me.resetButtons();
        }
    },
    initComponent: function () {
        var self = this;
        this.items = [
        {
            text: 'Preview',
            itemId: 'preview',
            onClick: function() {
                self.editor.viewPage()
            }
        },
        {
            text: 'More &#9662;',
            itemId: 'more',
            menu: {
                plain: true,
                items: [
            {
                text: 'Delete',
                itemId: 'destroy',
                handler: function () {
                    self.editor.deleteRecord();
                }
            },
            {
                text: 'Duplicate',
                itemId: 'copy',
                handler: function () {
                    alert('tbd!');
                }
            }
                ]
            }
        }
        ];
        this.callParent(arguments);
    }
});
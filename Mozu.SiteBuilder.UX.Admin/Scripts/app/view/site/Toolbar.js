/**
 * @class Taco.view.site.Toolbar
 */
Ext.define('Taco.view.site.Toolbar', {
    extend: 'Ext.toolbar.Toolbar',
    cls: Taco.baseCSSPrefix + 'inline-editor-tools',
    margin: '3 0 0 0',
    getButton:function(key){
       return  this.down('#'+key);
    },
    populate: function () {
        this.resetButtons();
    },
    resetButtons:function()
    {
        this.enableButtons( {
            add:true,
            copy:false,
            preview:false,
            settings:false,
            hide:false,
            destroy: false,
            formView:false
        });
    },
    enableButtons: function (config) {
        Ext.Object.each(config, function(key, value){
            this.getButton(key).setDisabled(!value);
        },this);
    },
    listeners: {
        added: function (me) {
            me.resetButtons();
        }
    },
    initComponent: function () {
        var editor = this.editor;
        this.items = [
        {
            text: 'Edit in Form View',
            itemId: 'formView',
            handler: this.editor.doFormView,
            scope: this.editor
        },
        {
            xtype: 'tbseparator'
        },
        {
            text: 'Add',
            itemId: 'add',
            handler: this.editor.createRecord,
            scope: this.editor
        },
        {
            text: 'Copy',
            itemId: 'copy',
            handler: function () { alert('tbd') },
            scope: this.editor
        },
        {
            text: 'Preview',
            itemId: 'preview',
            handler: this.editor.viewPage,
            scope: this.editor
        },
        {
            text: 'Page Settings',
            itemId: 'settings',
            handler: this.editor.settings,
            scope: this.editor
        },
        //{
        //    text:'food',
        //    handler: function () {
        //        cbp = me.toolBox.down('#cardPanel');
        //        fc = me.down('#newCardPanel');
        //    }
        //},
        {
            text: 'Hide',
            itemId: 'hide',
            enableToggle: true,
            listeners: {
                toggle: function (btn, pressed) {
                    this.editor.adapter.setHidden(pressed);
                },
                scope: this.editor
            }
        },
        {
            text: 'Delete',
            itemId: 'destroy',
            handler: this.editor.deleteRecord,
            scope: this.editor
        },
        {
            xtype: 'tbseparator'
        },
        {
            text: 'ToolBox',
            itemId: 'toolBox',
            enableToggle: true,
            listeners: {
                toggle: function (btn, pressed) {
                    this.editor.toolBox[pressed ? 'show' : 'hide']();
                },
                scope: this.editor
            }

        }


        ];
        this.callParent(arguments);
    }
});
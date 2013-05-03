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
        this.items = [
        {
            text: 'Edit in Form View',
            itemId: 'formView',
            handler: function () {
                this.editor.doFormView()
            },
            scope: this
        },
        {
            xtype: 'tbseparator'
        },
        {
            text: 'Add',
            itemId: 'add',
            handler: function() {
                this.editor.createRecord()
            },
            scope: this
        },
        {
            text: 'Copy',
            itemId: 'copy',
            handler: function () { alert('tbd') },
            scope: this
        },
        {
            text: 'Preview',
            itemId: 'preview',
            handler: function() {
                this.editor.viewPage()
            },
            scope: this
        },
        {
            text: 'Page Settings',
            itemId: 'settings',
            handler: function() {
                this.editor.settings();
            },
            scope: this
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
                scope: this
            }
        },
        {
            text: 'Delete',
            itemId: 'destroy',
            handler: function() {
                this.editor.deleteRecord();
            },
            scope: this
        }
        ];
        this.callParent(arguments);
    }
});
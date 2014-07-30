/*
 * 
 *
*/

Ext.define('Taco.overrides.form.field.HtmlEditor', {
    override: 'Ext.form.field.HtmlEditor',

    initComponent: function () {
        this.mon(this,'afterrender', this.onAfterRender, this);
        this.callParent(arguments);
    },
    
    initEditor: function () {
        var doc = this.getDoc();
        // prevent the tab key from changing the field contend when the iframeEl is active; Tab Key will move to the next field in the form;
        Ext.EventManager.on(doc, 'keydown', function (e, t) {
            if (e.getKey() == Ext.EventObject.TAB) {
                e.preventDefault();
                var allFocusable = Ext.getBody().query(":focusable");
                var fieldIndex = allFocusable.indexOf(this.iframeEl.dom)
                if (!fieldIndex) {
                    return;
                }
                var newIndex = fieldIndex + 1,
                    nextEl;

                if (e.shiftKey) {
                    newIndex = fieldIndex - 1
                }

                nextEl = Ext.get(allFocusable[newIndex]);
                nextEl.focus();
                return false;
            }
        },this);
        this.callParent(arguments);
    },

    onAfterRender: function () {
        // prevent the tab key from being used in the field so that the user can tab in and tab out of the field in the form panel.
        this.mon(this.textareaEl, 'keydown', function (e, t) {
            if (e.getKey() == Ext.EventObject.TAB) {                
                return;
            }
        }, this);
    },
    
    // overrides from the application.js file moved here. 
    getValue: function () {
        var me = this,
            value;
        if (!me.rendered) {
            return me.value;
        }
        if (!me.sourceEditMode) {
            if (document.getElementById(me.iframeEl.id)) {
                me.syncValue();
            } else {
                console.log('damn');
            }
        }
        value = me.textareaEl.dom.value;
        me.value = value;
        return value;
    },

    // overrides from the application.js file moved here. 
    relayCmd: function (cmd, value) {
        if (!this.rendered) {
            this.on('afterrender', function (html) {
                html.relayCmd(cmd, value);
            }, this, { single: true });
            return;
        }
        Ext.defer(function () {
            var me = this;
            if (!this.rendered) {
                me.relayCmd(cmd, value);
                return;
            }

            me.focus();
            me.execCmd(cmd, value);
            me.updateToolbar();
        }, 10, this);
    }
});

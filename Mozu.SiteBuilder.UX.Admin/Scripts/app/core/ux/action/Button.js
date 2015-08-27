/**
 * @class Taco.core.ux.action.Button
 */

Ext.define('Taco.core.ux.action.Button', {
    extend: 'Ext.button.Button',
    alias: 'widget.taco.button',

    autoEl: { tag: 'button' },
    baseCls: Taco.baseCSSPrefix + 'button',
    componentCls: Taco.baseCSSPrefix + 'action',
    componentLayout: 'autocomponent',
    hrefTarget: undefined,
    renderTpl: ['<span id="{id}-label">{text}</span>'],
    type: 'button',

    childEls: ['label'],

    initComponent: function() {
        this.autoEl = Ext.isString(this.autoEl) ? { tag: this.autoEl } : this.autoEl;
        Ext.applyIf(this.autoEl, this.getInitialAttributes());

        this.callParent(arguments);
    },

    getInitialAttributes: function () {
        var me = this,
            args = this.getTemplateArgs(),
            attributes = {};

        Ext.Object.each(args, function (key, value) {
            if (value) {
                attributes[key] = value;
            }
        }, this);
        
        return attributes;
    },

    getTemplateArgs: function () {
        var args = {
            text: this.text || '&#160;',
            disabled: this.disabled,
            tabIndex: this.tabIndex
        };

        if (this.autoEl.tag && this.autoEl.tag === 'a') {
            args.href = this.getHref();
            args.target = this.hrefTarget;
        } else if (this.autoEl.tag && this.autoEl.tag === 'button') {
            args.type = this.type;
            args.autocomplete = 'off';
        }

        return args;
    },

    setText: function (text) {
        text = text || '';
        var me = this,
            oldText = me.text || '';

        if (text != oldText) {
            if (me.rendered) {
                me.label.update(text);
                me.setComponentCls();
                if (Ext.isStrict && Ext.isIE8) {
                    // weird repaint issue causes it to not resize
                    me.el.repaint();
                }
                me.updateLayout();
            }
            me.fireEvent('textchange', me, oldText, text);
        }
        return me;
    },
    
    onMouseMove: Ext.emptyFn
});
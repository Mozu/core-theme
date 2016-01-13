/**
 * @class Taco.core.ux.action.ProgressSplitButton
 * A primary action that is a button element.
 */

Ext.define('Taco.core.ux.action.ProgressSplitButton', {
    extend: 'Ext.button.Split',
    alias: 'widget.progresssplitbutton',
    height: 40,
    text: 'Save',
    margin: "0 0 0 10",
    ui: 'action-primary',
    scale: 'medium',
    hidden: false,
    itemId: 'saveActionButton',
    allowDepress: false,
    enableToggle: true,
    formBind: true,
    renderTpl: [
        '<span id="{id}-btnWrap" role="presentation" class="{baseCls}-wrap',
            '<tpl if="splitCls"> {splitCls}</tpl>',
            '{childElCls}" unselectable="on">',
            '<span class="taco-check-save taco-button-overlay"></span>',
            '<span class="taco-animated-circle taco-button-overlay"></span>',
            '<span id="{id}-btnEl" class="{baseCls}-button" role="presentation">',
                '<span id="{id}-btnInnerEl" class="{baseCls}-inner {innerCls}',
                    '{childElCls}" unselectable="on">',
                    '{text}',
                '</span>',
                '<span role="presentation" id="{id}-btnIconEl" class="{baseCls}-icon-el {iconCls}',
                    '{childElCls} {glyphCls}" unselectable="on" style="',
                    '<tpl if="iconUrl">background-image:url({iconUrl});</tpl>',
                    '<tpl if="glyph && glyphFontFamily">font-family:{glyphFontFamily};</tpl>">',
                    '<tpl if="glyph">&#{glyph};</tpl><tpl if="iconCls || iconUrl">&#160;</tpl>',
                '</span>',
            '</span>',
        '</span>',
        // if "closable" (tab) add a close element icon
        '<tpl if="closable">',
            '<span id="{id}-closeEl" role="presentation"',
                ' class="{baseCls}-close-btn"',
                '<tpl if="closeText">',
                    ' title="{closeText}" aria-label="{closeText}"',
                '</tpl>',
                '>',
            '</span>',
        '</tpl>'
    ],

    startLoading: function() {
        var me = this;

        me.addCls('taco-button-processing');

        //add animation class to button -- to be removed on return of save
        me.addCls('taco-button-show-processing');
        me.addCls('taco-button-processing-complete');

        Ext.defer(function() {
            me.addCls('taco-button-show-processing-complete');
        }, 10);
    },

    stopLoading: function(cb) {

        var me = this;

        me.toggle(false, true);

        me.removeCls('taco-button-show-processing');

        Ext.defer(function() {
            me.removeCls('taco-button-show-processing-complete');
            if (cb && typeof cb === 'function') {
                cb();
            }
            me.removeCls('taco-button-processing');
            me.removeCls('taco-button-processing-complete');
        }, 1100);
        
    }

});
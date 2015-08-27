/**
 * @class Taco.core.ux.grid.ActionColumn
 * @author Simeon Kessler
 * A column containing a single action.
 * This extension was made to seperate out the image tpl from the default extjs code. This allows me to override the actual dom created and make it a div with iconFont instead of an image tag.
 */
Ext.define('Taco.core.ux.grid.ActionColumn', {
    extend: 'Ext.grid.column.Action',
    alias: 'widget.taco.actioncolumn',
    
    draggable: false,
    hideable: false,
    resizable: false,
    sortable: false,
    text: '',
    width: 100,
    menuDisabled: true,
    
    // Note this is a straight copy of the default method on the extjs class. I am just calling a seperate method to get the dom for the image tag which will allow the dom to be overriden easily
    // Renderer closure iterates through items creating an <img> element for each and tagging with an identifying
    // class name x-action-col-{n}
    defaultRenderer: function (v, meta, record, rowIdx, colIdx, store, view) {        
        var me = this,
            prefix = Ext.baseCSSPrefix,
            scope = me.origScope || me,
            items = me.items,
            len = items.length,
            i = 0,
            item, ret, disabled, tooltip;

        // Allow a configured renderer to create initial value (And set the other values in the "metadata" argument!)
        // Assign a new variable here, since if we modify "v" it will also modify the arguments collection, meaning
        // we will pass an incorrect value to getClass/getTip
        ret = Ext.isFunction(me.origRenderer) ? me.origRenderer.apply(scope, arguments) || '' : '';
        
        meta.tdCls += ' ' + Ext.baseCSSPrefix + 'action-col-cell';
        var actionIconTpl = new Ext.XTemplate(me.actionIconTpl);


        for (; i < len; i++) {
            item = items[i];

            disabled = item.disabled || (item.isDisabled ? item.isDisabled.call(item.scope || scope, view, rowIdx, colIdx, item, record) : false);
            tooltip = disabled ? null : (item.tooltip || (item.getTip ? item.getTip.apply(item.scope || scope, arguments) : null));

            // Only process the item action setup once.
            if (!item.hasActionConfiguration) {

                // Apply our documented default to all items
                item.stopSelection = me.stopSelection;
                item.disable = Ext.Function.bind(me.disableAction, me, [i], 0);
                item.enable = Ext.Function.bind(me.enableAction, me, [i], 0);
                item.hasActionConfiguration = true;
            }

            /*
            // the original extjs snerst

            ret += '<img role="button" alt="' + (item.altText || me.altText) + '" src="' + (item.icon || Ext.BLANK_IMAGE_URL) +
                '" class="' + prefix + 'action-col-icon ' + prefix + 'action-col-' + String(i) + ' ' + (disabled ? prefix + 'item-disabled' : ' ') +
                ' ' + (Ext.isFunction(item.getClass) ? item.getClass.apply(item.scope || scope, arguments) : (item.iconCls || me.iconCls || '')) + '"' +
                (tooltip ? ' data-qtip="' + tooltip + '"' : '') + ' />';
            
            */

            var actionIconData = {
                altText: (item.altText || me.altText),
                src: (item.icon || Ext.BLANK_IMAGE_URL),
                cls: prefix + 'action-col-icon ' + prefix + 'action-col-' + String(i) + ' ' + (disabled ? prefix + 'item-disabled' : ' ') + ' ' + (Ext.isFunction(item.getClass) ? item.getClass.apply(item.scope || scope, arguments) : (item.iconCls || me.iconCls || '')),
                tooltip: (tooltip ? ' data-qtip="' + tooltip + '"' : '')
            };
            
            ret += actionIconTpl.apply(actionIconData);

        }
        return ret;
    },
    
    // this template is meant to be overwritten by the subclass. 
    actionIconTpl: [
        '<img roles="button" alt="{altText}" src="{src}"  class="{cls}"  {tooltip} />'
    ]    
});
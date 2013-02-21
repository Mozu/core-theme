/**
 * @class Taco.core.ux.action.PrimarySplitButton
 */
Ext.define('Taco.core.ux.action.PrimarySplitButton', {
    extend: 'Ext.button.Split',
    alias: 'widget.primarysplitbutton',
    mixins: ['Taco.core.util.GetsParentPage'],
    scale: 'medium',
    cls: Taco.baseCSSPrefix + 'action ' + Taco.baseCSSPrefix + 'splitbutton ' + Taco.baseCSSPrefix + 'action-primary'
});
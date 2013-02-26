/**
 * @class Taco.core.ux.action.PrimarySplitButton
 */
Ext.define('Taco.core.ux.action.PrimarySplitButton', {
    extend: 'Ext.button.Split',
    alias: 'widget.primarysplitbutton',
    mixins: ['Taco.core.util.GetsParentPage'],
    scale: 'medium',
    cls: Taco.baseCSSPrefix + 'action ' + Taco.baseCSSPrefix + 'splitbutton ' + Taco.baseCSSPrefix + 'action-primary',
    menuDefaults: {
        plain: true,
        cls: Taco.baseCSSPrefix + 'splitbutton-menu',
        defaults: {
            plain: true,
            cls: Taco.baseCSSPrefix + 'splitbutton-menu-item'
        }
    },
    initComponent : function() {
        this.menu = this.createMenu();
        this.callParent(arguments);
    },
    
    createMenu: function () {
        if (this.menu && this.menu.$className == undefined) {
            this.menu = Ext.applyIf(this.menu, this.menuDefaults);
        }
        return this.menu || Ext.create('Ext.menu.Menu', Ext.applyIf({ items: this.createMenuItems() || [] },  this.menuDefaults));
    },
    createMenuItems: function () {
        return this.menuItems;
    }
    

});
/**
 * @class Taco.core.ux.action.SplitButton
 */
Ext.define('Taco.core.ux.action.SplitButton', {
    extend: 'Ext.button.Split',
    mixins: ['Taco.core.util.GetsParentPage'],
    scale: 'small',
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
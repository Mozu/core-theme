/**
 * @class Taco.core.ux.action.SplitButton
 */

// DEPRECATED -- BEN CRIPPS OCT 8 2015

// Ext.define('Taco.core.ux.action.SplitButton', {
//     extend: 'Taco.core.ux.action.Button',
//     xtype: 'taco.splitbutton',
//     mixins: ['Taco.core.util.GetsParentPage'],
//     cls: Taco.baseCSSPrefix + "splitbutton",
//     menuDefaults: {
//         plain: true,
//         cls: Taco.baseCSSPrefix + 'splitbutton-menu',
//         defaults: {
//             cls: Taco.baseCSSPrefix + 'splitbutton-menu-item'
//         }
//     },
//     renderTpl: ['<span id="{id}-label">{text}</span><strong id="{id}-menutrigger">&#9662;</strong>'],
//     childEls: ['label', 'menutrigger'],
//     initComponent : function() {
//         this.menu = this.createMenu();
//         this.callParent(arguments);
//     },

//     onClick: function (e) {
//         var me = this;
//         if (me.preventDefault || (me.disabled && me.getHref()) && e) {
//             e.preventDefault();
//         }
//         if (e.button !== 0) {
//             return;
//         }
//         if (e.within(me.menutrigger, false, true)) {
//             me.maybeShowMenu();
//         } else {
//             me.doToggle();
//             me.fireHandler(e);
//         }
//     },
    
//     createMenu: function () {
//         if (this.menu && this.menu.$className == undefined) {
//             this.menu = Ext.applyIf(this.menu, this.menuDefaults);
//         }
//         return this.menu || Ext.create('Ext.menu.Menu', Ext.applyIf({ items: this.createMenuItems() || [] },  this.menuDefaults));
//     },
//     createMenuItems: function () {
//         return this.menuItems;
//     }
    

// });
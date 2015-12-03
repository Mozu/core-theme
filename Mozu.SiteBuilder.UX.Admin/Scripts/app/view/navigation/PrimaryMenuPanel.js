/**
 * @class Taco.view.navigation.PrimaryMenuPanel
 * @author Jimmy Sanford
 *
 */
Ext.define('Taco.view.navigation.PrimaryMenuPanel', {
    extend: 'Ext.panel.Panel',
    requires: ['Taco.view.navigation.PrimaryMenu'],
    cls: 'taco-primary-menu-ct',
    //autoEl: {
    //    tag: 'div',
    //    cls: 'taco-primary-menu-ct'
    //},
    autoShow: false,
    autoScroll:true,
    border: true, //false
    floating: true,
    header: false,
    hideMode: 'offsets',
    id: 'primaryMenuPanel',
    mixins: { bindable: 'Ext.util.Bindable' },
    plain: true,
    resizable: false,
    shadow: false,
    x: 0,
    y: 6,
    layout: {
        type: 'card'
    },
    trigger: null,
    breadcrumb: null,
    bound: false,

    initComponent: function () {
        this.homeMenu = Ext.create('Taco.view.navigation.PrimaryMenu', {
            id: 'primaryMenuHome',
            trigger: this.trigger,
            breadcrumb: this.breadcrumb,
            navPage: 'home'
        });

        this.sysAdmMenu = Ext.create('Taco.view.navigation.PrimaryMenu', {
            id: 'primaryMenuSysAdm',
            trigger: this.trigger,
            breadcrumb: this.breadcrumb,
            navPage: 'sysAdm'
        });
        //this.bindStore();
        this.items = [
            this.homeMenu,
            this.sysAdmMenu
        ];

        //this.items.add(this.homeMenu);
        //this.items.add(this.sysAdmMenu);
        this.activeItem = 0;
        this.activeCard = this.homeMenu;
        this.menus = {
            "home": this.homeMenu,
            "sysAdm": this.sysAdmMenu
        };
        this.callParent(arguments);

        this.mon(Taco.app, 'nav-menu-target', Ext.bind(this.onNavMenuChange, this));
        Ext.getDoc().on('click', Ext.bind(this.handleDocClick, this));
    },

    onNavMenuChange: function (navTarget) {
        var activeMenuItem = this.menus[navTarget];
        if (!activeMenuItem) {
            console.log(navTarget + " not found");
            return;
        }

        if (!activeMenuItem.isBound) {
            activeMenuItem.bindStore(this.createNavStore(activeMenuItem.navPage));
        }
        var cardLayout = this.getLayout();
        cardLayout.setActiveItem(activeMenuItem);
        activeMenuItem.showMenu();
        this.activeCard.hideMenu();
        this.activeCard = activeMenuItem;
    },

    createNavStore : function (navPage) {
        return Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.Navigation',
            autoLoad: true,
            clearFilters: false,
            createOnly:true,
            filters: [function (item) {
                return item.get('navPage') === navPage;
            }]
        });
    },

    bindStore: function () {
        if (this.bound) {
            return;
        }
        this.homeMenu.bindStore(this.createNavStore('home'));
        this.sysAdmMenu.bindStore(this.createNavStore('sysAdm'));
        //var cardLayout = this.getLayout();
        //cardLayout.setActiveItem(this.homeMenu);
        this.bound = true;
    },

    isBound: function () {
        return this.bound;
    },

    isRendered: function() {
        return this.activeCard.rendered;
    },

    isHidden: function() {
      return this.activeCard.isHidden();
    },

    setTrigger: function(trigger) {
        this.activeCard.setTrigger(trigger);
    },

    /**
     * Shows the floating menu.
     * @private
     */
    showMenu: function () {
        this.show();
        //this.trigger.addCls('expanded');
        this.activeCard.showMenu();
        //this.activeCard.trigger.addCls('expanded');
    },

    /**
     * Hides the floating menu.
     * @private
     */
    hideMenu: function () {

        //this.trigger.removeCls('expanded');
        //this.activeCard.hide();
        this.activeCard.hideMenu();
        this.hide();
        //this.activeCard.trigger.removeCls('expanded');
    },

    /**
     * Hides menu when you click anywhere on document.
     * Needs a reference so listener can easily be added and removed.
     * @private
     */
    handleDocClick: function (e, el) {
        if (el && el.hasAttribute('data-nav-target')) {
            return;
        }
        this.activeCard.hideMenu();
    }
});
/**
 * @class Taco.view.navigation.PrimaryMenu
 * @author Jimmy Sanford
 * 
 */
Ext.define('Taco.view.navigation.PrimaryMenu', {
    extend: 'Ext.container.Container',
    requires: ['Taco.view.navigation.PrimaryMenuView'],

    autoEl: {
        tag: 'div',
        cls: 'taco-primary-menu-ct'
    },
    autoShow: true,
    border: false,
    floating: true,
    header: false,
    hideMode: 'offsets',
    id: 'primaryMenu',
    mixins: { bindable: 'Ext.util.Bindable' },
    plain: true,
    resizable: false,
    shadow: false,
    x: 0,
    y: 49,
    
    initComponent: function () {
        this.callParent(arguments);

        this.on({
            add: function (menu) { menu.hide(); }
        });
    },

    bindStore: function (store, initial) {
        this.mixins.bindable.bindStore.apply(this, arguments);

        this.view = Ext.create('Taco.view.navigation.PrimaryMenuView', {
            store: store
        });

        this.add(this.view);
    },

    /**
     * Method to manage awareness of when the global application state changes.
     *
     * Allows addition of behavior when a new AppState is activated.
     * @param  {Taco.core.AppState} appState The state that is now active.
     * @template
     */
    onStateChange: function (appState) {
        var md = appState.getMetaData();
    },

    /**
     * Shows the floating menu.
     * @private
     */
    showMenu: function () {
        var tBox = this.trigger.getEl().getPageBox();

        if (Ext.isIE8m) {
            // if IE8 or less use JS to animate
            this.show(null, function () {
                this.animate({
                    duration: 400,
                    from: { opacity: 0, x: tBox.left, y: tBox.top },
                    to: { opacity: 1, x: tBox.left, y: tBox.bottom }
                })
            }, this);
        } else {
            // else let CSS handle the animation
            this.show();
        }

        this.trigger.addCls('expanded');
    },

    /**
     * Hides the floating menu.
     * @private
     */
    hideMenu: function () {
        var tBox = this.trigger.getEl().getPageBox();

        if (Ext.isIE8m) {
            // if IE8 or less use JS to animate
            this.animate({
                duration: 400,
                from: { opacity: 1, x: tBox.left, y: tBox.bottom },
                to: { opacity: 0, x: tBox.left, y: tBox.top },
                callback: function () {
                    this.hide();
                },
                scope: this
            });
        } else {
            // else let CSS handle the animation
            this.hide();
        }

        this.trigger.removeCls('expanded');
    }
});
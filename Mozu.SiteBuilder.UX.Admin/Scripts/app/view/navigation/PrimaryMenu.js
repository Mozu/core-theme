/**
 * @class Taco.view.navigation.PrimaryMenu
 */
Ext.define('Taco.view.navigation.PrimaryMenu', {
    extend: 'Ext.container.Container',
    requires: ['Taco.view.navigation.PrimaryMenuView'],

    autoEl: {
        tag: 'div',
        cls: 'taco-primary-menu-ct'
    },
    autoShow: false,
    border: false,
    floating: true,
    header: false,
    id: 'primaryMenu',
    mixins: { bindable: 'Ext.util.Bindable' },
    plain: true,
    resizable: false,
    shadow: false,
    
    initComponent: function () {
        this.callParent(arguments);
    },

    bindStore: function (store, initial) {
        this.mixins.bindable.bindStore.apply(this, arguments);

        this.view = Ext.create('Taco.view.navigation.PrimaryMenuView', {
            store: store
        });

        this.add(this.view);

        // record = this.store.getById(this.recordId);

        // if (!record) {
        //     return;
        // }

        // Ext.each(record.data.items, function (storeItem) {
        //     this.add(Ext.create('Taco.view.navigation.PrimaryMenuItem', {
        //         data: storeItem
        //     }));
        // }, this);
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

        this.show(null, function () {
            this.animate({
                duration: 400,
                from: { opacity: 0, x: tBox.left, y: tBox.top },
                to: { opacity: 1, x: tBox.left, y: tBox.bottom }
            })
        }, this);

        this.trigger.addCls('expanded');
    },

    /**
     * Hides the floating menu.
     * @private
     */
    hideMenu: function () {
        var tBox = this.trigger.getEl().getPageBox();

        this.animate({
            duration: 400,
            from: { opacity: 1, x: tBox.left, y: tBox.bottom },
            to: { opacity: 0, x: tBox.left, y: tBox.top },
            callback: function () {
                this.hide();
            },
            scope: this
        });

        this.trigger.removeCls('expanded');
    }
});
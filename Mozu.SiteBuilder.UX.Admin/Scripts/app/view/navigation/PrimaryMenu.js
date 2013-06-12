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
    y: 55,
    
    initComponent: function () {
        this.callParent(arguments);

        this.on({
            add: function (menu) { menu.hide(); }
        });
    },

    bindStore: function (store, initial) {
        this.store = store;
        this.mixins.bindable.bindStore.apply(this, arguments);

        this.view = Ext.create('Taco.view.navigation.PrimaryMenuView', {
            parentMenu: this,
            store: store
        });

        this.add(this.view);
        this.onStateChange(Taco.core.StateManager.getCurrentState());
    },

    /**
     * Method to manage awareness of when the global application state changes.
     *
     * Allows addition of behavior when a new AppState is activated.
     * @param  {Taco.core.AppState} appState The state that is now active.
     * @template
     */
    onStateChange: function (appState) {
        var controller = appState.metaData.controller,
            appStateAddress = appState.getUri().toLowerCase(),
       parentRecord, selectedRecord;
        
        
        if (!controller || !this.store) {
            return;
        }
        controller = controller.toLowerCase();
        
        this.store.each(function (topParent) {
            
            if ((topParent.data.address || '').toLowerCase() == controller) {
                parentRecord = topParent;
                selectedRecord = topParent;
            }
            topParent.items().each(function (subItem) {
                if ((subItem.data.address || '').toLowerCase() == controller) {
                    parentRecord = topParent;
                    selectedRecord = subItem;
                }
            });
        });
        if (!selectedRecord) {
            
            this.store.each(function (topParent) {
                if (topParent.data.address && appStateAddress.indexOf(topParent.data.address.toLowerCase() )> -1 && appStateAddress.indexOf(topParent.data.address.toLowerCase()) == appStateAddress.length + topParent.data.address.length) {
                    parentRecord = topParent;
                    selectedRecord = topParent;
                }
                topParent.items().each(function (subItem) {
                    if (subItem.data.address && appStateAddress.indexOf(subItem.data.address.toLowerCase()) > -1 && appStateAddress.indexOf(subItem.data.address.toLowerCase()) == appStateAddress.length - subItem.data.address.length) {
                        parentRecord = topParent;
                        selectedRecord = subItem;
                    }
                });
            });
        }
        if (selectedRecord) {

            this.syncBreadcrumb(parentRecord, selectedRecord);
        }
        

    },
    syncBreadcrumb: function (parent, selected) {
        var bc = this.breadcrumb,
            data = Ext.apply({ selected: parent == selected }, parent.getData()),
            subData = [];
       
        parent.items().each(function (subRecord) {
            subData.push(Ext.apply({ selected: subRecord == selected }, subRecord.getData()));
        });


        Ext.apply(data, { items: subData });
        bc.update(data);
    },

    /**
     * Shows the floating menu.
     * @private
     */
    showMenu: function () {
        var tBox = this.trigger.getEl().getPageBox();

        Ext.getDoc().addListener('click', this.onClickDoc, this);

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

        Ext.getDoc().removeListener('click', this.onClickDoc, this);

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
    },

    /**
     * Hides menu when you click anywhere on document.
     * Needs a reference so listener can easily be added and removed.
     * @private
     */
    onClickDoc: function (e, el) {
        this.hideMenu();
    }
});
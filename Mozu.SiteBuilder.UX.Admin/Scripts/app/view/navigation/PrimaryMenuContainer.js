/**
 * @class Taco.view.navigation.PrimaryMenuContainer
 * 
 */
Ext.define('Taco.view.navigation.PrimaryMenuContainer', {
    extend: 'Ext.container.Container',
    requires: [
        'Taco.core.ux.content.Logo',
        'Taco.view.navigation.PrimaryMenuSubContainer',
        'Taco.view.navigation.PrimaryMenuMask'
    ],
    cls: 'taco-primary-menu-ct hidden',

    autoShow: false,
    autoScroll:true,
    border: false,
    floating: true,
    header: false,
    hideMode: 'offsets',
    mixins: { bindable: 'Ext.util.Bindable' },
    plain: true,
    resizable: false,
    shadow: false,
    x: 0,
    y: 0,
    id: 'primaryMenuContainer',
    isBound: false,
    width: 280,
    height: '100%',

    initComponent: function () {

        this.mask = Ext.create('Taco.view.navigation.PrimaryMenuMask', {
            renderTo: Ext.getBody()
        });

        this.callParent(arguments);
        this.on({
            add: function (menu) { menu.hideMenu(); }
        });

        Ext.getDoc().on('click', Ext.bind(this.handleDocClick, this));
    },

    bindStore: function (store, initial) {
        if (this.isBound) {
            return;
        }
        this.store = store;
        this.mixins.bindable.bindStore.apply(this, arguments);

        this.viewMain = Ext.create('Taco.view.navigation.PrimaryMenuSubContainer', {
            title: 'Main',
            parentMenu: this,
            store: store,
            navParent: 'main',
            tabConfig: {
                width: 129
            }
        });

        this.viewSystem = Ext.create('Taco.view.navigation.PrimaryMenuSubContainer', {
            title: 'System',
            tabConfig: {
                cls: 'taco-tab-heading',
                margin: '0 0 0 -3',
                title: 'System',
                width: 129
            },
            parentMenu: this,
            store: store,
            navParent: 'sys'
        });

        this.add({
            activeTab: Ext.state.Manager.get('primary-menu-tab') === 'sys' ? 1 : 0,
            cls: 'taco-primary-menu-tabs',
            items: [
                this.viewMain,
                this.viewSystem
            ],
            listeners: {
                tabchange: function (view, card) {
                    Ext.state.Manager.set('primary-menu-tab', card.navParent);
                }
            },
            xtype: 'tabpanel'
        });

        this.onStateChange(Taco.core.StateManager.getCurrentState());
        this.isBound = true;
    },

    updateCurrentPage: function () {
        this.viewMain.updateCurrentPage();
        this.viewSystem.updateCurrentPage();
    },

    compareController: function(address, controllerName) {
        address = (address || '').toLowerCase();
        return address === controllerName || Ext.util.Inflector.singularize(address) === Ext.util.Inflector.singularize(controllerName);
    },

    /**
     * Method to manage awareness of when the global application state changes.
     *
     * Allows addition of behavior when a new AppState is activated.
     * @param  {Taco.core.AppState} appState The state that is now active.
     * @template
     */
    onStateChange: function (appState) {
        var self = this,
            controller = appState.metaData.controller,
            appStateAddress = appState.getUri().toLowerCase(),
            foundRecords;

        if (appStateAddress && appState.getMetaData().ctx && appState.getUri().indexOf(appState.getMetaData().ctx)==0) {
            appStateAddress = appState.getUri().toLowerCase().substring(appState.getMetaData().ctx.length + 1);
        }

        if (!controller || !this.store) {
            return;
        }
        controller = controller.toLowerCase();

        this.breadcrumb[controller == 'dashboard' ? 'hide' : 'show']();

        foundRecords = this.findNavRecords(this.store, appStateAddress);

        if (foundRecords) {
            this.syncBreadcrumb(foundRecords.parentRecord, foundRecords.selectedRecord);
        }

    },
    findNavRecords: function (store, appStateAddress) {

        var matches = [],
            me = this,
            ret;

        store.each(function (item) {

            if (item.data.address && appStateAddress.indexOf(item.data.address.toLowerCase()) == 0  ){

                matches.push({
                    parentRecord: item,
                    selectedRecord: item,
                    score: item.data.address.length
                });
            }

            if (item.items().getCount()) {
                ret = me.findNavRecords(item.items(), appStateAddress);
                if (ret) {
                    ret.parentRecord = ret.parentRecord == ret.selectedRecord && ret.selectedRecord.items().getCount() == 0 ? item : ret.parentRecord;
                    matches.push(ret);
                }

            }
        });

        Ext.Array.each(matches, function (item) {
            if (item) {
                ret = ret || item;
                if (item.score > ret.score) {
                    ret = item;
                }
            }
        });
        return ret;

    },
    syncBreadcrumb: function (parent, selected) {
        var bc = this.breadcrumb,
            data = Ext.apply({ selected: parent == selected }, parent.getData()),
            state = Taco.core.StateManager.statestack[Taco.core.StateManager.stateindex],
            subData = [];
            if (parent.get('showBreadCrumbs')) {
                parent.items().each(function (subRecord) {

                    if (subRecord.get('viewDependent') && state && state.uri) {
                        if (state.uri.match(subRecord.get('viewDependent'))) {
                            return false;
                        }
                    }

                    if (selected && selected.data && selected.data.address) {
                        subData.push(Ext.apply({ selected: subRecord.data.address == selected.data.address }, subRecord.getData()));
                    }
                    else {
                        subData.push(Ext.apply({ selected: subRecord == selected }, subRecord.getData()));
                    }
            });
        }

        Ext.apply(data, { items: subData });
        bc.update(data);
    },

    setTrigger: function(trigger) {
        this.trigger = trigger;
    },

    /**
     * Shows the floating menu.
     * @private
     */
    showMenu: function () {
        clearTimeout(this._hideTimeout);
        this.mask.showMask();
        this.show();
        this.updateCurrentPage();
        this.getEl().removeCls('hidden');
    },

    /**
     * Hides the floating menu.
     * @private
     */
    hideMenu: function () {
        var me = this,
            el = this.getEl();

        if (!el) {
            return this.hide();
        }

        this.mask.hideMask();

        el.addCls('hidden');
        this._hideTimeout = setTimeout(function () {
            me.hide();
        }, 150);
    },

    /**
     * Hides menu when you click anywhere on document.
     * Needs a reference so listener can easily be added and removed.
     * @private
     */
    handleDocClick: function (e, el) {
        // todo: temp check for now - Greg Murray on 2015-12-15 
        var classAttr = el.getAttribute('class');
        if (classAttr && classAttr.indexOf('-tab') > -1) {
            return;
        }
        this.hideMenu();
    }
});
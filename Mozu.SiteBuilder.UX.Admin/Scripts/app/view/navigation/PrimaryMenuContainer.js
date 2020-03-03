/**
 * @class Taco.view.navigation.PrimaryMenuContainer
 *
 */
Ext.define('Taco.view.navigation.PrimaryMenuContainer', {
    extend: 'Ext.Panel',
    requires: [
        'Taco.core.ux.content.Logo',
        'Taco.view.navigation.PrimaryMenuSubContainer',
        'Taco.view.navigation.PrimaryMenuMask',
        'Taco.core.ux.card.Tab',
        'Taco.core.ux.card.Toolbar',
        'Taco.view.navigation.GlobalSearchBox'
    ],
    cls: 'taco-primary-menu-ct hidden',

    autoShow: false,
    autoScroll: true,
    border: false,
    floating: true,
    header: false,
    hideMode: 'offsets',
    mixins: {
        bindable: 'Ext.util.Bindable'
    },
    plain: true,
    resizable: false,
    shadow: false,
    x: 0,
    y: 0,
    id: 'primaryMenuContainer',
    isBound: false,
    width: 320,
    height: '100%',

    layout: 'card',

    initComponent: function () {

        this.mask = Ext.create('Taco.view.navigation.PrimaryMenuMask', {
            listeners: {
                click: this.hideMenu,
                element: 'el',
                scope: this
            },
            renderTo: Ext.getBody()
        });

        this.callParent(arguments);
        this.on({
            add: function (menu) {
                menu.hideMenu();
            }
        });

    },

    bindStore: function (store, initial) {
        if (this.isBound) {
            return;
        }
        const fullfillerAccessibleLinks = ['order', 'fulfillment', 'help-system', 'help-main'];
        const fullfillerAccessibleSubLinks = ['orders', 'returns'];
        if (Taco.user.isFulfillerUser) {
            store.filterBy(function (rec) {
                return fullfillerAccessibleLinks.includes(rec.get('id'));
            });
        }
        this.store = store;
        var colorArray = ['purple', 'green', 'blue', 'orange'];
        var currentIndex = 0;
        this.store.each(function (record, idx) {
            if (Taco.user.isFulfillerUser) {
                if (record.data.items != "") {
                    var filteredItems = record.data.items.filter(function (rec) {
                        return fullfillerAccessibleSubLinks.includes(rec.id);
                    });
                    record.data.items = filteredItems;
                }
            }
            switch (record.get('navParent')) {
                case 'main':
                    record.set('menucolor', colorArray[idx % 4]);
                    break;
                case 'sys':
                    record.set('menucolor', colorArray[currentIndex % 4]);
                    currentIndex++;
                    break;
            }            
        });
        this.mixins.bindable.bindStore.apply(this, arguments);

        this.viewMain = Ext.create('Taco.view.navigation.PrimaryMenuSubContainer', {
            title: 'Main',
            style: "width: 136px; top:-1px !important;",
            parentMenu: this,
            store: store,
            navParent: 'main'
        });

        this.viewSystem = Ext.create('Taco.view.navigation.PrimaryMenuSubContainer', {
            title: 'System',
            style: "top:-1px !important;",
            tabConfig: {
                cls: 'taco-tab-heading',
                margin: '0 0 0 -3',
                title: 'System'
            },
            parentMenu: this,
            store: store,
            navParent: 'sys'
        });

        this.viewSearch = Ext.create('Ext.container.Container', {
            title: 'Search',
            cls: 'search-container',
            layout: 'hbox',
            items: [{
                xtype: 'label',
                padding: 7,
                right: 0,
                top: 10,
                html: '<label style="color: #306;cursor:pointer;"><i class="fa fa-times" style="font-size:16px;" aria-hidden="true"></i></label>',
                margin: '0 0 0 4',
                listeners: {
                    scope: this,
                    element: 'el',
                    click: function (e) {
                        this.viewSearch.down('global-search-box').reset();
                    }
                }
            }, {
                xtype: 'global-search-box'
            }]
        });

        var activeTab = Ext.state.Manager.get('primary-menu-tab') === 'System' ? 1 : 0;

        var tenantName = Taco.app.context.name || '[tenant]';
        var userName = Taco.user.name || Taco.user.email || '[user]';
        var splitUserName = userName.split(' ');
        var initials;
        if (splitUserName.length > 1) {
            initials = splitUserName[0][0] + splitUserName[splitUserName.length - 1][0];
        }
        var me = this,
            sanbdBoxItemStore = Ext.create('Ext.data.Store', {
                model: 'Taco.model.NavigationItem',
                data: {
                    'id': 'tenantName',
                    'navParent': 'main',
                    'label': tenantName,
                    //'icon': 'fa-book',
                    //'menucolor': 'green',
                    'behaviorIds': [4],
                    'items': [{
                        'id': 'launchPad',
                        'label': 'Launchpad',
                        'address': '/admin/auth/launchpad',
                        'behaviorIds': [4]
                    }]
                }
            });

        var userItemStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.NavigationItem',
            data: {
                'id': 'userName',
                'navParent': 'main',
                'label': userName,
                'icon': 'fa fa-user',
                //'menucolor': 'green',
                'behaviorIds': [4],
                'items': [{
                    'id': 'logout',
                    'label': 'Logout',
                    'address': '/admin/auth/logout',
                    'behaviorIds': [4]
                }]
            }
        });

        var switchToClassicStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.NavigationItem',
            data: {
                'id': 'switchToClassic',
                'navParent': 'main',
                'label': 'Switch to Classic UI',
                'icon': 'fa fa-undo',
                'menucolor': 'purple',
                'behaviorIds': [4],
            }
        });

        me.sabdBoxRecord = sanbdBoxItemStore.getAt(0);
        me.userRecord = userItemStore.getAt(0);
        me.switchToClassicRecord = switchToClassicStore.getAt(0);

        this.add({
            xtype: 'panel',
            dockedItems: [{
                html: '<i style="cursor: pointer;" class="close fa fa-times"></i><div class="sidebarlogo"><div style="cursor: pointer;" class="logoimg"></div></div>',
                listeners: {
                    scope: this,
                    element: 'el',
                    click: function (e) {
                        if (e.target.tagName == "I") {
                            this.hideMenu();
                        } else if (e.target.classList[0] == "logoimg") {
                            window.location.href = '/admin';
                        }
                    }
                }
            }, {
                xtype: 'taco-cardtabtoolbar',
                activeTab: activeTab,
                cls: 'taco-primary-menu-toolbar',
                items: [{
                    title: 'MAIN',
                    style: "width: 136px;"
                }, {
                    title: 'SYSTEM',
                    style: "width: 136px;"
                }, {
                    style: "width: 48px;",
                    title: '<label style="cursor:pointer;"><i class="fal fa-search" aria-hidden="true"></i></label>',
                }]
            }, {
                xtype: 'primary-menu-nav-group',
                record: this.sabdBoxRecord
            }, {
                    xtype: 'container',
                    cls : 'action-panel-wrapper',
                    layout: 'vbox',
                    dock: 'bottom',
                items: [{
                    xtype: 'primary-menu-nav-group',
                    record: this.userRecord
                }, {
                    xtype: 'primary-menu-nav-group',
                    hidden: !this.showSwitchAdminButton(),
                    record: this.switchToClassicRecord
                }]   
            }],
            layout: 'card',
            listeners: {
                tabchange: function (view, tab) {
                    Ext.state.Manager.set('primary-menu-tab', tab.title);
                },
                scope: this
            },
            items: [
                this.viewMain,
                this.viewSystem,
                this.viewSearch
            ]
        });

        this.onStateChange(Taco.core.StateManager.getCurrentState());
        this.isBound = true;
    },

    showSwitchAdminButton: function () {
        var taContext = Taco.app.context;
        return taContext.getHasLegacyAdmin();
    },

    updateCurrentPage: function () {
        this.viewMain.updateCurrentPage();
        this.viewSystem.updateCurrentPage();
    },

    compareController: function (address, controllerName) {
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

        if (appStateAddress && appState.getMetaData().ctx && appState.getUri().indexOf(appState.getMetaData().ctx) == 0) {
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

            if (item.data.address && appStateAddress.indexOf(item.data.address.toLowerCase()) == 0) {

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
            data = Ext.apply({
                selected: parent == selected
            }, parent.getData()),
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
                    subData.push(Ext.apply({
                        selected: subRecord.data.address == selected.data.address
                    }, subRecord.getData()));
                } else {
                    subData.push(Ext.apply({
                        selected: subRecord == selected
                    }, subRecord.getData()));
                }
            });
        }

        Ext.apply(data, {
            items: subData
        });
        bc.update(data);
    },

    setTrigger: function (trigger) {
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
    }
});
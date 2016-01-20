/**
 * @class Taco.view.navigation.PrimaryMenu
 * @author Jimmy Sanford
 * 
 */
Ext.define('Taco.view.navigation.PrimaryMenu', {
    extend: 'Ext.container.Container',
    requires: ['Taco.view.navigation.PrimaryMenuView'],
    cls: 'taco-primary-menu-ct',
    //autoEl: {
    //    tag: 'div',
    //    cls: 'taco-primary-menu-ct'
    //},
    autoShow: true,
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
    y: 6,
    id: 'primaryMenu',
    isBound: false,
    
    initComponent: function () {
        this.callParent(arguments);

        this.on({
            add: function (menu) { menu.hide(); }
        });

        Ext.getDoc().on('click', Ext.bind(this.handleDocClick, this));
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
        this.isBound = true;
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
        this.show();
        //this.trigger.addCls('expanded');
    },

    /**
     * Hides the floating menu.
     * @private
     */
    hideMenu: function () {
        this.hide();
        //this.trigger.removeCls('expanded');
    },

    /**
     * Hides menu when you click anywhere on document.
     * Needs a reference so listener can easily be added and removed.
     * @private
     */
    handleDocClick: function (e, el) {
        this.hideMenu();
    }
});
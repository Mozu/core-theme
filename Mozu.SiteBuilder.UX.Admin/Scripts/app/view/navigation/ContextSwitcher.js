/**
 * @class Taco.view.navigation.ContextSwitcher
 * @author Jimmy Sanford
 * 
 */
Ext.define('Taco.view.navigation.ContextSwitcher', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'taco.contextswitcher',

    width: 250,
    editable: false,
    typeAhead: false,
    triggerAction: 'all',
    queryMode: 'local',
    valueField: 'urlToken',
    displayTpl: '<tpl for=".">{name}</tpl>',
    tpl: '<tpl for="."><div class="x-boundlist-item context-type-{contextType}">{name}</div></tpl>',

    initComponent: function () {
        this.applyDefaultCfg();

        this.callParent(arguments);

        this.on({
            change: this.changeContext,
            scope: this
        });

        this.mon(Taco.app.context, {
            contextchange: this.onGlobalContextChange,
            scope: this
        });

        this.mon(Taco.core.StateManager, {
            statechange: this.onGlobalStateChange,
            scope: this
        });
    },

    applyDefaultCfg: function () {
        this.cls = [this.cls, Taco.baseCSSPrefix + 'context-switcher'].join(' ');

        this.listConfig = Ext.applyIf(this.listConfig || {}, {
            shadow: false,
            cls: Taco.baseCSSPrefix + 'context-switcher-menu'
        });

        if (!this.store) {
            this.store = Taco.app.context.getStore();
            this.value = Taco.app.context.getCurrent().urlToken;
            console.log(this.value);

            // remove tenant level if single siteCollection
            if (!Taco.app.context.isMultiSiteCollection()) {
                this.store.filterBy(function (record) {
                    return record.get('contextType') != 't' ;
                });
            }
        }
    },

    changeContext: function (field, newValue, oldValue) {
        var record = field.getStore().getById(newValue);
        
        if (record) {
            Taco.app.context.setCurrentContext(record.raw);
        }
    },

    onGlobalContextChange: function (context) {
        this.setValue(context.urlToken);
        this.resetOriginalValue();
    },

    onGlobalStateChange: function (state) {
        var md = state.getMetaData && state.getMetaData();

        if (md && (md.controller =='sites' || md.action === "edit")) {
            this.disable();
        } else {
            this.enable();
        }
    }
});
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
    tpl: '<ul><tpl for="."><li role="option" class="x-boundlist-item context-type-{contextType}">{name}</li></tpl></ul>',

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

            // remove tenant level if single masterCatalog
            if (!Taco.app.context.isMultiMasterCatalog()) {
                this.store.filterBy(function (record) {
                    return record.get('contextType') != 't' ;
                });
            }
        }
    },

    changeContext: function (field, newValue, oldValue) {
        var record = field.getStore().getById(newValue);
        
        if (record) {
            var success = Taco.app.context.setCurrentContext(record.raw);

            if (!success) {
                field.reset();
            }
        }
    },

    onGlobalContextChange: function (context) {
        this.setValue(context.urlToken);
        this.resetOriginalValue();
    },

    onGlobalStateChange: function (state) {
        var md = state.getMetaData && state.getMetaData();

        if (md && (md.controller =='sites' || md.action === "edit") || md.action === "create") {
            this.disable();
        } else {
            this.enable();
        }
    }
});
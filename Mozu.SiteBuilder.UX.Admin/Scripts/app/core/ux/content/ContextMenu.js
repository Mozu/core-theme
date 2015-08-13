/**
 * Header portion, with title and dirtybutton, of a Taco.core.ux.content.Container.
 * @class Taco.core.ux.content.Header
 */

Ext.define('Taco.core.ux.content.ContextMenu', {
    extend: 'Ext.form.field.ComboBox',
    requires: [],
    alias: 'widget.taxo-contextMenu',
    valueField: 'urlToken',
    queryMode: 'local',
    forceSelection: true,
    minWidth: 150,
    growToLongestValue: false,
    matchFieldWidth: false,
    editable:false,
    maxWidth: 400,
    supportedLevels: [],
    defaultListConfig : {
        minWidth:300
    }, 
    listeners : {
        afterrender: function(){
            //override width of combobox if it's determined width is less than the max width
            var width = this.inputEl.getValue().length + this.getWidth();

            if (width < this.maxWidth) {
                this.setWidth(width);
            }
        }
    },
    initComponent: function () {
        var ctx = Taco.app.context,
            item,
            value;
        this.store = Taco.app.context.getStore(false);
        
        this.store.filter([
            {
                filterFn: function (item) {
                    return Ext.Array.contains(this.supportedLevels, item.get("contextType"));
                },
                scope: this
            }
        ]);
        
        item = this.store.findRecord('urlToken', ctx.getCurrent().urlToken);
        if (item) {
            value = item.getId();
        }

        if (!value && Ext.Array.contains(this.supportedLevels, 's')) {
            item = ctx.getSite();
            if (item) {
                value = item.urlToken;
            }
        }
        if (!value && Ext.Array.contains(this.supportedLevels, 'c')) {
            item = ctx.getCatalog();
            if (item) {
                value = item.urlToken;
            }
        }
        if (!value && Ext.Array.contains(this.supportedLevels, 'm')) {
            item = ctx.getMasterCatalog();
            if (item) {
                value = item.urlToken;
            }
        }
        if (!value) {
            value = ctx.urlToken;
        }
        


        this.setValue(value);
        
        
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
    
    changeContext: function (field, newValue, oldValue) {
        var record = field.getStore().getById(newValue);
        
        if (record) {

            Ext.defer(function () {
                var success = Taco.app.context.setCurrentContext(record.raw);

                if (!success) {
                    field.reset();
                }
            }, 1);
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
    },
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
        '<div class="x-boundlist-item">{contextType:this.toContextLable}: {name}</div>',
        '</tpl>',
         {
             contentTypes: {
                 t: {
                     label: 'Everything'
                 },
                 m: {
                     label: '&nbsp;Master Catalog'
                 },
                 c: {
                     label: '&nbsp;&nbsp;Catalog'
                 },
                 s: {
                     label: '&nbsp;&nbsp;&nbsp;Site'
                 }
             },

             toContextLable: function (value) {
                 return this.contentTypes[value].label;
             }
         }),

    
    // template for the content inside text field
    displayTpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">{name}</tpl>',
        {
            contentTypes: {
                t: {
                    label: 'Everything'
                },
                m: {
                    label: 'Master Catalog'
                },
                c: {
                    label: 'Catalog'
                },
                s: {
                    label: 'Site'
                }
            },

            toContextLable: function (value) {
                return this.contentTypes[value].label;
            }
        })
    

}
);
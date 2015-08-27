
// Overrride that optionaly adds an overlow enabled toolbar to the header which contains the configured tools;
/*
*   // Enables the header toolbar with all the default values;
*   headerToolbar :  true,

    // optionaly you can set a config which will override the default values;
*   headerToolbar : {
*        enableOverflow: false,
*        toolbarCls: "your-cls-here",
*        positionTools: "left",
*        defaults: {
*            margin:"0 0 0 4"
*        }
*    }
*   
*   Note: The items added to the tools collection will have a default ui of 'action', scale : "medium", and xtype of button.
*
*
*
*
*/

Ext.define('Taco.overrides.panel.Header', {
    override: 'Ext.panel.Header',    
    initComponent: function () {
        var me = this,
        cfg = (me.ownerCt && me.ownerCt.headerToolbar),
            enableToolsOverflow,
            positionTools,
            toolbarCls,
            defaults;

        if (cfg) {
            enableToolsOverflow = (cfg.enableOverflow)
            positionTools = (cfg.positionTools) ? cfg.positionTools : "right"  
            toolbarCls = (cfg.toolbarCls) ? cfg.toolbarCls : "taco-header-toolbar",
            defaults = (cfg.defaults) ? cfg.defaults : { margin:"0 0 0 4", ui:"action", scale:"medium"}

            // force the tools to right justify;
            if (positionTools == "right") {
                me.tools.unshift("->");
            }
            
            me.toolbar = Ext.create('Ext.toolbar.Toolbar', {
                xtype: "toolbar",
                cls: toolbarCls,
                defaults: defaults,
                margin: "0 0 0 10",
                flex: 1,
                enableOverflow: true,
                items: me.tools
            })

            // replace the tools collection with a flexed toolbar that includes the original tools collection;
            me.tools = [me.toolbar];
        }

        this.callParent(arguments)

        if (cfg) {
            // remove the flex from the title component so that it will autosize to content
            delete me.titleCmp.flex;
        }
    },

    // adds a component to the header toolbar if one is enabled;
    addToolbarItem: function (cmp, index) {
        var me = this,
        cfg = (me.ownerCt && me.ownerCt.headerToolbar)
        // if we have a header toolbar we need to insert any new tools into that toolbar not the header items;
        if (cfg) {
            if (index != undefined) {
                me.toolbar.insert(index,cmp);
            } else {
                me.toolbar.add(cmp);
            }
        } else {
            console.log("Note: 'headerToolbar' is not enabled; add headerToolbar:true to your panel to allow the adding of toolbar items")
        }
    }
});

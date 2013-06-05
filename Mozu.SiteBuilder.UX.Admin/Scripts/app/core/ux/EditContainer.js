/**
 * @class Taco.core.ux.EditContainer
 * @author Jimmy Sanford
 * 
 */
Ext.define('Taco.core.ux.EditContainer', {
    extend: 'Ext.container.Container',
    alias: 'widget.taco.editcontainer',

    componentCls: Taco.baseCSSPrefix + 'editcontainer',

    isEditContainer: true,

    initComponent: function () {
        var items = this.items || [],
            headerConfig = this.header || {},
            header;

        header = this.buildHeader(headerConfig);
        this.header = header;
        
        if (Ext.isArray(items)) {
            items.unshift(header);
        }

        this.callParent(arguments);
    },

    buildHeader: function (config) {
        var items = [],
            tools,
            actions,
            title,
            header;

        tools = Ext.create('Ext.container.Container', {
            itemId: 'tools',
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: this.tools || []
        });
        items.unshift(tools);

        actions = Ext.create('Ext.container.Container', {
            itemId: 'actions',
            hidden: true,
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: this.actions || []
        });
        items.unshift(actions);

        title = Ext.create('Ext.Component', {
            itemId: 'title',
            cls: this.componentCls + '-title',
            html: this.title || ' ',
            flex: 1
        });
        items.unshift(title);

        header = Ext.create(Ext.container.Container, {
            height: 50,
            border: '0 0 1',
            padding: '0 0 20',
            componentCls: this.componentCls + '-header',
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: items,
            tools: tools,
            actions: actions,
            title: title
        });

        delete this.tools;
        delete this.actions;
        delete this.title;

        return header;
    },

    toggleActions: function () {
        var tools = this.header.items.get('tools'),
            actions = this.header.items.get('actions');

        if (tools.isHidden()) {
            actions.hide();
            tools.show();
        } else {
            actions.show();
            tools.hide();
        }
    }
});
/**
 * @class Taco.core.ux.EditContainer
 * @author Jimmy Sanford
 * 
 */
Ext.define('Taco.core.ux.EditContainer', {
    extend: 'Ext.container.Container',
    alias: 'widget.taco.editcontainer',

    initComponent: function () {
        var dockedItems = this.dockedItems || [],
            headerConfig = this.header || {},
            header;

        header = this.buildHeader(headerConfig);
        dockedItems.unshift(this.header);

        this.dockedItems = dockedItems;

        this.callParent(arguments);
    },

    buildHeader: function (config) {
        var title = this.title,
            menu = this.menu,
            items = [],
            toolConfig = {},
            tool,
            actions,
            header;

        toolConfig = {
            itemId: 'tool',
            text: ' '
        };

        if (menu) {
            Ext.applyIf(menu, { plain: true, shadow: false });
            Ext.apply(toolConfig, { menu: menu });
        }

        tool = Ext.create('Ext.button.Button', toolConfig);
        items.push(tool);

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
            html: title || ' ',
            flex: 1
        });
        items.unshift(title);

        header = Ext.create(Ext.container.Container, {
            dock: 'top',
            weight: 100,
            height: 50,
            border: '0 0 1',
            padding: '0 0 20',
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: items
        });
    },

    toggleActions: function () {
        var tool = this.header.items.get('tool'),
            actions = this.header.items.get('actions');

        if (tool.isHidden()) {
            actions.hide();
            tool.show();
        } else {
            actions.show();
            tool.hide();
        }
    }
});
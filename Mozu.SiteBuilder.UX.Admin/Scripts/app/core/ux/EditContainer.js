/**
 * @class Taco.core.ux.EditContainer
 * @author Jimmy Sanford
 */
Ext.define('Taco.core.ux.EditContainer', {
    // extend: 'Ext.container.Container',
    extend: 'Ext.panel.Panel',
    alias: 'widget.taco-editcontainer',

    bodyPadding: '11 0 19',
    isEditContainer: true,
    ui: 'subform',

    config: {
        actions: []
    },

    initComponent: function () {
        var actionBar = Ext.create('Ext.container.Container', {
            itemId: 'actions',
            items: this.getActions()
        });

        this.callParent(arguments);

        this.on({
            boxready: {
                scope: this,
                fn: function () {
                    var header = this.getHeader();

                    header.insert(1, actionBar);
                }
            }
        });
    },

    toggleActions: function () {
        var header = this.getHeader(),
            tools = header.getTools(),
            actions = header.items.get('actions'),
            actionsAreHidden = actions.isHidden();

        actions[actionsAreHidden ? 'show' : 'hide']();

        Ext.Array.forEach(tools, function (tool) {
            tool[actionsAreHidden ? 'hide' : 'show']();
        }, this);
    }
});
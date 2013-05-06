/**
 * Header portion, with title and dirtybutton, of a Taco.core.ux.content.Container.
 * @class Taco.core.ux.content.Header
 */

Ext.define('Taco.core.ux.content.Header', {
    extend: 'Ext.container.Container',
    requires: ['Taco.core.ux.action.SecondaryButton', 'Taco.core.ux.action.PrimaryButton'],
    alias: 'widget.contentheader',
    cls: 'taco-content-header',

    title: 'Header Title',

    instructionText: null,
    hideActions: false,

    initComponent: function () {

        this.items = [{
            xtype: 'container',
            flex: 1,
            itemId:'titleContainer',
            layout: 'auto',
            items: [{
                xtype: 'component',
                autoEl: 'h1',
                html: this.title,
                itemId:'title'
            }, {
                xtype: 'component',
                autoEl: 'p',
                html: this.instructionText,
                itemId: 'instruction'
            }]
        }, {
            xtype: 'container',
            cls: Taco.baseCSSPrefix + "actions",
            itemId: 'actionsContainer',
            items: this.actions,
            hidden: this.hideActions,
            layout: 'auto'
        }];

        this.callParent(arguments);

        this.title = this.down('#title');

        this.instruction = this.down('#instruction');

        this.titleContainer = this.down('#titleContainer');

        this.actionsContainer = this.down('#actionsContainer');

        
    },

    getActions: function () {
        return this.actionsContainer;
    },

    setTitle: function (title) {
        this.title.update(title);
    }
});
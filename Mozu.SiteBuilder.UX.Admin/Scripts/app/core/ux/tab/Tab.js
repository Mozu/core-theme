/**
 * @class Taco.core.ux.tab.Tab
 * @author Jimmy Sanford
 * @author Michael Speed Elder
 * 
 */
Ext.define('Taco.core.ux.tab.Tab', {
    extend: 'Ext.Component',
    alias: 'widget.formtab',

    componentCls: Taco.baseCSSPrefix + 'form-tab',

    activeCls: Taco.baseCSSPrefix + 'form-tab-active',
    card: undefined,
    invalidCls: Taco.baseCSSPrefix + 'form-tab-invalid',
    text: '',

    initComponent: function () {
        //TODO: Fix the horse shit below
        var closeButton = '<span class="' + Taco.baseCSSPrefix + 'form-tab-close-button">&times;</span>' + '<span class="' + Taco.baseCSSPrefix + 'override-indicator"></span>';

        Ext.applyIf(this, {
            html: this.text + (this.tabPickerId ? closeButton : '')
        });

        this.enableBubble('tabclose');

        this.callParent(arguments);

        this.on({
            click: {
                element: 'el',
                fn: this.tabClicked
            },
            scope: this
        });
    },

    /**
     * @private
     * @param {Ext.EventObject} evt The Ext event object.
     * @param {HTMLElement} htmlEl The DOM element clicked on.
     *
     * Controls the action of a tab click depending on the target element.  E.g. clicking on the close button will have a different affect that clicking on the tab text.
     */
    tabClicked: function (evt, htmlEl) {
        // *** Determine if clicked element was the close button, respond accordingly
        if( Ext.fly( htmlEl ).hasCls(Taco.baseCSSPrefix + 'form-tab-close-button') ) {
            this.closeTab();
        }

        // *** Otherwise set this tab as active
        else {
            this.setActive();
        }
    },

    /**
     * @private
     * Sets this tab as the active tab in the form
     */
    setActive: function () {
        var card = this.card,
            panel = card.ownerCt;

        panel.setActiveItem(card);
    },

    /**
     * @private
     * Fires a formTabCountChange event to be handled by a parent container.  This event should ultimately trigger the removal of this tab.  The siteId associated with this tab is sent as well.
     */
    closeTab: function () {
        this.fireEvent('tabclose', this, this.tabPickerId);
    }
});
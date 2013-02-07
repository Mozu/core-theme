/**
 * @class Taco.view.navigation.ContextSwitcher
 * @author Jimmy Sanford
 * @author Michael Speed Elder
 * 
 */
Ext.define('Taco.view.navigation.ContextSwitcher', {
    extend: 'Ext.container.Container',
    requires: ['Taco.view.navigation.ContextSwitcherView'],

    componentCls: Taco.baseCSSPrefix + 'context-switcher',

    width: 250, // TODO: Width needs to be set to be pushed right in an Hbox.  This is shitty, and it makes me angry, and I don't know how to fix it.

    initComponent: function () {
        this.label = Ext.create('Ext.container.Container', {
            autoEl: {
                tag: 'div',
                cls: Taco.baseCSSPrefix + 'context-switcher-trigger',
                html: 'Context Switcher 9000 <span>&#9662;</span>' // &#9660 (larger triangle)
            }
        });

        this.list = Ext.create('Taco.view.navigation.ContextSwitcherView');

        this.items = [
            this.label,
            this.list
        ];

        this.callParent( arguments );

        this.on({
            afterrender: function () {
                // *** Set ContextSwitcher display label to current context
                if( Taco.core.StateManager ) {
                    this.mon(
                        Taco.core.StateManager,
                        'statechange',
                        function () {
                            this.setDisplayedValue( this.lookupContextNameFromToken( Taco.app.context.getCurrentContext().urlToken ) );
                        },
                        this
                    );
                }

                // *** Register click handler to show/hide submenu (ContextSwitcherView)
                this.getEl().on('click', this.toggleSubmenu, this);
            },
            contextClicked: this.changeContext,
            scope: this
        });
    },

    /**
     * @private
     * @param {Ext.data.Model} record An instance of the model associated with the context clicked on.
     * @param {String} newValue The innerText of the element clicked on.
     *
     * Event listener for when an item from the submenu is selected.
     */
    changeContext: function (record, newValue) {
        Taco.app.context.setCurrentContext( record.raw );
        this.toggleSubmenu();
        this.setDisplayedValue( newValue );
    },

    /**
     * @private
     * Handles toggling visiblity of the "submenu" (ContextSwitcherView) of available contexts.
     */
    toggleSubmenu: function () {
        var list = this.list;

        if( !list.isVisible() ) {
            this.label.addCls('showing-list');
            list.showBy( this, 'tr-br', [-50, 0] );
        } else {
            this.label.removeCls('showing-list');
            list.hide();
        }
    },

    /**
     * @public
     * @param {String} newVal A string to replace the content of the ContextSwitcher label
     */
    setDisplayedValue: function ( newVal ) {
        this.label.update( newVal + '<span>&#9662;</span>' );
    },

    /**
     * @private
     * @param {String} urlContext The portion of the url that is the context, typically as specified by Taco.app.context.urlToken
     *
     * Retrieves the plaintext name associated with the given urlContext.
     */
    lookupContextNameFromToken: function ( urlContext ) {
        // *** urlContext takes the form of *:######, where * is 't', 'c', or 's' for Tenant, SiteCollection, or Site respectively.
        var contextType     = urlContext.split(':')[0],
            siteCollections = Taco.app.context.siteCollections,
            displayName     = 'All', // *** Default to 'All' (context is likely t:Id)

            // *** Callback function for Ext.each loops below that tests the current item's urlToken against the argued parameter urlContext
            testItemNameAgainstContext = function ( item ) {
                if( item.urlToken == urlContext ) {
                    displayName = item.name;
                    return false;
                }
            };

        // *** Site
        if( contextType == 's' ) {
            Ext.each( siteCollections, function ( collection ) {
                // *** Return early if inner Ext.each returns early as well
                if( Ext.each(collection.sites, testItemNameAgainstContext) !== true ) {
                    return false;
                }
            })
        }

        // *** SiteCollection
        else if( contextType == 'c' ) {
            Ext.each( siteCollections, testItemNameAgainstContext );
        }

        return displayName;
    }
});
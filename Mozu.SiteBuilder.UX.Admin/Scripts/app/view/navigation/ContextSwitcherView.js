/**
 * @class Taco.view.navigation.ContextSwitcherView,
 * @author Jimmy Sanford
 * @author Michael Speed Elder
 * 
 */
Ext.define('Taco.view.navigation.ContextSwitcherView', {
    extend: 'Ext.view.View',

    floating: true,
    shadow: false,
    hideMode: 'offsets',
    defaultAlign: 'tr-br',
    y: -1000, // *** Initially position off top of screen
    // TODO: Get this to render off screen AND consider itself hidden.  Click toggle on trigger takes one extra click initially to get the state right.

    autoEl: {
        tag: 'ul',
        cls: Taco.baseCSSPrefix + 'context-switcher-list'
    },
    itemSelector:    'li.' + Taco.baseCSSPrefix + 'menu-item',
    // overItemCls:     Taco.baseCSSPrefix + 'menu-item-hover',
    // selectedItemCls: Taco.baseCSSPrefix + 'menu-item-active',

    initComponent: function () {
        this.store = Taco.app.context.getStore();
        
        // TODO: Call addEvents() for 'contextClicked'?
        this.tpl = [
           '<tpl for=".">',
               '{% values.collectionClass = values.contextType == "c" ? "taco-context-collection" : "" %}',
               '{% values.containerClass = values.contextType != "s" ? "taco-context-container" : "" %}',
               '<li class="taco-menu-item {containerClass} {collectionClass}">',
                   '{name}',
               '</li>',
               '</tpl>'
        ];
        
        if (!Taco.app.context.isMultiMasterCatalog()) {
       
       
            //remove tenant level if single masterCatalog
            this.store = Taco.app.context.getStore(true);
            this.store.filterBy(function (record) {
                return record.get('contextType') != 't' ;
            });
           
        
        }

        this.enableBubble('contextClicked');

        this.callParent( arguments );

        this.show();
        this.hide();

        this.on('itemclick', this.contextClicked, this);
    },

    /**
     * @private
     * @param {Ext.view.View} view
     * @param {Ext.data.Model} record The record associated with the item clicked on.
     * @param {HTMLElement} item The HTMLElement clicked on.
     *
     * Fires a 'contextClicked' event with salient parameters.
     */
    contextClicked: function (view, record, item) {
        this.fireEvent('contextClicked', record, item.innerText);
    }
});
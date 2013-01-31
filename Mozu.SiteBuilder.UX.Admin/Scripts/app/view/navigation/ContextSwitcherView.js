/**
 * @class Taco.view.navigation.ContextSwitcherView,
 * @author Jimmy Sanford, Michael Speed Elder
 * 
 */
Ext.define('Taco.view.navigation.ContextSwitcherView', {
    extend: 'Ext.view.View',

    floating: true,
    autoShow: true,
    // hidden: true,
    plain: true,
    shadow: false,
    hideMode: 'offsets',
    defaultAlign: 'tr-br',
    y: -1000,
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
                    '{% console.log(values) %}',
                    '{name}',
                '</li>',
            '</tpl>'
        ];

        this.callParent( arguments );

        this.enableBubble('contextClicked');
        this.on('itemclick', this.contextClicked, this);
    },

    contextClicked: function (view, record, item) {
        this.fireEvent('contextClicked', record, item.innerText);
    }
});
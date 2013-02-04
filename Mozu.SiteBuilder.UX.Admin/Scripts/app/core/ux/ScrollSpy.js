/**
 * @class Taco.core.ux.ScrollSpy
 * @author James Zetlen
 * A mixin to add scroll spying to a given container.
 * As this container's child items scroll into view, it'll fire `scrollspy` events.
 * Based on Twitter Bootstrap scrollspy.
 */

Ext.define('Taco.core.ux.ScrollSpy', {

    /**
     * @cfg scrollSpyOffset
     * Vertical pixel offset to adjust when scrollspy events fire.
     */
    scrollSpyOffset: 20,

    /**
     * Recalculates offsets of child items.
     * To be called whenever the dimensions of this container's child items change. This includes expanding, collapsing, or adding elements.
     */
    refreshScrollSpyOffsets: function () {
        var me = this;
        this.offsets = [];
        var scrollOffset = this.scrollingContainer.getScroll().top;
        this.items.each(function (item) {
            me.offsets.push(item.getPosition()[1] + scrollOffset);
        });
    },
    
    /**
     * @private
     */
    onSpiedScroll: function() {
        var newTarget,
            currentTarget = this.currentScrollSpyTarget;
        var scrollOffset = this.scrollingContainer.getScroll().top + this.scrollSpyOffset;
        var maxScrollHeight = this.scrollingContainer.getAttribute('scrollHeight') - this.scrollingContainer.getComputedHeight();
        var i;
        var offsets = this.offsets;
        if (scrollOffset >= maxScrollHeight) { // always last one in the list
            newTarget = this.items.last();
        } else {

            for (i = offsets.length; i >= 0; i--) {
                if (scrollOffset >= offsets[i] && (!offsets[i + 1] || scrollOffset <= offsets[i + 1])) {
                    newTarget = this.items.get(i);
                    break;
                }
            }
        }

        if (newTarget && newTarget != currentTarget) {
            this.currentScrollSpyTarget = newTarget;
            this.fireEvent('scrollspy', newTarget, currentTarget);
        }

    },

    /**
     * @private
     */
    initScrollSpy: function () {
        var scrollingContainer = this.scrollingContainer;
        if (!scrollingContainer) {

            // first try config
            if (this.scrollspyContainerSelector) scrollingContainer = Ext.select(this.scrollspyContainerSelector).first();

            // then try self
            var containerEl = this.getEl();
            if (!scrollingContainer && containerEl.isScrollable()) scrollingContainer = containerEl;

            // next try this.body, if this is a panel
            if (!scrollingContainer && this.body && this.body.isScrollable && this.body.isScrollable()) scrollingContainer = this.body;

            // if not, then search up for a scrollable;
            if (!scrollingContainer) {
                var scrollingParent = this.findParentBy(function (p) {
                    return p.getEl().isScrollable();
                });
                if (containerEl) scrollingContainer = scrollingParent.getEl();
            }

            // last resort, just use doc body
            if (!scrollingContainer) scrollingContainer = Ext.getBody();
        }
        this.scrollingContainer = scrollingContainer;
        this.refreshScrollSpyOffsets();
        this.mon(scrollingContainer, 'scroll', this.onSpiedScroll, this);
        this.onSpiedScroll();
    },
        

    constructor: function () {
        this.callParent(arguments);
        this.addEvents(
            /**
             * @event scrollspy
             * Fires when the spied-on container has scrolled enough that the active item has changed.
             * @param {Ext.Component} newTarget The newly active item.
             * @param {Ext.Component} oldTarget The newly inactive item.
             */
             'scrollspy'
        );
        this.on('boxready', this.initScrollSpy, this);
    }

});
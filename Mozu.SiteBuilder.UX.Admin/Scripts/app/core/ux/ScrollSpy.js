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
        var i,
            newTarget,
            currentTarget = this.currentScrollSpyTarget;
        var scrollingContainer = this.scrollingContainer;
        var scrollOffset = scrollingContainer.getScroll().top + this.scrollSpyOffset;
        var maxScrollHeight = scrollingContainer.getAttribute('scrollHeight') - scrollingContainer.getComputedHeight();
        var offsets = this.offsets;

        // *** .getComputedHeight does not seem to account for top or bottom padding (even when set through javascript)
        maxScrollHeight += parseInt(scrollingContainer.getStyle('padding-top')) + parseInt(scrollingContainer.getStyle('padding-bottom'));

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
        this.scrollingContainer = getScrollingContainer.call( this, this.scrollingContainer );
        this.refreshScrollSpyOffsets();
        this.mon(this.scrollingContainer, 'scroll', this.onSpiedScroll, this);
        this.onSpiedScroll();

        /**
         * @private
         * @param scrollingContainer
         */
        function getScrollingContainer ( scrollingContainer ) {
            if( scrollingContainer ) {
                return scrollingContainer;
            }
            else {
                // first try config
                if (this.scrollspyContainerSelector) {
                    return Ext.select(this.scrollspyContainerSelector).first();
                }

                // then try self
                var containerEl = this.getEl();
                if (containerEl.isScrollable()) {
                    return containerEl;
                }

                // next try this.body, if this is a panel
                if (this.body && this.body.isScrollable && this.body.isScrollable()) {
                    return this.body;
                }

                // if not, then search up for a scrollable;
                var scrollingParent = this.findParentBy(function (p) {
                    return p.getEl().isScrollable();
                });
                if (containerEl && scrollingParent) {
                    return scrollingParent.getEl();
                }

                // last resort, just use doc body
                return Ext.getBody();
            }
        }
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
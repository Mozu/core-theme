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
    scrollSpyOffset: 10,

    /**
     * Recalculates offsets of child items.
     * To be called whenever the dimensions of this container's child items change. This includes expanding, collapsing, or adding elements.
     */
    refreshScrollSpyOffsets: function () {
        var me = this;
        this.offsets = [];
        var scrollOffset = this.scrollingContainer.getScroll().top;
        this.items.each(function (item) {
            me.offsets.push(item.getEl().getPosition().top + scrollOffset);
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
        if (scrollOffset >= maxScrollHeight) { // always last one in the list
            newTarget = this.items.last();
        } else {

            for (i = this.offsets.length; i >= 0; i++) {
                if (scrollOffset >= this.offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1])) {
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
        var containerEl = this.getEl();
        var scrollingContainer = this.scrollingContainer = containerEl.isScrollable() ?  containerEl :
            this.findParentBy(function (p) {
                return p.getEl().isScrollable();
            }).getEl();
        this.refreshScrollSpyOffsets();
        this.mon(scrollingContainer, 'scroll', this.onSpiedScroll, this);
        this.onSpiedScroll();
    }

});
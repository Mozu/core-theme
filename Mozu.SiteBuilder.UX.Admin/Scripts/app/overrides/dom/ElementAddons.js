/**
 * @class  Taco.overrides.data.AbstractStore
 * @author Simeon Kessler
 * @description Overrides Ext.dom.Element
 *
 * Tells you whether your element is partially hidden within a scrollable container;
 * Typically used to avoid calling element.scrollIntoView() when the element isn't hidden.
 */
Ext.define('Taco.overrides.dom.ElementAddons', {
    override: 'Ext.dom.Element',
    isHiddenByScroll: function (container) {
        var me = this,
            isHidden = false,
            dom = me.dom,
            offsets = me.getOffsetsTo(container = Ext.getDom(container) || Ext.getBody().dom),
        // el's box
            left = offsets[0] + container.scrollLeft,
            top = offsets[1] + container.scrollTop,
            bottom = top + dom.offsetHeight,
            right = left + dom.offsetWidth,
        // ct's box
            ctClientHeight = container.clientHeight,
            ctScrollTop = parseInt(container.scrollTop, 10),
            ctScrollLeft = parseInt(container.scrollLeft, 10),
            ctBottom = ctScrollTop + ctClientHeight,
            ctRight = ctScrollLeft + container.clientWidth,
            newPos;
        if (dom.offsetHeight > ctClientHeight || top < ctScrollTop) {
            newPos = top;
        } else if (bottom > ctBottom) {
            newPos = bottom - ctClientHeight;
        }
        return newPos
    }
});
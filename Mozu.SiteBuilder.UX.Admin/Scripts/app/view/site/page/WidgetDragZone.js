/**
 * @author Travis Johnson
 * @class Taco.view.site.page.WidgetDragZone
 */


Ext.define('Taco.view.site.page.WidgetDragZone', {
    extend: 'Ext.dd.DragZone',

    ddGroup: 'taco-widget-create',
    selector: '',

    getDragData: function (e) {
        var sourceEl = e.getTarget(this.selector, 10),
            record,
            d;

        if (!sourceEl) {
            return;
        }
        record = this.view.getRecord(sourceEl);
        if (!record) {
            return;
        }

        d = sourceEl.cloneNode(true);
        d.id = Ext.id();
        Ext.fly(d).addCls('widget-source');
        return {
            sourceEl: sourceEl,
            repairXY: Ext.fly(sourceEl).getXY(),
            ddel: d,
            widgetDefinition: record.data
        };
    },

    getRepairXY: function () {
        return this.dragData.repairXY;
    },

    onStartDrag: function (x, y) {
        this.proxy.ghost.setStyle({
            backgroundColor: 'transparent',
            border: '0 none',
            padding: 0
        });
    }
});
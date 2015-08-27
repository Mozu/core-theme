/**
 * @class Taco.core.ux.DragSource
 * Overrides Ext.dd.DragSource.
 */
Ext.define('Taco.core.ux.DragSource', {
    override: 'Ext.dd.DragSource',

    constructor: function (el, config) {
        this.el = Ext.get(el);
        if(!this.dragData){
            this.dragData = {};
        }

        Ext.apply(this, config);

        if(!this.proxy){
            this.proxy = new Ext.dd.StatusProxy({
                id: this.el.id + '-drag-status-proxy',
                animRepair: this.animRepair,
                defaultAlign: 'tr-br?'
            });
        }
        this.callParent([this.el.dom, this.ddGroup || this.group,
              {dragElId : this.proxy.id, resizeFrame: false, isTarget: false, scroll: this.scroll === true}]);

        this.dragging = false;
    }
});
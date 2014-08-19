/**
 * @class Taco.view.order.subform.Subform
 * @author Jimmy Sanford
 * 
 */
Ext.define('Taco.view.order.subform.Subform', {
    extend: 'Taco.core.ux.EditContainer',
    alias: 'widget.taco-order-subform',
    cls: Taco.baseCSSPrefix + 'order-subform',
    setHeaderTitle: function(status) {
        var header = this.getHeader();
        if (header) {
            header.setTitle(status);
        } else {
            this.on('afterrender', function() {
                this.setHeaderTitle(status);
            }, this, { single: true });
        }

    }
});
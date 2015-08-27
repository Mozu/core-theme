/**
 * @class Taco.core.ux.TextFilter
 */
Ext.define('Taco.core.ux.TextFilter', {
    extend: 'Ext.form.field.Text',
    requires: ['Ext.util.Filter'],
    alias: 'widget.textfilter',
    delay: 250,
    minChars: 3,
    param: '',
    enableKeyEvents: true,
    initComponent: function () {
        this.callParent(arguments);
        this.mon(this, 'keyup', this.onKeyUp, this);
    },
    delayUtil: new Ext.util.DelayedTask(),
    delaytask: function () {
        if (!this.store) {
            this.store = this.findParentBy(function (a) {
                return "store" in a;
            }).store;
        }

        var val = this.getValue();
        if (val.length == 0) {
            this.store.filters.removeAtKey(this.id);
            this.store.load();
            return;
        }
        if (val.length >= this.minChars) {

            this.store.filters.add(this.id, Ext.create('Ext.util.Filter', {
                anyMatch: true,
                property: this.param,
                value: this.getValue()
            }));

            this.store.load();
            return;
        }
    },
    onKeyUp: function () {
        this.delayUtil.delay(this.delay, this.delaytask, this);
    }
});
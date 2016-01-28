// Setting useMsg to false.

Ext.define('Taco.overrides.SplitButton', {
    override: 'Ext.button.Split',

    initComponent: function () {
        this.cls += ' taco-splitbutton';

        this.callParent(arguments);

        this.on({
            mousemove: this.determineHoverTarget,
            element: 'el',
            scope: this
        });
    },

    determineHoverTarget: function (e) {
        var pointerX = e.getPoint().left,
            buttonLeft = this.getPosition()[0],
            buttonWidth = this.getWidth(),
            triggerWidth = 31,
            el = this.getEl();

        if (pointerX > buttonLeft + buttonWidth - triggerWidth) {
            el.addCls('taco-over-trigger');
            el.removeCls('taco-over-button');
        } else {
            el.addCls('taco-over-button');
            el.removeCls('taco-over-trigger');
        }
    }
});
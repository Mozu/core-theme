/**
 * @class Taco.core.ux.action.DirtyButton
 * The dirty button in the upper right of editors.
 */

Ext.define('Taco.core.ux.action.DirtyButton', {
    extend: 'Taco.core.ux.action.PrimaryButton',
    alias: 'widget.dirtybutton',
    dirtyState: false,

    initComponent: function () {
        this.callParent(arguments);

        this.on({
            click: function (button, e) {
                this.setLoading(true, e);
            },
            beforeclick: function () {
                return !this.isLoading;
            },
            scope: this
        });
    },

    afterRender: function () {
        this.callParent(arguments);

        if (!this.dirtyState) {
            this.disable();
        }
    },

    isDirty: function () {
        return this.dirtyState;
    },

    setDirty: function (dirty) {
        
        if (this.dirtyState === dirty) {
            return;
        }

        this.setLoading(false);

        this.dirtyState = dirty;

        
        if (dirty) {
            this.enable();
        } else {
            this.disable();
        }
    },

    disable: function () {
        var el = this.rendered ? this.el : this.protoEl;
        if (el) {
            el.set({
                disabled: 'disabled'
            });
        }
    },

    enable: function () {
        var el = this.rendered ? this.el : this.protoEl;
        if (el) {
            this.el.set({
                disabled: null
            }, false);
        }
    },

    setLoading: function (load, e) {
        var el = this.rendered ? this.el : this.protoEl;
        
        if (!el) {
            return;
        }
        
        if (load === false) {
            this.isLoading = false;
            this.removeCls('loading');
            return;
        }

        this.isLoading = true;
        this.addCls('loading');
    }
});
Ext.define('Taco.overrides.form.Basic', {
    override: 'Ext.form.Basic',

    requireDirty: false,

    checkDirty: function () {
        var dirty = this.isDirty();

        if (dirty !== this.wasDirty) {
            this.checkValidityDelay();
            this.fireEvent('dirtychange', this, dirty);
            this.wasDirty = dirty;
        }
    },

    checkValidity: function () {
        var me = this,
            valid;

        if (me.requireDirty) {
            valid = !me.hasInvalidField() && me.isDirty();
        } else {
            valid = !me.hasInvalidField();
        }

        if (valid !== me.wasValid) {
            me.onValidityChange(valid);
            me.fireEvent('validitychange', me, valid);
            me.wasValid = valid;
        }
    },

    initialize: function () {
        this.initialized = true;

        if (this.requireDirty) {
            this.onValidityChange(!this.hasInvalidField() && this.isDirty());
        } else {
            this.onValidityChange(!this.hasInvalidField());
        }
    }
});

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

            Ext.defer(function () {
                me.onValidityChange(valid);
            }, 10, me)
            
            me.fireEvent('validitychange', me, valid);
            me.wasValid = valid;
        }

        me.wasValid = valid;

    },

    initialize: function () {
        this.initialized = true;

        if (this.requireDirty) {
            this.onValidityChange(!this.hasInvalidField() && this.isDirty());
        } else {
            this.onValidityChange(!this.hasInvalidField());
        }
    },
    
    getValues: function (asString, dirtyOnly, includeEmptyText, useDataValues) {
        //changing default of useDataValues to true
        var args = Ext.Array.clone(arguments);
        while (args.length < 4) {
            args.push(undefined);
        }
        args[3] = args[3] === false ? false : true;
        return this.callParent(args);
    }
});

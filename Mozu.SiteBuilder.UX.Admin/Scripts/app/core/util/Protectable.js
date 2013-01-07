/**
 * @class Taco.core.util.Protectable
 * Mixin for views that adds methods for preventing ViewLauncher from dismissing or destroying the view. 
 *
 * ??ORPHAN??
 * 
 */

Ext.define('Taco.core.util.Protectable', {

    addProtectedView: function (view) {
        if (!this.protectectViews) {
            this.clearProtectedViews();
        }
        this.protectedViews.push(view);
    },

    clearProtectedViews: function () {
        this.protectedViews = [];
    },

    removeProtectedView: function (view) {
        var me = this;

        Ext.each(me.protectedViews, function (protectedView, index) {
            if (view === protectedView) {
                me.protectedViews.splice(index, 1);
                return false;
            }
        });
    },

    preventDestroy: function () {
        var me = this,
            result = false;

        if (!me.ignorePreventDestroy && typeof me.onPreventDestroy === 'function' && me.onPreventDestroy()) {
            return me;
        }

        Ext.each(me.protectedViews, function (view) {
            var stopView;

            if (view && typeof view.preventDestroy === 'function') {
                stopView = view.preventDestroy();
                if (stopView) {
                    result = stopView;
                    return false;
                }
            }
        });

        return result;
    },

    setQueuedAction: function (fn) {
        this.queuedAction = fn;
    },

    getQueuedAction: function (fn) {
        return this.queuedAction;
    },

    executeQueuedAction: function () {
        this.ignorePreventDestroy = true;
        if (typeof this.queuedAction === 'function') {
            this.queuedAction();
        }
    }
});

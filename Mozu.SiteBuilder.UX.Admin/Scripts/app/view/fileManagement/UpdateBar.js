/**
 * @class Taco.view.fileManagement.UpdateBar
 */
Ext.define('Taco.view.fileManagement.UpdateBar', {
    extend: 'Ext.ProgressBar',
    animate: true,
    initComponent: function () {
        var me = this,
            ur = Taco.core.util.UploadManager.uploadRequests.findBy(function (e) {
                return e.document && e.document.getId() && e.document.getId() == me.document.getId();
            });
        if (ur) {
            if (ur.lastEvent && ur.lastEvent.percentUploaded) {
                me.value = ur.lastEvent.percentUploaded * 0.2;
            }
            if (ur.completed) {
                me.hidden = true;
            }
        } else {
            me.value = 0;
        }
        this.callParent(arguments);
        me.mon(Taco.core.util.UploadManager, 'progress', function (e) {
            if (e.document && e.document.getId() && e.document.getId() == me.document.getId()) {
                me.updateProgress(e.percentUploaded * 0.2);
            }
        });
        me.mon(Taco.core.util.UploadManager, 'complete', function (e) {
            if (e.document && e.document.getId() && e.document.getId() == me.document.getId()) {
                me.updateProgress(1);
                me.getEl().fadeOut({
                    duration: 1000
                });
            }
        });
    }
});
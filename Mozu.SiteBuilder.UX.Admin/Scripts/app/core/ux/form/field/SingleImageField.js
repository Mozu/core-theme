/**
 * @class Taco.core.ux.form.field.SingleImageField
 * @author Jimmy Sanford
 */

Ext.define('Taco.core.ux.form.field.SingleImageField', {
    extend: 'Ext.view.View',
    alias: 'widget.taco-singleimagefield',
    mixins: {
        uploadable: 'Taco.shared.util.Uploadable'
    },
    requires: [
        'Taco.core.util.UploadManager'
    ],

    cls: 'taco-image-dropzone',
    deferEmptyText: false,
    emptyText: 'Drag and drop an image here',
    itemSelector: 'div.thumb',

    tpl: [
        '<tpl for=".">',
            '<div class="thumb" style="background-image: url(\'{url}\');">',
                '<div class="controls"><span class="remove"></span></div>',
            '</div>',
        '</tpl>'
    ],

    initComponent: function () {
        this.callParent(arguments);

        this.on({
            itemclick: {
                scope: this,
                fn: function (view, record, item, index, e) {
                    if (e.getTarget('span.remove', 10)) {
                        this.store.remove(record);
                    }
                }
            },
            dragenter: {
                scope: this,
                element: 'el',
                fn: 'handleDragEnter'
            },
            dragleave: {
                scope: this,
                element: 'el',
                fn: 'handleDragLeave'
            },
            drop: {
                scope: this,
                element: 'el',
                fn: 'handleDrop'
            },
            existingfile: {
                scope: this,
                fn: 'onExistingFile'
            },
            filedrop: {
                scope: this,
                fn: 'onUploadFile'
            }
        });

        this.appListeners = this.mon(Taco.app, {
            destroyable: true,
            dragenter: {
                scope: this,
                element: 'el',
                fn: 'manageDragEnter'
            },
            dragleave: {
                scope: this,
                element: 'el',
                fn: 'manageDragLeave'
            }
        });

        this.mixinListeners = this.mon(Taco.core.util.UploadManager, {
            destroyable: true,
            complete: {
                scope: this,
                fn: 'onCompleteUpload'
            }
        });
    },

    handleDragEnter: function () {
        this.addCls('drag-over');
        Taco.app.DragDropZone.allowDrop();
    },

    handleDragLeave: function (e, el) {
        this.removeCls('drag-over');
        Taco.app.DragDropZone.disallowDrop();
    },

    handleDrop: function (e, el) {
        var files = e.browserEvent.dataTransfer.files;

        e.stopPropagation();
        e.preventDefault();

        this.fireEvent('filedrop', files, e);
        this.handleDragLeave(e, el);
        this.removeCls('drag-and-drop-active');
    },

    manageDragEnter: function (e, el) {
        this.addCls('drag-and-drop-active');
    },

    manageDragLeave: function (e, el) {
        this.removeCls('drag-and-drop-active');
    },

    onCompleteUpload: function (file) {
        this.refresh();
    },

    onExistingFile: function (files) {
        this.store.add((Ext.isArray(files) && files.length > 1) ? files[0] : files);
    },

    /**
     * Cleanup
     *
     * @private
     */
    beforeDestroy: function () {
        Ext.destroy(this.appListeners, this.mixinListeners);
    }
});

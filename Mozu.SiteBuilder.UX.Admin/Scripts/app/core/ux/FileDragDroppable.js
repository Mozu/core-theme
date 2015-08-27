/**
 * @class Taco.core.ux.FileDragDroppable
 */
Ext.define('Taco.core.ux.FileDragDroppable', {

    init: function (config) {
        var me = this;
        me.addEvents('filedrop');
        me.on({
            dragenter: {
                element: 'el',
                fn: function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            },
            dragover: {
                element: 'el',
                fn: function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            },
            dragleave: {
                element: 'el',
                fn: function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            },
            drop: {
                element: 'el',
                fn: function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var files = e.browserEvent.dataTransfer.files;
                    me.fireEvent("filedrop", files, e);
                }
            }
        });
    }


});
/**
* @class Taco.core.ux.DragDropZone
* The drag and drop zone
* @extends Ext.form.Panel
*/

    Ext.define('Taco.core.ux.DragDropZone', {
        extend: 'Ext.container.Container',
        alias: 'widget.dragdropzone',
        cls: 'taco-image-square',
        border: true,
        entityId: null,
        tpl: "<img src = '{src}'   style='max-height:118px;max-width:155px' />",
        header: '',
        mixins: {
            field: 'Ext.form.field.Field'
        },

        data:{src:'/admin/Scripts/resources/images/legacy/AddPhotos.png'},

        statics: {
            initDocumentListeners: function (app) {
                var interval,
                    isOver = false,
                    fnCheckDropAllowances;

                this.disallowDrop();

                app.addEvents([
                    'dragenter',
                    'dragleave',
                    'dragover',
                    'drop'
                ]);

                Ext.getDoc().on({
                    dragenter: function (e) {
                        fnCheckDropAllowances.call(this, e);
                    },
                    dragleave: function (e) {
                        fnCheckDropAllowances.call(this, e);
                    },
                    dragover: function (e) {
                        fnCheckDropAllowances.call(this, e);
                        e.stopPropagation();
                        e.preventDefault();

                        window.clearInterval(interval);

                        app.fireEvent('dragover', e);

                        interval = window.setInterval(function () {
                            isOver = false;
                            window.clearInterval(interval);

                            app.fireEvent('dragleave', e);
                            console.log('stopfiledrag');
                        }, 150);

                        if (!isOver) {
                            isOver = true;
                            app.fireEvent('dragenter', e);

                            console.log('startfiledrag');
                        }

                    },
                    drop: function (e) {
                        fnCheckDropAllowances.call(this, e);
                        e.stopPropagation();
                        e.preventDefault();
                        app.fireEvent('drop')
                    },
                    scope: this
                });

                fnCheckDropAllowances = function (e) {
                    if (this._allowDrop) {
                        return;
                    }
                    e.browserEvent.dataTransfer.dropEffect = 'move';
                    e.browserEvent.dataTransfer.effectAllowed = 'none';
                };
            },
            allowDrop: function () {
                this._allowDrop = true;
            },
            disallowDrop: function () {
                this._allowDrop = false;
            }
        },

        initComponent: function () {
            var me = this;

            me.addEvents('filedrop');

            this.callParent(arguments);

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
                        me.fireEvent("filedrop", files);
                    }
                }
            });
        },

        setValue: function (value) {
            var me = this;
            if ( value && value.length >0 )
            {
                this.update({src: value[0].imagePath });
            }
            
            //me.setRawValue(me.valueToRaw(value));
            return me.mixins.field.setValue.call(me, value);
        }
    });

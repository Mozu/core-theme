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
        data:{src:'/admin/Scripts/resources/images/AddPhotos.png'},
        setValue: function (value) {
            var me = this;
            if ( value && value.length >0 )
            {
                this.update({src: value[0].imagePath });
            }
            
            //me.setRawValue(me.valueToRaw(value));
            return me.mixins.field.setValue.call(me, value);
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
        }
    });

/**
 * @class Taco.shared.view.modal.ImageMetadata
 */
Ext.define('Taco.shared.view.modal.ImageUrlManager', {
    extend: 'Taco.core.ux.window.Modal',

    closeAction: 'destroy',
    autoShow: true,
    scale: 'medium',
    thumbnailSize: 150,
    title: 'Image URL',
    primaryText: 'Link',

    initComponent: function() {
        var me = this;
        //https://images-na.ssl-images-amazon.com/images/I/51bi5Tf3CBL._SS75_.jpg
        //http://cdn.is.bluefly.com/mgen/Bluefly/prodImage.ms?productCode=336682301&width=251&height=300
        this.imageUrl = Ext.widget({
            xtype: 'textarea',
            name: 'imageUrl',
            rows: 2,
            allowBlank: false,
            selectOnFocus: true,
            width: "100%"
        });

        this.imagePreview = Ext.create('Ext.Img', {
            name: 'imagePreview',
            src: '/admin/Scripts/resources/images/image-drop.png',
            width: this.thumbnailSize,
            height: this.thumbnailSize,
            border: 1,
            style: {
                borderColor: '#bfbfbf',
                borderStyle: 'solid'
            },
            shrinkWrap: true,
            listeners: {
                load: {
                    element: 'el',
                    fn: me.imgPreviewLoaded,
                    scope: me
                },
                error: {
                    element: 'el',
                    fn: me.imgPreviewErrored,
                    scope: me
                }
            }
        });

        this.previewAction = Ext.widget({
            xtype: 'button',
            ui: 'link',
            scale: 'medium',
            text: 'Preview Image',
            margin: "0 0 5 0",
            scope: this,
            handler: function() {
                me.imagePreview.setSrc(me.imageUrl.getValue());
            }
        });

        this.form = Ext.create('Taco.core.ux.form.Form', {
            requireDirty: false,
            layout: {
                type: 'vbox'
            },
            items: [this.imageUrl, this.imagePreview, this.previewAction]
        });

        this.items = [this.form];

        this.callParent(arguments);

        this.on({
            show: {
                scope: this,
                fn: function() {
                    var field = this.form.findField('imageUrl');
                    if (field && field.rendered) {
                        field.focus(true, 10);
                    }
                }
            }
        });
    },

    imgPreviewLoaded: function(evt, img) {
        var scaledImage = this.calculateAspectRatio(img.naturalWidth, img.naturalHeight, this.thumbnailSize, this.thumbnailSize);
        this.imagePreview.setSize(scaledImage.width,scaledImage.height);

    },

    imgPreviewErrored: function(evt, img) {
        this.imageUrl.setActiveError('Invalid image URL');
        this.imageUrl.doComponentLayout();
    },

    calculateAspectRatio: function (srcWidth, srcHeight, maxWidth, maxHeight) {
        var ratio = (srcWidth === 0 || srcHeight === 0) ? 1 : Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        return { width: srcWidth*ratio, height: srcHeight*ratio };
    },
    
    doSave: function () {
        var data = this.form.getValues();
        this.saveSuccess(data);
    }

});


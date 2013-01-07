/**
 * @class Taco.view.site.widget.ImagesGallery
 */
Ext.define('Taco.view.site.widget.ImagesGallery', {
    extend: 'Taco.view.site.widget.Editor',
    requires: ['Taco.core.ux.form.TextAlignment', 'Taco.view.fileManagement.MultiFileAssociatorGooder'],

    title: 'Image Gallery',
    autoSize: false,

    initComponent: function () {
        var val, actions;

        this.styleForm = this.initStyleForm();
        this.contentForm = this.initContentForm();        

        this.items = [this.styleForm, this.contentForm];

        this.callParent(arguments);

        // Show the settings for the selected Image Gallery Type
        if ((val = this.galleryType.getValue().type + 'Settings') && this.hasOwnProperty(val)) {
            this[val].show();
            this.activeSettings = this[val];
        }

        this.galleryType.on({
            change: function (type, value) {
                var name = value.type + 'Settings';
                this[name].show();
                if (this.activeSettings) {
                    this.activeSettings.hide();
                }
                this.activeSettings = this[name];
                this.doLayout();
            },
            scope: this
        });

        actions = this.getHeader().getActions();
        actions.add([{
            xtype: 'action',
            text: 'Style',
            click: function () {
                this.styleForm.show();
                this.contentForm.hide();
            },
            scope: this
        }, {
            xtype: 'action',
            text: 'Content',
            click: function () {
                this.contentForm.show();
                this.styleForm.hide();
            },
            scope: this
        }]);
        actions.show();
    },

    initStyleForm: function () {
        var settingsHeight = undefined;

        this.carouselSettings = Ext.create('Ext.Container', {
            hidden: true,
            height: settingsHeight,
            items: [{
                xtype: 'checkboxfield',
                name: 'showThumbnails',
                boxLabel: 'Show thumbnails below the main image'
            }, {
                xtype: 'checkboxfield',
                name: 'autoplayCarousel',
                boxLabel: 'Autoplay'
            }, {
                xtype: 'slider',
                name: 'delay',
                width: 200,
                increment: 1,
                minValue: 1,
                maxValue: 20
            }]
        });

        this.gridSettings = Ext.create('Ext.Container', {
            hidden: true,
            height: settingsHeight,
            items: [{
                xtype: 'checkboxfield',
                name: 'lightbox',
                boxLabel: 'Open larger images in a lightbox'
            }, {
                xtype: 'textfield',
                name: 'gridColumns',
                fieldLabel: 'Number of images per row',
                fieldCls: 'columns-input',
                labelWidth: 190,
                width: 230
            }, {
                xtype: 'alignfield',
                name: 'alignment',
                fieldLabel: null,
                width: 100,
                defaults: {
                    name: 'alignment'
                }
            }]
        });

        this.sliderSettings = Ext.create('Ext.Container', {
            hidden: true,
            height: settingsHeight,
            items: [{
                xtype: 'textfield',
                name: 'sliderColumns',
                fieldLabel: 'Number of images per slide',
                fieldCls: 'columns-input',
                labelWidth: 195,
                width: 235
            }, {
                xtype: 'checkboxfield',
                name: 'autoplaySlider',
                boxLabel: 'Autoplay'
            }]
        });

        this.galleryType = Ext.create('Ext.form.RadioGroup', {
            xtype: 'radiogroup',
            columns: 3,
            vertical: true,
            width: 500,
            items: [{
                boxLabel: 'Carousel',
                name: 'type',
                inputValue: 'carousel',
                afterBoxLabelTextTpl: '<img src="/admin/Scripts/resources/images/temp/image-gallery-carousel.png">'
            }, {
                boxLabel: 'Grid',
                name: 'type',
                inputValue: 'grid',
                afterBoxLabelTextTpl: '<img src="/admin/Scripts/resources/images/temp/image-gallery-grid.png">'
            }, {
                boxLabel: 'Slider',
                name: 'type',
                inputValue: 'slider',
                afterBoxLabelTextTpl: '<img src="/admin/Scripts/resources/images/temp/image-gallery-slider.png">'
            }]
        });

        this.selectedField = Ext.create('Ext.form.field.Hidden', {
            name: 'images',
            value: Ext.encode(this.widgetConfig.images)
        });

        return Ext.create('Ext.Container', {
            cls: 'taco-image-gallery-widget',
            items: [
                this.galleryType,
                this.carouselSettings,
                this.gridSettings,
                this.sliderSettings,
                this.selectedField
            ]
        });
    },

    initContentForm: function () {
        this.associator = Ext.create('Taco.view.fileManagement.MultiFileAssociatorGooder', {
            initialSelected: this.widgetConfig.images,
            listeners: {
                selectionchange: function (images) {
                    //console.log('selection changed!', store);
                    this.selectedImages = images;
                    this.selectedField.setValue(Ext.encode(images));

                },
                scope: this
            }
        });

        return Ext.create('Ext.Container', {
            hidden: true,
            items: [this.associator]
        });
    },

    buildWidgetConfig: function () {
        var value = this.callParent(arguments);
        value.images = this.selectedImages;
        console.log('widgetconfig', value);
        return value;
    },

    initWidgetConfig: function () {
        return {
            type: 'carousel',
            showThumbnails: false,
            autoplayCarousel: true,
            autoplaySlider: true,
            delay: 4,
            lightbox: true,
            alignment: 'left',
            gridColumns: 3,
            sliderColumns: 3,
            images: []
        };
    }
});
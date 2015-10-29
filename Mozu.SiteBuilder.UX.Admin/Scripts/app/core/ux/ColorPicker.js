/**
 * @class Taco.core.ux.ColorPicker
 */
Ext.define('Taco.core.ux.ColorPicker', {
    requires: ['Ext.draw.Sprite'],
    extend: 'Ext.container.Container',


    pickerSize: 256,
    reticleSize: 8,

    initComponent: function () {

        this.hsv = {
            h: 1,
            s: 100,
            v: 100,
            a: 100
        };

        this.setValue(this.value);

        this.rectHue = Ext.create('Ext.draw.Sprite', {
            type: 'rect',
            x: this.reticleSize,
            y: this.reticleSize,
            width: this.pickerSize,
            height: this.pickerSize,
            fill: 'blue'
        });

        this.pickerCircleBlack = Ext.create('Ext.draw.Sprite', {
            type: 'circle',
            radius: this.reticleSize - 1,
            x: 100,
            y: 100,
            stroke: 'black',
            'stroke-width': 1
        });

        this.pickerCircleWhite = Ext.create('Ext.draw.Sprite', {
            type: 'circle',
            radius: this.reticleSize - 2,
            x: 100,
            y: 100,
            stroke: 'white',
            'stroke-width': 1
        });

        this.picker = Ext.create('Ext.draw.Component', {
            viewBox: false,
            height: this.pickerSize + this.reticleSize * 2,
            width: this.pickerSize + this.reticleSize * 2,
            gradients: [{
                id: 'gradient-white',
                angle: 0,
                stops: {
                    0: {
                        color: 'white'
                    },
                    100: {
                        color: 'white',
                        opacity: '0'
                    }
                }
            }, {
                id: 'gradient-black',
                angle: 270,
                stops: {
                    0: {
                        color: 'black'
                    },
                    100: {
                        color: 'black',
                        opacity: '0'
                    }
                }
            }],
            items: [this.rectHue, {
                type: 'rect',
                x: this.reticleSize,
                y: this.reticleSize,
                width: this.pickerSize,
                height: this.pickerSize,
                fill: 'url(#gradient-white)'
            }, {
                type: 'rect',
                x: this.reticleSize,
                y: this.reticleSize,
                width: this.pickerSize,
                height: this.pickerSize,
                fill: 'url(#gradient-black)',
                stroke: 'black',
                'stroke-width': 1
            }, this.pickerCircleWhite, this.pickerCircleBlack]
        });

        this.sliderLeft = Ext.create('Ext.draw.Sprite', {
            type: 'text',
            text: '&gt;',
            font: '14px Courier',
            x: this.reticleSize - 8,
            y: 10
        });



        this.sliderRight = Ext.create('Ext.draw.Sprite', {
            type: 'text',
            text: '&lt;',
            font: '14px Courier',
            x: this.reticleSize + this.pickerSize / 10,
            y: 10
        });

        this.slider = Ext.create('Ext.draw.Component', {
            viewBox: false,
            height: this.pickerSize + this.reticleSize * 2,
            width: this.pickerSize / 10 + this.reticleSize * 2,
            gradients: [{
                id: 'gradient-hue',
                angle: 270,
                stops: {
                    0: {
                        color: '#FF0000'
                    },
                    13: {
                        color: '#FF00FF'
                    },
                    25: {
                        color: '#8000FF'
                    },
                    38: {
                        color: '#0040FF'
                    },
                    50: {
                        color: '#00FFFF'
                    },
                    63: {
                        color: '#00FF40'
                    },
                    75: {
                        color: '#0BED00'
                    },
                    88: {
                        color: '#FFFF00'
                    },
                    100: {
                        color: '#FF0000'
                    }
                }
            }],
            items: [{
                type: 'rect',
                x: this.reticleSize,
                y: this.reticleSize,
                width: this.pickerSize / 10,
                height: this.pickerSize,
                stroke: 'black',
                'stroke-width': 1,
                fill: 'url(#gradient-hue)'
            }, this.sliderLeft, this.sliderRight]
        });

        this.sampleColor = Ext.create('Ext.draw.Sprite', {
            type: 'rect',
            width: '100%',
            height: '100%',
            stroke: 'black',
            'stroke-width': 2
        });

        this.sample = Ext.create('Ext.draw.Component', {
            width: 30,
            height: 30,
            items: [{
                type: 'image',
                src: '/admin/Scripts/resources/images/legacy/background-alpha.png',
                width: '100%',
                height: '100%'
            },
                this.sampleColor
            ]
        });

        this.hexField = Ext.create('Ext.form.field.Text', {
            value: this.buildRgbString(this.rgb),
            margin: '0 0 0 15',
            width: 210,
            style: {
                display: 'inline-table'
            }
        });

        this.alphaSlider = Ext.create('Ext.slider.Single', {
            width: this.pickerSize,
            value: this.hsv.a,
            increment: 0.1,
            minValue: 0,
            maxValue: 100,
            margin: '5 0 10'
        });

        this.items = [this.picker, this.slider, this.alphaSlider, this.sample, this.hexField];

        this.callParent(arguments);
        
        this.slider.on({
            mousedown: function (e) {
                this.sliderMouseDown = true;
                this.moveSlider(e);
                Ext.getBody().addCls('taco-no-select');
            },
            scope: this
        });

        this.picker.on({
            mousedown: function (e) {
                this.pickerMouseDown = true;
                this.movePicker(e);
                Ext.getBody().addCls('taco-no-select');
            },
            scope: this
        });

        Ext.getBody().on({
            mousemove: function (e) {
                if (this.sliderMouseDown) {
                    this.moveSlider(e);
                } else if (this.pickerMouseDown) {
                    this.movePicker(e);
                }
            },
            mouseup: function (e) {
                if (!this.sliderMouseDown && !this.pickerMouseDown) {
                    return;
                }
                this.sliderMouseDown = this.pickerMouseDown = false;
                Ext.getBody().removeCls('taco-no-select');
            },
            scope: this
        });

        this.alphaSlider.on({
            change: this.changeAlpha,
            scope: this
        });

        this.sample.on({
            render: this.updateSample,
            scope: this
        });

        this.hexField.on({
            change: function () {
                this.readInput(true);
            },
            blur: function () {
                this.readInput();
            },
            scope: this
        });

        this.updatePicker();
    },

    load: function () {
        this.add(this.svg);
    },

    moveSlider: function (e) {
        var client = this.getRelativeXY(e, this.slider.getEl()),
            hue = window.parseInt(client.y / this.pickerSize * 360);

        this.hsv.h = hue < 0
                        ? 0
                        : hue > 360
                            ? 360
                            : hue;
        

        this.setValue();
    },

    updatePicker: function () {
        this.rectHue.setAttributes({
            fill: 'hsl(' + this.hsv.h + ', 100%, 50%)'
        }, true);
    },

    changeAlpha: function (e) {
        this.hsv.a = this.alphaSlider.getValue();
        this.setValue();
    },

    movePicker: function (e) {
        var client = this.getRelativeXY(e, this.picker.getEl()),
            saturation = window.parseInt(client.x / this.pickerSize * 100),
            value = 100 - window.parseInt(client.y / this.pickerSize * 100);

        this.hsv.s = saturation < 0
                        ? 0
                        : saturation > 100
                            ? 100
                            : saturation;

        this.hsv.v = value < 0
                        ? 0
                        : value > 100
                            ? 100
                            : value;

        this.setValue();
    },

    getRelativeXY: function (e, element) {
        var pointer = e.getPoint(),
            offset = element.getOffsetsTo(Ext.getBody());

        return {
            x: pointer.x - offset[0] - this.reticleSize,
            y: pointer.y - offset[1] - this.reticleSize
        };
    },

    updateSample: function (ignoreHexField) {
        var rgbaString = this.buildRgbString(this.rgb),
            hex,
            rgb,
            pickerCircleCfg = {
                x: this.pickerSize * this.hsv.s / 100 + this.reticleSize,
                y: this.pickerSize * (1 - this.hsv.v / 100) + this.reticleSize
            },
            sliderArrowCfg = {
                y: this.pickerSize * this.hsv.h / 360 + this.reticleSize
            };

        this.updatePicker();

        this.sampleColor.setAttributes({
            fill: rgbaString
        }, true);

        this.pickerCircleBlack.setAttributes(pickerCircleCfg, true);
        this.pickerCircleWhite.setAttributes(pickerCircleCfg, true);

        this.sliderLeft.setAttributes(sliderArrowCfg, true);
        this.sliderRight.setAttributes(sliderArrowCfg, true);

        this.alphaSlider.suspendEvents();
        this.alphaSlider.setValue(this.hsv.a);
        this.alphaSlider.resumeEvents();

        if (!ignoreHexField) {
            this.hexField.suspendEvents();
            hex = '#' + this.toHex(this.rgb.r) + this.toHex(this.rgb.g) + this.toHex(this.rgb.b);
            // this.hexField.setValue(hex);
            rgb = this.buildRgbString(this.rgb);
            this.hexField.setValue(rgb);
            this.hexField.resumeEvents();
        }

        this.value = rgbaString;
        this.fireEvent('change', this.value);
    },

    buildRgbString: function (rgba) {
        return 'rgba(' + rgba.r + ', ' + rgba.g + ', ' + rgba.b + ', ' + rgba.a + ')';
    },

    setValue: function (value, ignoreHexField) {
        var oldHsv = {
            h: this.hsv.h,
            s: this.hsv.s,
            v: this.hsv.v,
            a: this.hsv.a
        };

        if (value === undefined && this.rendered) {
            this.rgb = this.getRgbFromHsv(this.hsv);

            this.updateSample();
            return;
        }

        if (typeof value === 'string') {        
            value = value.replace(/\s/g, '');
    
            if (value.match(/^rgba\(\d+,\d+,\d+,\d(.\d+)?\)$/)) {
                this.readRgba(value);
            } else if (value.match(/^rgb\(\d+,\d+,\d+\)$/)) {
                this.readRgb(value);
            } else if (value.match(/^#?[0-9A-Fa-f]{6}$/)) {
                this.readHex(value);
            } else if (value.match(/^#?[0-9A-Fa-f]{3}$/)) {
                this.readHexShorthand(value);
            }
        } else if (value.h !== undefined && value.s !== undefined && value.v !== undefined && value.a !== undefined) {
            this.hsv = {
                h: value.h,
                s: value.s,
                v: value.v,
                a: value.a
            };
        }

        this.rgb = this.getRgbFromHsv(this.hsv);

        if (oldHsv.h === this.hsv.h && oldHsv.s === this.hsv.s  && oldHsv.v === this.hsv.v  && oldHsv.a === this.hsv.a ) {
            return;
        }

        if (this.rendered) {
            this.updateSample(ignoreHexField);
        }
    },

    readInput: function (ignoreHexField) {
        //var value = this.hexField.getValue().replace(/\s/g, '');
        this.setValue(this.hexField.getValue(), ignoreHexField);
    },

    readRgba: function (rgbaInput) {
        var rgbaArray = rgbaInput.trim().substring(5).split(','),
            rgba =  {
                r: window.parseInt(rgbaArray[0].trim(), 10),
                g: window.parseInt(rgbaArray[1].trim(), 10),
                b: window.parseInt(rgbaArray[2].trim(), 10),
                a: window.parseFloat(rgbaArray[3].trim())
            };

        this.hsv = this.getHsvFromRgb(rgba);
    },

    readRgb: function (rgbInput) {
        var rgbArray = rgbInput.trim().substring(4).split(','),
            rgba =  {
                r: window.parseInt(rgbArray[0].trim(), 10),
                g: window.parseInt(rgbArray[1].trim(), 10),
                b: window.parseInt(rgbArray[2].trim(), 10),
                a: this.hsv.a / 100
            };

        this.hsv = this.getHsvFromRgb(rgba);
    },

    readHexShorthand: function (hex) {
        hex = hex.charAt(0) === '#' ? hex.substring(1) : hex;

        this.readHex(hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]);
    },

    readHex: function (hex) {
        var rgb = this.getRgbFromHex(hex);

        this.hsv = this.getHsvFromRgb(rgb);
    },

    toHex: function (num) {
        var hex = num.toString(16);

        if (hex.length === 1) {
            hex = '0' + hex;
        }

        return hex;
    },

    getRgbFromHex: function (hex) {
        hex = hex.charAt(0) === '#' ? hex.substring(1) : hex;

        return {
            r: window.parseInt(hex.substring(0,2), 16),
            g: window.parseInt(hex.substring(2,4), 16),
            b: window.parseInt(hex.substring(4,6), 16),
            a: this.hsv.a / 100
        };
    },

    getHsvFromRgb: function (rgb) {
        var r = rgb.r / 255,
            g = rgb.g / 255,
            b = rgb.b / 255,
            minRgb = Math.min(r, Math.min(g, b)),
            maxRgb = Math.max(r, Math.max(g, b)),
            d, h;

        if (minRgb === maxRgb) {
            return {
                h: this.hsv.h,
                s: 0,
                v: minRgb * 100,
                a: rgb.a * 100
            };
        }

        d = (r === minRgb) ? g - b : ((b === minRgb) ? r - g : b - r);
        h = (r === minRgb) ? 3 : ((b === minRgb) ? 1 : 5);
        
        return {
            h: 60 * (h - d / (maxRgb - minRgb)),
            s: (maxRgb - minRgb)/maxRgb * 100,
            v: maxRgb * 100,
            a: rgb.a * 100
        };
    },

    getRgbFromHsv: function (hsv) {
        var hue = hsv.h, sat = hsv.s, val = hsv.v,
            h, i, v1, v2, v3, r, g, b;

        hue /= 360;
        sat /= 100;
        val /= 100;

        if (sat === 0) {
            return {
                r: Math.round(val * 255),
                g: Math.round(val * 255),
                b: Math.round(val * 255),
                a: hsv.a / 100
            };
        }

        h = hue * 6;
        i = Math.floor(h);
        v1 = val * (1 - sat);
        v2 = val * (1 - sat * (h - i));
        v3 = val * (1 - sat * (1 - (h - i)));

        switch (i) {
            case 0:
                r = val;
                g = v3;
                b = v1;
                break;
            case 1:
                r = v2;
                g = val;
                b = v1;
                break;
            case 2:
                r = v1;
                g = val;
                b = v3;
                break;
            case 3:
                r = v1;
                g = v2;
                b = val;
                break;
            case 4:
                r = v3;
                g = v1;
                b = val;
                break;
            default:
                r = val;
                g = v1;
                b = v2;
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
            a: hsv.a / 100
        };
    }
});
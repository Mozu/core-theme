/**
 * @class Taco.view.phoneOrder.CustomerSection
 * @author Michael Speed Elder
 * Date: 1/8/13
 * Time: 5:01 PM
 */

Ext.define("Taco.view.phoneOrder.CustomerSection", {
    extend: "Taco.core.ux.form.Form",
    requires: [
        "Ext.form.RadioGroup",
        "Ext.form.field.Text",
        "Taco.view.customers.SearchForm",
        "Taco.core.ux.form.BoxSelect"
    ],
    // bodyCls: Taco.baseCSSPrefix + 'flexform',
    cls: Taco.baseCSSPrefix + 'customer-section',
    title: "Customer",

    createTitle: "Customer",
    editTitle: "Customer",

    initComponent: function () {
        var me = this;

        Ext.define("Fuckyou", {
            extend: "Ext.data.Model",
            fields: [
                { name: "firstName", type: "string" }
            ]
        });

        me.fixture = Ext.create("Ext.data.Store", {
            model: "Fuckyou",
            data: [
                { firstName: "Michael" },
                { firstName: "Chris" },
                { firstName: "Foster" },
                { firstName: "Jimmy" },
                { firstName: "Travis" },
                { firstName: "James" },
                { firstName: "Thom" }
            ]
        });

        me.radiogroup = Ext.create("Ext.form.RadioGroup", {
                cls: Taco.baseCSSPrefix + "customer-radiogroup",
                columns: 1,
                vertical: true,
                items: [
                    { boxLabel: 'Anonymous', name: 'customerStatus', inputValue: 0, checked: true },
                    { boxLabel: 'Existing', name: 'customerStatus', inputValue: 1 },
                    { boxLabel: 'New', name: 'customerStatus', inputValue: 2 }
                ]
            });

        me.searchform = Ext.create("Taco.view.customers.SearchForm");

        me.boxselect = Ext.create("Taco.core.ux.form.BoxSelect", {
            name: 'boxsearch',
            width: 600,
            minChars: 2,
            cls: 'taco-boxselect',
            // store: me.fixture,
            displayField: 'displayName',
            valueField: 'key',
            shortField: 'displayName',
            triggerOnClick: false,
            pinList: false,
            onTriggerClick: function () {
                var xy = this.getPosition();

                if (me.searchform.isVisible()) {
                    me.searchform.hide();
                } else {
                    me.searchform.showAt(xy[0], xy[1] + this.getHeight());
                }
            }
//            , listeners: {
//                change: function (field, newValue, oldValue) {
//                    var n = newValue ? newValue.split(', ') : [],
//                        o = oldValue ? oldValue.split(', ') : [],
//                        diff = Ext.Array.difference(o, n);
//
//                    if (diff.length > 0) {
//                        me.filterStore.remove(me.filterStore.findRecord('key', diff[0]));
//                        //me.searchform.down('#' + diff[0]).reset();
//                        me.itemStore.clearFilter();
//                        me.itemStore.filter(me.filterStore.collect('filter'));
//                    }
//                }
//            }
        });

        me.partition = Ext.create("Ext.Container", {
            layout: {
                type: "hbox",
                align: "stretchmax"
            },
            items: [
                me.radiogroup,
                {
                    cls: Taco.baseCSSPrefix + "customer-section-card-container",
                    xtype: "container",
                    height: "100%",
                    layout: "card",
                    flex: 1,
                    defaults: {
                        componentCls: Taco.baseCSSPrefix + "customer-section-card"
                    },
                    defaultType: "container",
                    items: [{
                        xtype: "component",
                        cls: Taco.baseCSSPrefix + "anonymous-transaction",
                        autoEl: {
                            tag: "h3",
                            html: "This is an anonymous transaction"
                        }
                    }, {
                        defaultType: "component",
                        items: [
                            {
                                autoEl: {
                                    tag: "h3",
                                    html: "Lookup an existing customer"
                                }
                            }
                            , me.boxselect
                        ]
                    }, {
                        defaultType: "component",
                        defaults: {
                            width: "75%",
                            labelAlign: 'top',
                            labelSeparator: ""
                        },
                        items: [{
                            autoEl: {
                                tag: "h3",
                                html: "Create a new customer"
                            }
                        }, {
                            xtype: 'textfield',
                            name: 'email',
                            fieldLabel: 'Email',
                            cls: Taco.baseCSSPrefix + 'no-margin-label'
                        }, {
                            xtype: 'textfield',
                            name: 'password',
                            fieldLabel: 'Password',
                            value: me.generateRandomPassword()
                        }]
                    }]
                }
            ]
        });

        this.items = [me.partition];

        this.callParent( arguments );

        // *** Listen for changes to RadioGroup selection
        this.mon(
            me.radiogroup,
            "change",
            function (radioButton, newVal, oldVal) {
                // *** Go to adjacent container and set the corresponding card to be visible
                me.radiogroup.nextSibling().getLayout().setActiveItem( newVal.customerStatus );
            }
        );
    },

    /**
     * Returns four randomly selected words from the inline dictionary.
     * @return String
     */
    generateRandomPassword: function () {
        var dictionary = ["Adult","Aeroplane","Air","Aircraft","Airforce","Airport","Album","Alphabet","Apple","Arm","Army","Baby","Backpack","Balloon","Banana","Bank","Barbecue","Bathroom","Bathtub","Bed","Bee","Bird","Bomb","Book","Boss","Bottle","Bowl","Box","Boy","Brain","Bridge","Butterfly","Button","Cappuccino","Car","Car","Carpet","Carrot","Cave","Chair","Chess","Chief","Child","Chisel","Chocolates","Circle","Circus","Clock","Clown","Coffee","Coffee","Comet","Compact","Compass","Computer","Crystal","Cup","Cycle","Data","Desk","Diamond","Dress","Drill","Drink","Drum","Dung","Ears","Earth","Egg","Electricity","Elephant","Eraser","Explosive","Eyes","Family","Fan","Feather","Festival","Film","Finger","Fire","Floodlight","Flower","Foot","Fork","Freeway","Fruit","Fungus","Game","Garden","Gas","Gate","Gemstone","Girl","Gloves","Grapes","Guitar","Hammer","Hat","Hieroglyph","Highway","Horoscope","Horse","Hose","Ice","Ice","Insect","Jet","Junk","Kaleidoscope","Kitchen","Knife","Leather","Leg","Library","Liquid","Magnet","Man","Map","Maze","Meat","Meteor","Microscope","Milk","Milkshake","Mist","Money","Monster","Mosquito","Mouth","Nail","Navy","Necklace","Needle","Onion","Paintbrush","Pants","Parachute","Passport","Pebble","Pendulum","Pepper","Perfume","Pillow","Plane","Planet","Pocket","Post","Potato","Printer","Prison","Pyramid","Radar","Rainbow","Record","Restaurant","Rifle","Ring","Robot","Rock","Rocket","Roof","Room","Rope","Saddle","Salt","Sandpaper","Sandwich","Satellite","School","Ship","Shoes","Shop","Shower","Signature","Skeleton","Snail","Software","Solid","Space","Spectrum","Sphere","Spice","Spiral","Spoon","Sports","Spot","Square","Staircase","Star","Stomach","Sun","Sunglasses","Surveyor","Swimming","Sword","Table","Tapestry","Teeth","Telescope","Television","Tennis","Thermometer","Tiger","Toilet","Tongue","Torch","Torpedo","Train","Treadmill","Triangle","Tunnel","Typewriter","Umbrella","Vacuum","Vampire","Videotape","Vulture","Water","Weapon","Web","Wheelchair","Window","Woman","Worm","Xray"];
        return this.getRandomElement( dictionary ) +
               this.getRandomElement( dictionary ) +
               this.getRandomElement( dictionary ) +
               this.getRandomElement( dictionary );
    },

    /**
     * Returns a random element from the provided array.
     * @param {Array} array
     * @return {*}
     */
    getRandomElement: function ( array ) {
        return array[ parseInt(Math.random() * 1e7) % array.length ];
    }
});

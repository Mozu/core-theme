Class('Taco.TestClass.Core', {
    isa: Siesta.Test.ExtJS,
    methods: {
        setup: function (callback, errback) {

            var ext = this.getExt();
            ext.override(ext.ux.ajax.SimXhr, {
                schedule: function () {
                    var me = this;
                    me.timer = setTimeout(function () {
                        me.onTick();
                    }, me.mgr ? me.mgr.delay : 100);
                }
            });

            ext.override(ext.ux.ajax.Simlet, {
                doRedirect: function (ctx) {
                    if (this.jsonFile) {
                        return this.redirect('GET', this.jsonFile);
                    }
                    return false;
                },
                openRequest: function (method, url, options, async) {
                    var xhr = this.callParent(arguments);
                    if (options) {
                        options.isSimulated = true;
                    }
                    if (xhr) {
                        options.headers = {};
                    }
                    return xhr;
                }

            });


            callback();


        },
        randomStringSuffix: function (seed, existing, depth) {
            var ret;
            depth = depth || 100;
            while (true) {
                var ret = seed + Math.floor((Math.random() * depth) + 1);
                if (ret != existing) {
                    return ret;
                }
            }

        },
        setContext: function (cfg, navigate) {
            var temp;
            this.diag('Loading Conext: ' + (cfg.$className || cfg));

            if (typeof cfg === 'string') {
                switch (cfg) {
                case 'collection':
                    temp = Taco.app.context.masterCatalogs;

                    this.ok(temp.length, 'One or more site collections exist');

                    cfg = temp[0];

                    this.ok(cfg, 'A valid site collection exists');

                    break;
                }
            }

            Taco.app.context.setCurrentContext(cfg, navigate);
        },

        clickSelect: function (cmp, value, next) {
            if (!cmp) {
                return;
            }
            var test = this,
                target = cmp.el.query('.x-form-arrow-trigger');

            //cmp.focus();


            //#contentView .taco-formform .x-form-trigger.x-form-arrow-trigger.x-form-trigger-first
            if (target && target.length) {
                target = target[0];
            } else {
                target = cmp.getTrigger();
            }


            test.click(target, function () {
                var nodes = cmp.getPicker().getNodes(),
                    idx = cmp.store.findBy(function (rec) {
                        return rec.get(cmp.valueField) == value || rec.get(cmp.displayField) == value;
                    });
                if (idx > -1) {
                    test.click(nodes[idx], next);
                    return;
                }


                Ext.each(nodes, function (node) {
                    var el = Ext.fly(node);
                    if (el.getHTML() === value) {
                        test.click(el, next);
                        return false;
                    }
                });

            });
        },
        validateFormValues: function (form, map) {
            var test = this;
            Ext.iterate(map, function (key, value) {
                //  var fnComplete = function () {

                var field = test.fieldFieldInForm(form, key);
                if (!field) {
                    test.fail('didnt find field' + key);
                    return;
                }
                test.is(field.getValue(), value, ' field: "' + key + '" set propertly');


            });
        },
        validateRecordValues: function (desc, record, map, next) {
            if (typeof desc !== 'string') {
                next = map;
                map = record;
                record = desc;
                desc = 'Checking record values';
            }

            this.subTest(desc, function (t) {
                Ext.iterate(map, function (key, val) {
                    t.is(record.get(key), val, key + ' is set to ' + val);
                }, this);
            }, next);
        },
        fieldFieldInForm: function (form, name) {
            var field = form.findField(name);

            var fields = Ext.ComponentQuery.query('[isFormField][name="' + name + '"]', form);
            if (fields.length) {
                field = Ext.Array.findBy(fields, function (f) {
                    if (f.isHidden()) {
                        return false;
                    }
                    if (f.findParentBy(function (p) {
                        return p.isHidden();
                    })) {
                        return false;
                    }
                    return true;
                });
            }
            return field;
        },
        setFormValues: function (desc, form, map, next) {
            var t = this,
                steps = [];

            if (typeof desc !== 'string') {
                next = map;
                map = form;
                form = desc;
                desc = 'Setting the form values';
            }

            if (form.getForm) form = form.getForm();

            t.subTest(desc, function (t) {

                Ext.iterate(map, function (key, value) {

                    var field = t.fieldFieldInForm(form, key);

                    t.ok(field, 'Found field: "' + key + '", setting value: "' + value + '"');

                    if (field.getPicker) {
                        steps.push(
                            function (n) {
                                t.clickSelect(field, value, n);
                            });
                    } else {
                        steps.push(
                            function (n) {
                                field.focus();
                                t.selectText(field);
                                t.type(field, value, n);
                            });
                    }


                });

                steps.push(function (n) {
                    t.validateFormValues(form, map);
                    n();
                });
                t.chain(steps);
            }, next);
        },
        setOnlyMocks: function (value) {
            var sm = this.getExt().ux.ajax.SimManager;

            sm.init();
            sm.defaultSimlet = value == false ? null : this.getExt().create('Ext.ux.ajax.Simlet', {
                status: 404,
                statusText: 'Not Found',
                manager: sm
            });
        },
        simManager: function () {
            return this.getExt().ux.ajax.SimManager;
        },

        showViewPort: function () {
            Taco.app.initViewPort();
        },

        waitForRender: function (t, component, afterRender) {
            t.waitFor(function () {
                return component.rendered;
            }, afterRender);
        },

        getRoleStore: function () {
            return Ext.create('Ext.data.Store', {
                fields: [{
                    name: 'id',
                    type: 'int'
                }, {
                    name: 'name',
                    type: 'string'
                }, {
                    name: 'isEditable',
                    type: 'boolean'
                }],
                data: [{
                    id: 1,
                    name: 'Super Admin',
                    isEditable: false
                }, {
                    id: 2,
                    name: 'Kid Touchers',
                    isEditable: true
                }]
            });
        },


        getBehaviorStore: function (roleId) {
            var store,
                data;

            data = {
                '1': {
                    "message": null,
                    "success": true,
                    "total": 15,
                    "items": [{
                        "id": "cat1",
                        "name": "Product",
                        "cls": "behavior-category",
                        "items": [{
                            "id": "1",
                            "name": "ProductCreate",
                            "cls": "behavior",
                            "checked": true,
                            "items": null,
                            "behaviorId": 1,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "2",
                            "name": "ProductUpdate",
                            "cls": "behavior",
                            "checked": true,
                            "items": null,
                            "behaviorId": 2,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "3",
                            "name": "ProductDelete",
                            "cls": "behavior",
                            "checked": true,
                            "items": null,
                            "behaviorId": 3,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "4",
                            "name": "ProductRead",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 4,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "16",
                            "name": "ProductCategoryRead",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 16,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "17",
                            "name": "ProductCategoryCreate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 17,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "18",
                            "name": "ProductCategoryDelete",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 18,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "19",
                            "name": "ProductCategoryUpdate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 19,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "20",
                            "name": "ProductDiscountRead",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 20,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "21",
                            "name": "ProductDiscountCreate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 21,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "22",
                            "name": "ProductDiscountUpdate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 22,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "23",
                            "name": "ProductDiscountDelete",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 23,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }],
                        "expanded": true,
                        "loaded": true
                    }, {
                        "id": "cat2",
                        "name": "Account",
                        "cls": "behavior-category",
                        "items": [{
                            "id": "5",
                            "name": "AccountInstallApp",
                            "cls": "behavior",
                            "checked": true,
                            "items": null,
                            "behaviorId": 5,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "6",
                            "name": "AccountViewStatement",
                            "cls": "behavior",
                            "checked": true,
                            "items": null,
                            "behaviorId": 6,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }],
                        "expanded": true,
                        "loaded": true
                    }, {
                        "id": "cat3",
                        "name": "Site",
                        "cls": "behavior-category",
                        "items": [{
                            "id": "7",
                            "name": "SiteApplyPayment",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 7,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "8",
                            "name": "SitePublishPage",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 8,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "9",
                            "name": "SitePublishProduct",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 9,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "10",
                            "name": "SiteUpdateTheme",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 10,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "11",
                            "name": "SiteCreatePage",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 11,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "12",
                            "name": "SiteUpdatePage",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 12,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "13",
                            "name": "SiteDeletePage",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 13,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "14",
                            "name": "SiteCreate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 14,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "15",
                            "name": "SiteDelete",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 15,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }],
                        "expanded": true,
                        "loaded": true
                    }, {
                        "id": "cat4",
                        "name": "Discount",
                        "cls": "behavior-category",
                        "items": [{
                            "id": "24",
                            "name": "DiscountRead",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 24,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "25",
                            "name": "DiscountCreate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 25,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "26",
                            "name": "DiscountUpdate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 26,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "27",
                            "name": "DiscountDelete",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 27,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }],
                        "expanded": true,
                        "loaded": true
                    }, {
                        "id": "cat5",
                        "name": "User",
                        "cls": "behavior-category",
                        "items": [{
                            "id": "28",
                            "name": "UserRead",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 28,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "29",
                            "name": "UserCreate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 29,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "30",
                            "name": "UserUpdate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 30,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "31",
                            "name": "UserDelete",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 31,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "32",
                            "name": "UserAssignRoles",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 32,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "33",
                            "name": "ShopperRead",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 33,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "34",
                            "name": "ShopperCreate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 34,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "35",
                            "name": "ShopperUpdate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 35,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "36",
                            "name": "ShopperDelete",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 36,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "37",
                            "name": "UserRoleRead",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 37,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "38",
                            "name": "UserRoleCreate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 38,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "39",
                            "name": "UserRoleUpdate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 39,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "40",
                            "name": "UserRoleDelete",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 40,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }],
                        "expanded": true,
                        "loaded": true
                    }, {
                        "id": "cat6",
                        "name": "Customer",
                        "cls": "behavior-category",
                        "items": [{
                            "id": "41",
                            "name": "CustomerRead",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 41,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "42",
                            "name": "CustomerUpdate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 42,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "43",
                            "name": "CustomerDelete",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 43,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "44",
                            "name": "CustomerCreate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 44,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }],
                        "expanded": true,
                        "loaded": true
                    }, {
                        "id": "cat7",
                        "name": "Tenant",
                        "cls": "behavior-category",
                        "items": [{
                            "id": "45",
                            "name": "TenantRead",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 45,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "46",
                            "name": "TenantCreate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 46,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "47",
                            "name": "TenantUpdate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 47,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "48",
                            "name": "TenantDelete",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 48,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }],
                        "expanded": true,
                        "loaded": true
                    }, {
                        "id": "cat8",
                        "name": "Settings",
                        "cls": "behavior-category",
                        "items": [{
                            "id": "cat9",
                            "name": "SettingsGeneral",
                            "cls": "behavior-category",
                            "items": [{
                                "id": "49",
                                "name": "SettingsGeneralRead",
                                "cls": "behavior",
                                "checked": false,
                                "items": null,
                                "behaviorId": 49,
                                "expanded": true,
                                "loaded": true,
                                "leaf ": true
                            }, {
                                "id": "50",
                                "name": "SettingsGeneralCreate",
                                "cls": "behavior",
                                "checked": false,
                                "items": null,
                                "behaviorId": 50,
                                "expanded": true,
                                "loaded": true,
                                "leaf ": true
                            }, {
                                "id": "51",
                                "name": "SettingsGeneralUpdate",
                                "cls": "behavior",
                                "checked": false,
                                "items": null,
                                "behaviorId": 51,
                                "expanded": true,
                                "loaded": true,
                                "leaf ": true
                            }, {
                                "id": "52",
                                "name": "SettingsGeneralDelete",
                                "cls": "behavior",
                                "checked": false,
                                "items": null,
                                "behaviorId": 52,
                                "expanded": true,
                                "loaded": true,
                                "leaf ": true
                            }],
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true
                        }, {
                            "id": "cat10",
                            "name": "SettingsShipping",
                            "cls": "behavior-category",
                            "items": [{
                                "id": "53",
                                "name": "SettingsShippingRead",
                                "cls": "behavior",
                                "checked": false,
                                "items": null,
                                "behaviorId": 53,
                                "expanded": true,
                                "loaded": true,
                                "leaf ": true
                            }, {
                                "id": "54",
                                "name": "SettingsShippingCreate",
                                "cls": "behavior",
                                "checked": false,
                                "items": null,
                                "behaviorId": 54,
                                "expanded": true,
                                "loaded": true,
                                "leaf ": true
                            }, {
                                "id": "55",
                                "name": "SettingsShippingUpdate",
                                "cls": "behavior",
                                "checked": false,
                                "items": null,
                                "behaviorId": 55,
                                "expanded": true,
                                "loaded": true,
                                "leaf ": true
                            }, {
                                "id": "56",
                                "name": "SettingsShippingDelete",
                                "cls": "behavior",
                                "checked": false,
                                "items": null,
                                "behaviorId": 56,
                                "expanded": true,
                                "loaded": true,
                                "leaf ": true
                            }],
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true
                        }, {
                            "id": "cat11",
                            "name": "SettingsOrder",
                            "cls": "behavior-category",
                            "items": [{
                                "id": "57",
                                "name": "SettingsOrderRead",
                                "cls": "behavior",
                                "checked": false,
                                "items": null,
                                "behaviorId": 57,
                                "expanded": true,
                                "loaded": true,
                                "leaf ": true
                            }, {
                                "id": "58",
                                "name": "SettingsOrderCreate",
                                "cls": "behavior",
                                "checked": false,
                                "items": null,
                                "behaviorId": 58,
                                "expanded": true,
                                "loaded": true,
                                "leaf ": true
                            }, {
                                "id": "59",
                                "name": "SettingsOrderUpdate",
                                "cls": "behavior",
                                "checked": false,
                                "items": null,
                                "behaviorId": 59,
                                "expanded": true,
                                "loaded": true,
                                "leaf ": true
                            }, {
                                "id": "60",
                                "name": "SettingsOrderDelete",
                                "cls": "behavior",
                                "checked": false,
                                "items": null,
                                "behaviorId": 60,
                                "expanded": true,
                                "loaded": true,
                                "leaf ": true
                            }],
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true
                        }],
                        "expanded": true,
                        "loaded": true
                    }, {
                        "id": "cat9",
                        "name": "SettingsGeneral",
                        "cls": "behavior-category",
                        "items": [{
                            "id": "49",
                            "name": "SettingsGeneralRead",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 49,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "50",
                            "name": "SettingsGeneralCreate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 50,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "51",
                            "name": "SettingsGeneralUpdate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 51,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "52",
                            "name": "SettingsGeneralDelete",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 52,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }],
                        "expanded": true,
                        "loaded": true
                    }, {
                        "id": "cat10",
                        "name": "SettingsShipping",
                        "cls": "behavior-category",
                        "items": [{
                            "id": "53",
                            "name": "SettingsShippingRead",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 53,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "54",
                            "name": "SettingsShippingCreate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 54,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "55",
                            "name": "SettingsShippingUpdate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 55,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "56",
                            "name": "SettingsShippingDelete",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 56,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }],
                        "expanded": true,
                        "loaded": true
                    }, {
                        "id": "cat11",
                        "name": "SettingsOrder",
                        "cls": "behavior-category",
                        "items": [{
                            "id": "57",
                            "name": "SettingsOrderRead",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 57,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "58",
                            "name": "SettingsOrderCreate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 58,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "59",
                            "name": "SettingsOrderUpdate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 59,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "60",
                            "name": "SettingsOrderDelete",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 60,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }],
                        "expanded": true,
                        "loaded": true
                    }, {
                        "id": "cat12",
                        "name": "Pricing",
                        "cls": "behavior-category",
                        "items": [{
                            "id": "61",
                            "name": "PricingRead",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 61,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "62",
                            "name": "PricingCreate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 62,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "63",
                            "name": "PricingUpdate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 63,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "64",
                            "name": "PricingDelete",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 64,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }],
                        "expanded": true,
                        "loaded": true
                    }, {
                        "id": "cat13",
                        "name": "Payment",
                        "cls": "behavior-category",
                        "items": [{
                            "id": "65",
                            "name": "PaymentRead",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 65,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "66",
                            "name": "PaymentCreate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 66,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "67",
                            "name": "PaymentUpdate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 67,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "68",
                            "name": "PaymentDelete",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 68,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }],
                        "expanded": true,
                        "loaded": true
                    }, {
                        "id": "cat14",
                        "name": "Cart",
                        "cls": "behavior-category",
                        "items": [{
                            "id": "69",
                            "name": "CartRead",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 69,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "70",
                            "name": "CartCreate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 70,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "71",
                            "name": "CartUpdate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 71,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "72",
                            "name": "CartDelete",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 72,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }],
                        "expanded": true,
                        "loaded": true
                    }, {
                        "id": "cat15",
                        "name": "Order",
                        "cls": "behavior-category",
                        "items": [{
                            "id": "73",
                            "name": "OrderRead",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 73,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "74",
                            "name": "OrderCreate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 74,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "75",
                            "name": "OrderUpdate",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 75,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "76",
                            "name": "OrderDelete",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 76,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "77",
                            "name": "OrderShip",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 77,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "78",
                            "name": "OrderCancel",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 78,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }, {
                            "id": "79",
                            "name": "OrderApplyPayment",
                            "cls": "behavior",
                            "checked": false,
                            "items": null,
                            "behaviorId": 79,
                            "roleId": 369,
                            "expanded": true,
                            "loaded": true,
                            "leaf ": true
                        }],
                        "expanded": true,
                        "loaded": true
                    }]
                }
            };

            store = Ext.create('Taco.store.shared.TreeStore', {
                model: 'Taco.model.Behavior',
                batchUpdateMode: "operation",
                defaultRootId: 0,
                nodeParam: 'nodeQuery',
                root: {
                    expanded: true
                },
                data: data['1']
            });

            return store;
        },

        getHandleEl: function (cmp, fieldName) {
            return cmp.getEl().down('[data-handle="' + fieldName + '"]');
        },

        selectHandleEl: function (cmp, fieldName) {
            return cmp.getEl().select('[data-handle="' + fieldName + '"]');
        },

        isHandleHtml: function (cmp, field, expected, desc, index) {
            var el,
                select,
                html;

            if (index) {
                select = this.selectHandleEl(cmp, field);
                html = select.elements[index].innerHTML;
            } else {
                el = this.getHandleEl(cmp, field);
                html = el.getHTML();
            }

            this.is(html, expected, desc);
        },

        isHandlePresent: function (cmp, fieldName, desc) {
            var el = this.getHandleEl(cmp, fieldName);

            this.is(!!el, true, desc);
        },

        isHandleNotPresent: function (cmp, fieldName, desc) {
            var el = this.getHandleEl(cmp, fieldName);

            this.is(!!el, false, desc);
        },

        isElementPresent: function (cmp, selector, desc) {
            var el = cmp.getEl().down(selector);

            this.is(!!el, true, desc);
        },

        isElementNotPresent: function (cmp, selector, desc) {
            var el = cmp.getEl().down(selector);

            this.is(!!el, false, desc);
        },

        isComponentVisible: function (cmp, desc) {
            this.is(!cmp.isHidden(), true, desc);
        },

        isComponentNotVisible: function (cmp, desc) {
            this.is(!cmp.isHidden(), false, desc);
        }
    }
});

var helpers = {
    isBuildTask: function(win) {
        return win.location.pathname.toLowerCase() === '/admin/tests/index.html';
    }
};
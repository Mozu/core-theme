StartTest(function(t) {

    // Simulate data for order store.
    t.simManager().register([
        {
            url: '/admin/app/order/list',
            jsonFile: '/admin/tests/mocks/Mystic1/Orders2Payments.json'
        }
    ]);

    // Load required Ext classes.
    t.wait('requirements');
    t.requireOk('Taco.store.Orders', "Taco.view.order.Grid", function() {
        t.endWait('requirements');
    });

    var orderStore, orderGrid;

    function getFilter() {
        var filter = orderStore.getProxy().extraParams.advancedSearch;
        return (filter === undefined) ? filter : JSON.parse(filter);
    }

    function setup(t) {
        var nextStep;

        t.chain(
            function(next) {
                // Dump the grid.
                Taco.app.contentView.removeAll(true);

                // Dump the store.
                if (orderStore) {
                    // Proxy is defined by Order model and houses the filter parameters for the store.
                    orderStore.getProxy().extraParams = undefined;
                    Ext.destroy(orderStore);
                }
                orderStore = Ext.create('Taco.store.Orders', {
                    //data: [ /* order data */ ],
                    //proxy: {
                    //    type: 'memory',
                    //    reader: { type: 'json', root: 'items' }
                    //} // kill the ajax proxy so the paging toolbar won't reload and wipe out the test data.
                });

                orderGrid = Ext.create('Taco.view.order.Grid', {
                    //renderTo: Ext.getBody(),
                    store: orderStore,
                    enableQuickFilters: true,
                    // Default column config instantiates a customer store to lookup customer names by id.
                    getColumnConfig: function() {
                        return [
                            {
                                stateId: 'orderNumber',
                                dataIndex: 'orderNumber',
                                text: 'Order Number',
                                flex: 1,
                                minWidth: 100,
                                width: 100
                            }, {
                                stateId: 'orderStatus',
                                dataIndex: 'orderStatus',
                                text: 'Order Status',
                                flex: 1,
                                minWidth: 100,
                                width: 100,
                                sortable: false
                            }, {
                                stateId: 'paymentStatus',
                                dataIndex: 'paymentStatus',
                                text: 'Payment Status',
                                flex: 1,
                                minWidth: 100,
                                width: 100
                            }, {
                                stateId: 'fulfillmentStatus',
                                dataIndex: 'fulfillmentStatus',
                                text: 'Fulfillment Status',
                                flex: 1,
                                minWidth: 100,
                                width: 100,
                                sortable: false
                            }, {
                                stateId: 'orderType',
                                text: 'Order Type',
                                dataIndex: "orderType",
                                flex: 1,
                                minWidth: 100,
                                width: 100,
                                sortable: true
                            }
                        ];
                    }
                });
                Taco.app.contentView.add(orderGrid);
                // Wait for the store to load and the grid to display the data.
                t.waitForRowsVisible(orderGrid, next);
                orderStore.load();
            },
            function() {
                // Done, continue with the parent chain.
                if (nextStep) {
                    nextStep();
                }
            }
        );

        // Provide a hook into the parent chain.
        return function(next) {
            nextStep = next;
        }
    }

    t.describe('Selecting express filters', function(t) {
        function testQuickFilter(t, quickFilterName, validateForm, validateFilterBox, validateStore) {
            // t should be the test instance from a "describe" function, i.e. the context of a BDD test suite.
            t.chain(
                setup(t),
                function(next) {
                    t.click(orderGrid.down('button#advancedFilter'), next);
                },
                function(next) {
                    t.click(orderGrid.down('form combo#quickFilter').el.down('.x-form-trigger'), next);
                },
                function(next) {
                    var quickFilterList = orderGrid.down('form combo#quickFilter').getPicker();
                    var openOrdersItem = quickFilterList.el.down(":nodeValue(" + quickFilterName + ")");
                    t.click(openOrdersItem, next);
                },
                function(next) {
                    t.it('should fill out the filter form', function(test) {
                        validateForm(test);
                        next();
                    });
                },
                function(next) {
                    var filterButton = orderGrid.down('window button[text="Filter"]');
                    t.click(filterButton, next);
                },
                function() {
                    t.it('should populate the filter box', function(test) {
                        validateFilterBox(test);
                    });
                    t.it('should update store filter', function(test) {
                        validateStore(test);
                    });
                    t.done();
                }
            );
        }

        t.describe('Open Orders', function(suite) {
            function validateForm(test) {
                test.is(orderGrid.down('form combo[name="orderStatus"]').getValue(), "Open", "Quick filter should update Order Status field.");
            }
            function validateFilterBox(test) {
                test.is(orderGrid.down('taco-quickfilter').value, "orderStatus:Open");
            }
            function validateStore(test) {
                test.isDeeplyStrict(getFilter(), { orderStatus: "Open" });
            }

            testQuickFilter(suite, "Open Orders", validateForm, validateFilterBox, validateStore);
        });

        t.describe('Unpaid Orders', function(suite) {
            function validateForm(test) {
                test.is(orderGrid.down('form combo[name="orderStatus"]').getValue(), "Open", "Quick filter should update Order Status field.");
                test.is(orderGrid.down('form combo[name="paymentStatus"]').getValue(), "Unpaid,Pending", "Quick filter should update Payment Status field.");
            }
            function validateFilterBox(test) {
                test.is(orderGrid.down('taco-quickfilter').value, "orderStatus:Open paymentStatus:Unpaid,Pending");
            }
            function validateStore(test) {
                test.isDeeplyStrict(getFilter(), { orderStatus: "Open", paymentStatus: "Unpaid,Pending" });
            }

            testQuickFilter(suite, "Unpaid Orders", validateForm, validateFilterBox, validateStore);
        });

        t.describe('Paid, Pending Fulfillment Orders', function(suite) {
            function validateForm(test) {
                test.is(orderGrid.down('form combo[name="paymentStatus"]').getValue(), "Paid", "Quick filter should update Payment Status field.");
                test.is(orderGrid.down('form combo[name="fulfillmentStatus"]').getValue(), "NotFulfilled", "Quick filter should update Fulfillment Status field.");
            }
            function validateFilterBox(test) {
                test.is(orderGrid.down('taco-quickfilter').value, "paymentStatus:Paid fulfillmentStatus:Not Fulfilled");
            }
            function validateStore(test) {
                test.isDeeplyStrict(getFilter(), { paymentStatus: "Paid", fulfillmentStatus: "NotFulfilled" });
            }

            testQuickFilter(suite, "Paid\\002c\\ Pending Fulfillment Orders", validateForm, validateFilterBox, validateStore); // 002c = unicode for comma.
        });

        t.describe('Pending Online Orders', function(suite) {
            function validateForm(test) {
                test.is(orderGrid.down('form combo[name="orderStatus"]').getValue(), "Pending", "Quick filter should update Order Status field.");
                test.is(orderGrid.down('form combo[name="orderType"]').getValue(), "Online", "Quick filter should update Order Type field.");
            }
            function validateFilterBox(test) {
                test.is(orderGrid.down('taco-quickfilter').value, "orderStatus:Pending orderType:Online");
            }
            function validateStore(test) {
                test.isDeeplyStrict(getFilter(), { orderStatus: "Pending", orderType: "Online" });
            }

            testQuickFilter(suite, "Pending Online Orders", validateForm, validateFilterBox, validateStore);
        });

        t.describe('Pending Offline Orders', function(suite) {
            function validateForm(test) {
                test.is(orderGrid.down('form combo[name="orderStatus"]').getValue(), "Pending", "Quick filter should update Order Status field.");
                test.is(orderGrid.down('form combo[name="orderType"]').getValue(), "Offline", "Quick filter should update Order Type field.");
            }
            function validateFilterBox(test) {
                test.is(orderGrid.down('taco-quickfilter').value, "orderStatus:Pending orderType:Offline");
            }
            function validateStore(test) {
                test.isDeeplyStrict(getFilter(), { orderStatus: "Pending", orderType: "Offline" });
            }

            testQuickFilter(suite, "Pending Offline Orders", validateForm, validateFilterBox, validateStore);
        });

        t.describe('Fulfilled Orders', function(suite) {
            function validateForm(test) {
                test.is(orderGrid.down('form combo[name="fulfillmentStatus"]').getValue(), "Fulfilled", "Quick filter should update Fulfillment Status field.");
            }
            function validateFilterBox(test) {
                test.is(orderGrid.down('taco-quickfilter').value, "fulfillmentStatus:Fulfilled");
            }
            function validateStore(test) {
                test.isDeeplyStrict(getFilter(), { fulfillmentStatus: "Fulfilled" });
            }

            testQuickFilter(suite, "Fulfilled Orders", validateForm, validateFilterBox, validateStore);
        });

        t.describe('Cancelled Orders', function(suite) {
            function validateForm(test) {
                test.is(orderGrid.down('form combo[name="orderStatus"]').getValue(), "Cancelled", "Quick filter should update Order Status field.");
            }
            function validateFilterBox(test) {
                test.is(orderGrid.down('taco-quickfilter').value, "orderStatus:Cancelled");
            }
            function validateStore(test) {
                test.isDeeplyStrict(getFilter(), { orderStatus: "Cancelled" });
            }

            testQuickFilter(suite, "Cancelled Orders", validateForm, validateFilterBox, validateStore);
        });

        t.describe('Errored Orders', function(suite) {
            function validateForm(test) {
                test.is(orderGrid.down('form combo[name="orderStatus"]').getValue(), "Errored", "Quick filter should update Order Status field.");
            }
            function validateFilterBox(test) {
                test.is(orderGrid.down('taco-quickfilter').value, "orderStatus:Errored");
            }
            function validateStore(test) {
                test.isDeeplyStrict(getFilter(), { orderStatus: "Errored" });
            }

            testQuickFilter(suite, "Errored Orders", validateForm, validateFilterBox, validateStore);
        });

        t.describe('All Orders', function(suite) {
            function validateForm(test) {
                test.is(orderGrid.down('form combo[name="orderStatus"]').getValue(), null, "Quick filter should clear Order Status field.");
                test.is(orderGrid.down('form combo[name="paymentStatus"]').getValue(), null, "Quick filter should clear Payment Status field.");
                test.is(orderGrid.down('form combo[name="fulfillmentStatus"]').getValue(), null, "Quick filter should clear Fulfillment Status field.");
            }
            function validateFilterBox(test) {
                test.is(orderGrid.down('taco-quickfilter').value, "");
            }
            function validateStore(test) {
                test.is(getFilter(), undefined);
            }

            testQuickFilter(suite, "All Orders", validateForm, validateFilterBox, validateStore);
        });
    });

    t.describe('Filter form should allow you to filter by Abandoned Order Status', function(t) {
        t.chain(
            setup(t),
            function(next) {
                t.click(orderGrid.down('button#advancedFilter'), next);
            },
            function(next) {
                t.click(orderGrid.down('form combo[name="orderStatus"]').el.down('.x-form-trigger'), next);
            },
            function(next) {
                var orderStatusList = orderGrid.down('form combo[name="orderStatus"]').getPicker();
                t.it('should have an Abandoned option', function(test) {
                    test.isGreater(orderStatusList.el.query(":nodeValue(Abandoned)").length, 0);
                });
                var openOrdersItem = orderStatusList.el.down(":nodeValue(Abandoned)");
                t.click(openOrdersItem, next);
            },
            function(next) {
                var filterButton = orderGrid.down('window button[text="Filter"]');
                t.click(filterButton, next);
            },
            function() {
                t.it('should populate the filter box', function(test) {
                    test.is(orderGrid.down('taco-quickfilter').value, "orderStatus:Abandoned");
                });
                t.it('should update store filter', function(test) {
                    test.isDeeplyStrict(getFilter(), { orderStatus: "Abandoned" });
                });
                t.done();
            }
        );
    });

    t.describe('Specifying a query in the filter box', function(t) {
        t.it('should try to apply those values to the form fields', function(t) {
            t.chain(
                setup(t),
                function(next) {
                    // Values provided in HomePages/Mystic.html
                    var filter = "goggles " +
                        "firstName: John " +
                        "lastName: Doe " +
                        "emailAddress: jdoe@mozu.com " +
                        "site:MysticSports.Com " +
                        "orderStatus:Accepted " +
                        "paymentStatus:Unpaid " +
                        "fulfillmentStatus: NotFulfilled " +
                        "orderType: Online " + // Casing
                        //"channel:MyChannel " + // Need a channel
                        "minTotal:100 " +
                        "maxTotal:150 " +
                        "modifiedBy:Jordan Murphy " +
                        "modifiedFrom:2015-02-03T00:00:00-06:00 " +
                        "modifiedTo:2015-02-13T00:00:00-06:00";
                    t.type(orderGrid.down('taco-quickfilter'), filter, next);
                },
                function(next) {
                    t.click(orderGrid.down('button#advancedFilter'), next);
                },
                function(next) {
                    t.is(orderGrid.down('form textfield[name="keyword"]').getValue(), "goggles", "Keyword Search field should match query.");
                    t.is(orderGrid.down('form textfield[name="firstName"]').getValue(), "John", "Customer First Name field should match query.");
                    t.is(orderGrid.down('form textfield[name="lastName"]').getValue(), "Doe", "Customer Last Name field should match query.");
                    t.is(orderGrid.down('form textfield[name="emailAddress"]').getValue(), "jdoe@mozu.com", "Customer Email Address field should match query.");
                    t.is(orderGrid.down('form combo[name="site"]').getValue(), "4507", "Site field should match query.");
                    t.is(orderGrid.down('form combo[name="orderStatus"]').getValue(), "Accepted", "Order Status field should match query.");
                    t.is(orderGrid.down('form combo[name="paymentStatus"]').getValue(), "Unpaid", "Payment Status field should match query.");
                    t.is(orderGrid.down('form combo[name="fulfillmentStatus"]').getValue(), "NotFulfilled", "Fulfillment Status field should match query.");
                    t.is(orderGrid.down('form combo[name="orderType"]').getValue(), "Online", "Order Type field should match query.");
                    //t.is(orderGrid.down('form combo[name="channel"]').getValue(), "MyChannel", "Channel field should match query.");
                    t.is(orderGrid.down('form textfield[name="minTotal"]').getValue(), "100", "Total Price Range from field should match query.");
                    t.is(orderGrid.down('form textfield[name="maxTotal"]').getValue(), "150", "Total Price Range to field should match query.");
                    t.is(orderGrid.down('form combo[name="modifiedBy"]').getValue(), "df04d0b504ba4020904864cd09f10c70", "Modified By field should match query.");
                    t.is(orderGrid.down('form datefield[name="modifiedFrom"]').getValue(), new Date("2015-02-03T00:00:00-06:00"), "Modified Range from field should match query.");
                    t.is(orderGrid.down('form datefield[name="modifiedTo"]').getValue(), new Date("2015-02-13T00:00:00-06:00"), "Modified Range to field should match query.");
                }
            );
        });
    });

    t.describe('Filter form should populate the filter box with human-readable values', function(t) {
        function testComboHumanReadability(t, comboName, humanValue, queryValue) {
            t.chain(
                setup(t),
                function(next) {
                    t.click(orderGrid.down('button#advancedFilter'), next);
                },
                function(next) {
                    t.click(orderGrid.down('form combo[name="' + comboName + '"]').el.down('.x-form-trigger'), next);
                },
                function(next) {
                    var orderStatusList = orderGrid.down('form combo[name="' + comboName + '"]').getPicker();
                    t.it('Order Status should display human-readable options', function(test) {
                        test.isGreater(orderStatusList.el.query(":nodeValue(" + humanValue + ")").length, 0);
                    });
                    var openOrdersItem = orderStatusList.el.down(":nodeValue(" + humanValue + ")");
                    t.click(openOrdersItem, next);
                },
                function(next) {
                    t.waitFor(function() {
                        return orderGrid.down('taco-quickfilter').value.length > 0;
                    }, next);
                },
                function(next) {
                    t.it('Value change should auto-update the filter box with a human-readable value', function(test) {
                        test.is(orderGrid.down('taco-quickfilter').value, comboName + ":" + humanValue);
                    });
                    var filterButton = orderGrid.down('window button[text="Filter"]');
                    t.click(filterButton, next);
                },
                function() {
                    t.it('Filtering should populate the filter box with a human-readable value', function(test) {
                        test.is(orderGrid.down('taco-quickfilter').value, comboName + ":" + humanValue);
                    });
                    t.it('should update store filter with the query value', function(test) {
                        var expected = {};
                        expected[comboName] = queryValue;
                        test.isDeeplyStrict(getFilter(), expected);
                    });
                    t.done();
                }
            );
        };

        t.describe('Order Status', function(suite) {
            testComboHumanReadability(suite, 'orderStatus', 'Pending Review', 'PendingReview');
        });
        t.describe('Fulfillment Status', function(suite) {
            testComboHumanReadability(suite, 'fulfillmentStatus', 'Not Fulfilled', 'NotFulfilled');
        });
        t.describe('Site', function(suite) {
            testComboHumanReadability(suite, 'site', 'In Store Kiosk', 4508);
        });
        t.describe('Modified By', function(suite) {
            testComboHumanReadability(suite, 'modifiedBy', 'Jordan Murphy', 'df04d0b504ba4020904864cd09f10c70');
        });
    });

    // TODO: Test text > form conversion with space after key:, e.g. orderStatus: Open
    // TODO: Test text > form conversion for values with spaces, e.g. site:In Store Kiosk
    // TODO: Test text > form conversion for values with excessive spacing, e.g. site:  In  Store  Kiosk
    // TODO: Test text > store query conversion for display values, e.g. site:MysticSports.Com > site:4507
    // TODO: Test text > store query conversion for raw values, e.g. site:4507 > site:4507
});
describe('Mozu SDK', function () {

    // current service URLs
    var serviceUrls = {
        "ProductService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.ProductRuntime.WebApi/commerce/catalog/storefront/products/",
        "CartService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.CommerceRuntime.WebApi/commerce/carts/",
        "UserService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.User.WebApi/platform/user/accounts/",
        "OrderService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.CommerceRuntime.WebApi/commerce/orders/",
        "SearchService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.ProductRuntime.WebApi/commerce/catalog/storefront/productsearch/",
        "CmsService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.Content.WebApi/content/documents/",
        "ReferenceService": "http://aus01pdweb001.ads.volusion.com:9090/Mozu.reference.WebApi/platform/reference/"
    };

    var existingProductCode = "quux";

    Mozu.setServiceUrls(serviceUrls);

    it("should expose a Mozu object", function () {
        expect(Mozu).toBeDefined();
    });

    describe("the root object", function () {

        it("should have a Tenant function, a SiteGroup function and a Site function", function () {
            expect(typeof Mozu.Tenant).toBe("function");
            expect(typeof Mozu.Site).toBe("function");
            expect(typeof Mozu.SiteGroup).toBe("function");
        });

        it("should return an ApiContext from the Tenant, SiteGroup, and Site functions", function () {
            expect(Mozu.Tenant(1)).toBeDefined();
            expect(Mozu.Site(22)).toBeDefined();
            expect(Mozu.SiteGroup(22)).toBeDefined();
        });        it("should return an ApiContext from the single Store function", function () {
            expect(Mozu.Store({
                tenant: 1,
                site: 22,
                'site-group': 23
            })).toBeDefined();
        });
    });

    describe("the ApiContext object", function() {
        var tenant = Mozu.Tenant(1);
        
        it("should have a tenantId property matching its argument", function() {
            expect(tenant.tenant).toBe(1);
        });

        it("should have a Site and SiteGroup function", function () {
            expect(typeof tenant.Site).toBe("function");
            expect(typeof tenant.SiteGroup).toBe("function");
        });

        var site;
        it("should set the siteid with the site function", function () {
            site = tenant.Site(2);
            expect(site.site).toBe(2);
        });

        it("should persist tenantId after siteId is set", function () {
            expect(site.tenant).toBe(1);
        });

        it("should be able to initialize from a conf object as well", function () {
            expect(Mozu.Store({ 'tenant': 30001, 'site-group': 1, 'site': 30002 }).api()).toBeTruthy();
        });
    });
    
    describe("ApiInterface object", function () {
        var completeContext = Mozu.Tenant(30001).SiteGroup(1).Site(30002);
        var noTenantContext = Mozu.SiteGroup(1).Site(40000);
        var noSiteContext = Mozu.Tenant(30000).SiteGroup(1);
        var noSiteGroupContext = Mozu.Tenant(30000).Site(1);
        //var noHostContext = Mozu.Tenant(4000).SiteGroup(1).Site(2);

        it("should be returned by the 'api' method of a complete ApiContext", function () {
            expect(completeContext.api()).toBeDefined();
        });

        it("should error when any of tenant, site, or sitegroup are not supplied", function () {
            expect(noTenantContext.api).toThrow();
            expect(noSiteContext.api).toThrow();
            expect(noSiteGroupContext.api).toThrow();
        });

        var api = completeContext.api();


        it("should have request, get, update, create, and delete methods", function () {
            expect(typeof api.request).toBe("function");
            expect(typeof api.get).toBe("function");
            expect(typeof api.update).toBe("function");
            expect(typeof api.create).toBe("function");
            expect(typeof api.del).toBe("function");
        });

        it("should have .on, .off, and .fire methods for event pub/sub", function() {
            expect(typeof api.on).toBe("function");
            expect(typeof api.off).toBe("function");
            expect(typeof api.fire).toBe("function");
        });

        describe("has an api.request method, that", function () {
            var req;
            it("should run an ajax request", function () {
                spyOn(Mozu.Utils, 'ajax').andCallThrough();

                req = api.request('GET', serviceUrls.ProductService);

                expect(Mozu.Utils.ajax).toHaveBeenCalled();
            });

            it("should return a Promises/A compliant interface", function () {
                expect(Mozu.Utils.when.isPromise(req)).toBeTruthy();
            });

            it("should send the JSON response to the .then handler of the promise", function () {
                var req, res;
                runs(function () {
                    req = api.request('GET', serviceUrls.ProductService);
                    req.then(function () {
                        console.log(arguments);
                        res = arguments[0];
                    });
                });

                waitsFor(function () {
                    return res;
                }, 'The api request has returnes a truthy response', 20000);

                runs(function () {
                    expect(JSON.stringify(res)).toBeTruthy();
                });
            });

            it("should cause a 'request' event from the api object when it is called, supplying an XHR, a cancelling function, a promise, and the original configuration of the request", function() {
                var xhr, canceller, promise, reqConf, returnedPromise;                function onRequest(_xhr, _canceller, _promise, _reqConf) {
                    xhr = _xhr;
                    canceller = _canceller;
                    promise = _promise;
                    reqConf = _reqConf;
                }
                runs(function() {
                    api.on('request', onRequest);
                    returnedPromise = api.get('products');
                });

                waitsFor(function() {
                    return xhr;
                }, 20000);

                runs(function () {
                    api.off('request',onRequest);
                    expect(xhr instanceof XMLHttpRequest).toBeTruthy();
                    expect(typeof canceller).toBe("function");
                    expect(promise.then).toBeDefined();
                    expect(reqConf).toBeDefined();
                });

            });            describe("should supply a canceller function to 'request' handlers, that", function () {
                var xhr, canceller,
                    onRequest = function (_xhr, _canceller) {
                        xhr = _xhr;
                        canceller = _canceller;
                    },
                    p;

                api.on('request', onRequest);

                p = api.get("products");

                it("should cancel an outstanding XmlHttpRequest", function () {
                    expect(xhr.readyState).not.toBe(0);
                    canceller();
                    expect(xhr.readyState).toBe(0);
                });

                api.off('request', onRequest);
            });

        });
        
        describe("has an api.get method, that", function () {

            it("should work with shortcuts like 'products'", function () {
                var res;
                runs(function () {
                    api.get('products').then(function (products) {
                        res = products;
                    });
                });

                waitsFor(function () {
                    return res;
                }, 20000);

                runs(function () {
                    expect(res instanceof Mozu.ApiObject).toBeTruthy();
                });

            });
            
            it("should work with simple url templates, like 'product'", function () {
                var res;
                runs(function () {
                    api.get("product", { ProductCode: existingProductCode }).then(function (product) {
                        res = product;
                    });
                });

                waitsFor(function () {
                    return res;
                }, 20000);

                runs(function () {
                    expect(res.data.ProductCode).toBe(existingProductCode);
                });
            });

            it("should work with a simple string argument to the most commonly-used param searched upon", function () {
                var res;
                spyOn(Mozu.ApiReference, "getRequestConfig").andCallThrough();
                runs(function () {
                    api.get("product", existingProductCode).then(function (product) {
                        res = product;
                    });
                    expect(Mozu.ApiReference.getRequestConfig).toHaveBeenCalledWith("get", "product", existingProductCode, api.context);
                });

                waitsFor(function () {
                    return res;
                }, 20000);

                runs(function () {
                    expect(res.data.ProductCode).toBe(existingProductCode);
                });
            });

        });

        
        describe("has an \"error\" event for requests, that", function () {
            it("should fire when an XHR errors", function () {
                var error, xhr, conf;
                var onError = function (_error, _xhr, _conf) {
                    error = _error;
                    xhr = _xhr;
                    conf = _conf;
                };
                api.on('error', onError);

                runs(function () {
                    api.request('A_BAD_URL', {});
                });

                waitsFor(function () {
                    return error;
                }, 20000);

                runs(function () {
                    api.off('error', onError);
                    expect(error.Items[0]).toBeDefined();
                    expect(xhr instanceof XMLHttpRequest).toBeTruthy();
                    expect(conf).toBeDefined();
                });
            });
        });



        describe("has an api.all method, that ", function () {

            var foo, cart;

            it("should make a bunch of API calls at once and return them all to a handler", function () {
                runs(
                    function () {
                        api.all(api.get('product', existingProductCode), api.get('cart')).spread(function (f, c) {
                            foo = f;
                            cart = c;
                        });
                    });

                waitsFor(function () {
                    return foo && cart;
                }), 20000;

                runs(function () {
                    expect(foo.type).toBe("product");
                    expect(cart.type).toBe("cart");
                });
            });
        });
        describe("has an api.steps method, that", function () {

            var product, cart, res;

            it("should make calls in sequence, passing the arguments from the previous call to the next one", function () {

                runs(function () {

                    api.steps(function () {
                        return api.get('product', existingProductCode);
                    }, function (foo) {
                        product = foo;
                        return api.get('cart');
                    }, function (c) {
                        cart = c;
                        return cart.action('empty');
                    }, function (emptyCart) {
                        expect(cart.data.Items.length).toBe(0);
                        return cart.action('addProduct', {
                            Product: product.data,
                            Quantity: 1
                        });
                    }, function (cartItem) {
                        return cart.get()
                    }, function (newCart) {
                        res = newCart;
                    });

                });

                waitsFor(function () { return res; }, 20000);

                runs(function () {
                    expect(res.data.Items.length).toBe(1);
                    expect(res.data.Items[0].Product.ProductCode).toBe(existingProductCode);
                });

            });
        });
        describe("fulfills its promises with an ApiObject object, that", function () {
            
            var res;
            var product, cart;

            it("should contain the original json at a 'data' property", function () {
                var p, rawJSON;
                function getJSON(raw) {
                    rawJSON = raw;
                }
                runs(function () {
                    api.on('success', getJSON);
                    api.get('product', existingProductCode).then(function (foo) {
                        p = foo;
                    });
                });
                waitsFor(function () {
                    return p;
                }, 20000);
                runs(function () {
                    api.off('success', getJSON);
                    expect(p.data).toEqual(rawJSON);
                });
            });

            describe("should have a prop method that", function () {
                var p;
                beforeEach(function () {
                    runs(function () {
                        api.get('product', existingProductCode).then(function (foo) {
                            p = foo;
                        })
                    });
                    waitsFor(function () {
                        return p;
                    });
                });
                afterEach(function () {
                    p = null;
                });
                it("gets underlying properties from the raw JSON", function () {
                    expect(p.prop("ProductCode")).toEqual(p.data.ProductCode);
                });
                it("sets single underlying properties from the raw JSON", function () {
                    var newName = p.prop("ProductName") + "_MODIFIED";
                    p.prop("ProductName", newName);
                    expect(p.data.ProductName).toBe(newName);
                });
                it("sets multiple underlying properties from the raw JSON", function () {
                    var newStuff = {
                        ProductName: p.prop("ProductName") + "_MODIFIED",
                        ProductCode: p.prop("ProductCode") + "_MODIFIED"
                    };
                    p.prop(newStuff);
                    expect(p.data.ProductName).toBe(newStuff.ProductName);
                    expect(p.data.ProductCode).toBe(newStuff.ProductCode);
                });
                
            });
            
            

            it("should have an actions method that peforms common actions for the object type", function () {
                runs(function () {

                    api.get('product', existingProductCode).then(function (foo) {
                        product = foo;
                        return api.get('cart')
                    }).then(function (c) {
                        cart = c;
                        return cart.action('empty');
                    }).then(function (emptyCart) {
                        cart = emptyCart;
                        expect(cart.data.Items.length).toBe(0);
                        return cart.action('addProduct', {
                            Product: product.data,
                            Quantity: 1
                        })
                    }).then(function (cartItem) {
                        return cart.action('get');
                    }).then(function (newCart) {
                        res = newCart;
                    });
                });

                waitsFor(function () {
                    return res;
                }, 20000);

                runs(function () {
                    expect(res.data.Items.length).toBe(1);
                    expect(res.data.Items[0].Product.ProductCode).toBe(existingProductCode);
                });
                    
            });

            it("should have a getAvailableActions method that returns all actions that can be performed on this resource", function () {
                expect(res.getAvailableActions()).toContain("empty");
            });

            it("should create dummy ApiObjects with no data if you set the third 'isRemote' argument to false", function () {
                var p, dummyProduct, m;                spyOn(Mozu.Utils, 'ajax').andCallThrough();

                p = api.get('product', existingProductCode, false).then(function (product) {
                    m = "promise resolves immediately";
                    dummyProduct = product;
                });
                expect(m).toBe("promise resolves immediately");
                expect(Mozu.Utils.ajax).not.toHaveBeenCalled();
                expect(dummyProduct.action).toBeTruthy();
            });

            it("should throw an 'action' event when you successfully run an action method and a 'sync' event if self-updating", function () {
                var p, actionName, requestConf, syncEventCalled;
                api.get('product', existingProductCode, false).then(function (dummyProduct) {
                    p = dummyProduct;
                });
                p.on('action', function (_a, _r) {
                    actionName = _a;
                    requestConf = _r;
                });
                p.on('sync', function () {
                    syncEventCalled = true;
                });
                p.get();
                waitsFor(function () {
                    return syncEventCalled;
                }, 20000);
                runs(function () {
                    expect(actionName).toBe('get');
                    expect(requestConf).not.toBeTruthy();
                    expect(syncEventCalled).toBeTruthy();
                });
            });

            it("should, instead of updating itself, create new ApiObjects of a different type for some actions, and throw a 'spawn' event", function () {
                var res, spawnEventThrown, onSpawn = function () {
                    spawnEventThrown = true;
                };
                runs(function () {
                    cart.on('spawn', onSpawn);
                    cart.action('addProduct', {
                        Product: product.data,
                        Quantity: 3
                    }).then(function (cartItem) {
                        res = cartItem;
                    });
                });

                waitsFor(function () { return res; }, 20000);

                runs(function () {
                    cart.off('spawn', onSpawn);
                    expect(res.type).toBe('cartitem');
                });
            });

            describe("should, for collections returned by the API, be of a special ApiCollection type, that", function () {
                var productsCollection, origLen, newItems = [{}, {}, {}, {}, {}];
                beforeEach(function() {
                    api.get("products").then(function (p) {
                        productsCollection = p;
                        origLen = p.length;
                    });
                    waitsFor(function() {
                        return productsCollection;
                    });
                })
                afterEach(function () {
                    productsCollection = null;
                });
                it("should have an \"isCollection\" flag set to true", function () {
                    expect(productsCollection.isCollection).toBeTruthy();
                });
                it("should be an array-like object with a length property", function () {
                    expect(productsCollection.length).toBeDefined();
                });
                it("should have a complex type property and a string itemType property, for the collection type and the type of its items", function() {
                    expect(typeof productsCollection.type).toBe("object");
                    expect(typeof productsCollection.itemType).toBe("string");
                });
                it("should have an .add method that adds new items", function () {
                    expect(typeof productsCollection.add).toBe("function");
                });
                it("should increase in length when items are added", function() {
                    productsCollection.add(newItems);
                    expect(productsCollection.length).toBe(origLen + newItems.length);
                });
                it("should contain items of its item type", function() {
                    productsCollection.add(newItems);
                    expect(productsCollection[0] instanceof Mozu.ApiObject).toBeTruthy();
                    expect(productsCollection[0].type).toBe(productsCollection.itemType);
                });
                it("should increment its underlying data.Items property to stay in sync when items are added", function () {
                    expect(productsCollection.length).toEqual(productsCollection.prop("Items").length);
                    productsCollection.add(newItems);
                    expect(productsCollection.length).toEqual(productsCollection.prop("Items").length);
                });
            });
            
        });
        
    });

});
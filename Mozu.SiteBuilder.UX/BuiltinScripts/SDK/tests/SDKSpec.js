describe('Mozu SDK', function () {

    // current service URLs
    var ServiceUrls = {
        BadUrl: 'A_BAD_URL',
        "ProductService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.ProductRuntime.WebApi/commerce/catalog/storefront/products/",
        "CartService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.CommerceRuntime.WebApi/commerce/carts/",
        "UserService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.User.WebApi/platform/user/accounts/",
        "OrderService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.CommerceRuntime.WebApi/commerce/orders/",
        "SearchService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.ProductRuntime.WebApi/commerce/catalog/storefront/productsearch/",
        "CmsService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.Content.WebApi/content/documents/",
        "ReferenceService": "http://aus01pdweb001.ads.volusion.com:9090/Mozu.reference.WebApi/platform/reference",
        "UnknownService": "http://aus01pdweb001.ads.volusion.com:9090/Mozu.unknown.WebApi/"
    };

    Mozu.setServiceUrls(ServiceUrls);

    var Fixtures = {
        SampleProductCollection: {
            Items: [
                {
                    ProductCode: 'hi!'
                }
            ]
        },
        SampleProductCode: "Sample",
        SampleProduct: {
            ProductCode: "Sample"
        },
        SampleCart: {
            Items: [
                {
                    Id: 'kashgdakjshdgakjdhgaksjdgh',
                    Product: {
                        ProductCode: 'hai'
                    }
                } 
            ],
            Total: 200
        },
        SampleUnknownType: {
            someProp: "someValue"
        }
    };

    var server;
    
    before(function () {
        server = sinon.fakeServer.create();
        // TODO: add all respondWiths

        server.respondWith('GET', new RegExp(ServiceUrls.ProductService + "\?.*"), JSON.stringify(Fixtures.SampleProductCollection));
        server.respondWith('GET', ServiceUrls.ProductService + Fixtures.SampleProductCode, JSON.stringify(Fixtures.SampleProduct));
        server.respondWith('GET', ServiceUrls.CartService + "current", JSON.stringify(Fixtures.SampleCart));
        server.respondWith('GET', ServiceUrls.UnknownService, JSON.stringify(Fixtures.SampleUnknownType));
        server.respondWith('GET', new RegExp(ServiceUrls.BadUrl), [404, {}, ""]);

        server.autoRespond = true; 
    });

    after(function () {
        server.restore();
    });
    

    it("should expose a Mozu object (in a non-AMD env)", function () {
        expect(Mozu).to.not.be.undefined;
    });

    describe("the root object", function () {

        it("should be an ApiContext object", function () {
            expect(Mozu).to.be.an.instanceof(Mozu.ApiContext);
        });

        it("should have functions to establish context", function () {
            expect(Mozu.Tenant).to.be.a('function');
            expect(Mozu.Site).to.be.a('function');
            expect(Mozu.SiteGroup).to.be.a('function');
            expect(Mozu.Store).to.be.a('function');
            expect(Mozu.UserClaims).to.be.a('function');
        });

        it("should return an ApiContext from the Tenant, SiteGroup, and Site functions", function () {
            expect(Mozu.Tenant(1)).to.be.an.instanceof(Mozu.ApiContext);
            expect(Mozu.Site(22)).to.be.an.instanceof(Mozu.ApiContext);
            expect(Mozu.SiteGroup(22)).to.be.an.instanceof(Mozu.ApiContext);
        });        it("should expose a Store function that can set all these properties in an object-initializer style", function () {
            expect(Mozu.Store({
                tenant: 1,
                site: 22,
                'site-group': 23
            })).to.be.an.instanceof(Mozu.ApiContext);
        });
    });

    describe("the ApiContext object", function() {
        var tenant = Mozu.Tenant(1);
        
        it("should have a tenantId property matching its argument", function() {
            expect(tenant.tenant).to.equal(1);
        });

        var site;
        it("should set the siteid with the site function", function () {
            site = tenant.Site(2);
            expect(site.site).to.equal(2);
        });

        it("should persist tenantId after siteId is set", function () {
            expect(site.tenant).to.equal(1);
        });

        it("should be able to initialize from a conf object as well", function () {
            expect(Mozu.Store({ 'tenant': 30001, 'site-group': 1, 'site': 30002 })).to.satisfy(function (context) {
                return context.Tenant() === 30001 && context.SiteGroup() === 1 && context.Site() === 30002;
            });
        });
    });
    
    describe("ApiInterface object", function () {
        var completeContext = Mozu.Tenant(30001).SiteGroup(1).Site(30002);
        var noTenantContext = Mozu.SiteGroup(1).Site(40000);
        var noSiteContext = Mozu.Tenant(30000).SiteGroup(1);
        var noSiteGroupContext = Mozu.Tenant(30000).Site(1);
        //var noHostContext = Mozu.Tenant(4000).SiteGroup(1).Site(2);

        it("should be returned by the 'api' method of a complete ApiContext", function () {
            expect(completeContext.api()).to.be.an.instanceof(Mozu.ApiInterface);
        });

        it("should error when any of tenant, site, or sitegroup are not supplied", function () {
            expect(function () { return noTenantContext.api(); }).to.throw(/no tenant/i);
            expect(function () { return noSiteContext.api(); }).to.throw(/no site/i);
            expect(function () { return noSiteGroupContext.api(); }).to.throw(/no site group/i);
        });

        var api = completeContext.api();

        it("should have request, get, update, create, and delete methods", function () {
            expect(api.request).to.be.a("function");
            expect(api.get).to.be.a("function");
            expect(api.update).to.be.a("function");
            expect(api.create).to.be.a("function");
            expect(api.del).to.be.a("function");
        });

        it("should have .on, .off, and .fire methods for event pub/sub", function() {
            expect(api.on).to.be.a("function");
            expect(api.off).to.be.a("function");
            expect(api.fire).to.be.a("function");
        });

        it("should have a reference to its context at .context", function() {
            expect(api.context).to.equal(completeContext);
        });

        describe("has an api.request method, that", function () {
            var req;

            before(function () {
                sinon.spy(Mozu.Utils, 'ajax');
            });

            after(function () {
                Mozu.Utils.ajax.restore();
            });

            it("should run an ajax request", function () {
                req = api.request('GET', ServiceUrls.ProductService);
                expect(Mozu.Utils.ajax).to.have.been.calledOnce;
            });

            it("should return a Promises/A compliant interface", function () {
                expect(req).to.satisfy(Mozu.Utils.when.isPromiseLike);
            });

            it("should fulfill the promise with the JSON returned from the service", function () {
                return expect(api.request("GET", ServiceUrls.ProductService)).to.become(Fixtures.SampleProductCollection);
            });


            it("should cause a 'request' event from the api object when it is called, supplying an XHR, a cancelling function, a promise, and the original configuration of the request", function (done) {
                var requestConf = {
                    url: ServiceUrls.ProductService
                };
                function onRequest(xhr, canceller, promise, reqConf) {
                    api.off('request',onRequest);
                    expect(xhr).to.have.property('status'); // since this is a fake XHR we can't do much more than duck test it
                    expect(canceller).to.be.a("function");
                    expect(promise).to.satisfy(Mozu.Utils.when.isPromiseLike);
                    expect(reqConf).to.equal(requestConf);
                    done();
                }
                api.on('request', onRequest);
                api.request("GET", requestConf);
            });            it("should fail a promise when requests fail", function () {
                return expect(api.request('GET', ServiceUrls.BadUrl, {})).to.be.rejected;
            });

            describe("should supply a canceller function to 'request' handlers, that", function () {
                it("should cancel an outstanding XmlHttpRequest", function (done) {
                    var onRequest = function (xhr, canceller) {
                        expect(xhr.readyState).not.to.equal(0);
                        canceller();
                        expect(xhr.readyState).to.equal(0);
                        done();
                    }
                    api.on('request', onRequest);
                    api.request("GET", ServiceUrls.ProductService);
                    api.off('request', onRequest);
                });
            });

        });
        
        describe("has an api.get method, that", function () {

            beforeEach(function () {
                sinon.spy(Mozu.Utils, "ajax");
                sinon.spy(Mozu.ApiReference, "getRequestConfig");

            });

            afterEach(function () {
                Mozu.Utils.ajax.restore();
                Mozu.ApiReference.getRequestConfig.restore();
            });

            it("should work with shortcuts like 'products'", function () {
                var promise = api.get('products');

                return Mozu.Utils.when.all([
                    expect(promise).to.be.fulfilled,
                    expect(promise).to.eventually.be.an.instanceof(Mozu.ApiCollection),
                    expect(promise).to.eventually.have.property("type", "products"),
                    promise.then(function(products) {
                        expect(products).to.have.property("data").that.is.deep.equal(Fixtures.SampleProductCollection);
                    })
                ]);

            });
          
            it("should work with simple url templates, like 'product'", function () {

                var promise = api.get('product', { ProductCode: Fixtures.SampleProductCode });

                expect(Mozu.ApiReference.getRequestConfig).to.have.been.calledWith("get", "product", { ProductCode: Fixtures.SampleProductCode }, api.context);
                expect(Mozu.Utils.ajax).to.have.been.calledWithMatch(/GET/, new RegExp(ServiceUrls.ProductService + Fixtures.SampleProductCode + ".*"));

                return Mozu.Utils.when.all([
                    expect(promise).to.be.fulfilled,
                    expect(promise).to.eventually.be.an.instanceof(Mozu.ApiObject),
                    expect(promise).to.eventually.have.property("type", "product"),
                    promise.then(function (product) {
                        expect(product).to.have.property("data").that.is.deep.equal(Fixtures.SampleProduct);
                    })
                ]);
                
            });

            it("should work with a simple string argument to the most commonly-used param searched upon", function () {
                
                var promise = api.get("product", Fixtures.SampleProductCode);

                expect(Mozu.ApiReference.getRequestConfig).to.have.been.calledWith("get", "product", Fixtures.SampleProductCode, api.context);
                expect(Mozu.Utils.ajax).to.have.been.calledWithMatch(/GET/, new RegExp(ServiceUrls.ProductService + Fixtures.SampleProductCode + ".*"));

                return Mozu.Utils.when.all([
                      expect(promise).to.be.fulfilled,
                      expect(promise).to.eventually.be.an.instanceof(Mozu.ApiObject),
                      expect(promise).to.eventually.have.property("type", "product"),
                      promise.then(function (product) {
                          expect(product).to.have.property("data").that.is.deep.equal(Fixtures.SampleProduct);
                      })
                ]);

            });

            it("should work with carts", function () {
                var promise = api.get("cart");

                expect(Mozu.ApiReference.getRequestConfig).to.have.been.calledWith("get", "cart", undefined, api.context);
                expect(Mozu.Utils.ajax).to.have.been.calledWithMatch(/GET/, new RegExp(ServiceUrls.CartService + "current"));

                return Mozu.Utils.when.all([
                      expect(promise).to.be.fulfilled,
                      expect(promise).to.eventually.be.an.instanceof(Mozu.ApiObject),
                      expect(promise).to.eventually.have.property("type", "cart"),
                      promise.then(function (product) {
                          expect(product).to.have.property("data").that.is.deep.equal(Fixtures.SampleCart);
                      })
                ]);
            });

        });

        
        describe("has an \"error\" event for requests, that", function () {
            it("should fire when an XHR errors", function (done) {
                var onError = function (error, xhr, conf) {
                    api.off('error', onError);
                    expect(error).to.have.deep.property("Items[0]");
                    expect(xhr).to.have.property("status");
                    expect(conf).to.be.ok;
                    done();
                };
                api.on('error', onError);
                api.request('GET', ServiceUrls.BadUrl, {});
            });
        });

        describe("has an api.all method, that ", function () {
        
            var foo, cart;
        
            it("should make a bunch of API calls at once and return them all to a handler", function (done) {
                return api.all(api.get('product', Fixtures.SampleProductCode), api.get('cart')).spread(function (f, c) {
                    expect(f).to.be.an.instanceof(Mozu.ApiObject).and.to.have.property('type', 'product').and.to.have.deep.property('data', Fixtures.SampleProduct);
                    expect(c).to.be.an.instanceof(Mozu.ApiObject).and.to.have.property('type', 'cart').and.to.have.property('data', Fixtures.SampleCart);
                    done();
                }).otherwise(done);
            });
        });


        //describe("has an api.steps method, that", function () {

        //    var product, cart, res;

        //    it("should make calls in sequence, passing the arguments from the previous call to the next one", function () {

        //        runs(function () {

        //            api.steps(function () {
        //                return api.get('product', existingProductCode);
        //            }, function (foo) {
        //                product = foo;
        //                return api.get('cart');
        //            }, function (c) {
        //                cart = c;
        //                return cart.action('empty');
        //            }, function (emptyCart) {
        //                expect(cart.data.Items.length).toBe(0);
        //                return cart.action('addProduct', {
        //                    Product: product.data,
        //                    Quantity: 1
        //                });
        //            }, function (cartItem) {
        //                return cart.get()
        //            }, function (newCart) {
        //                res = newCart;
        //            });

        //        });

        //        waitsFor(function () { return res; }, 3000);

        //        runs(function () {
        //            expect(res.data.Items.length).toBe(1);
        //            expect(res.data.Items[0].Product.ProductCode).toBe(existingProductCode);
        //        });

        //    });
        //});
        //describe("fulfills its promises with an ApiObject object, that", function () {
            
        //    var res;
        //    var product, cart;

        //    it("should contain the original json at a 'data' property", function () {
        //        var p, rawJSON;
        //        function getJSON(raw) {
        //            rawJSON = raw;
        //        }
        //        runs(function () {
        //            api.on('success', getJSON);
        //            api.get('product', existingProductCode).then(function (foo) {
        //                p = foo;
        //            });
        //        });
        //        waitsFor(function () {
        //            return p;
        //        }, 3000);
        //        runs(function () {
        //            api.off('success', getJSON);
        //            expect(p.data).toEqual(rawJSON);
        //        });
        //    });

        //    describe("should have a prop method that", function () {
        //        var p;
        //        beforeEach(function () {
        //            runs(function () {
        //                api.get('product', existingProductCode).then(function (foo) {
        //                    p = foo;
        //                })
        //            });
        //            waitsFor(function () {
        //                return p;
        //            });
        //        });
        //        afterEach(function () {
        //            p = null;
        //        });
        //        it("gets underlying properties from the raw JSON", function () {
        //            expect(p.prop("ProductCode")).toEqual(p.data.ProductCode);
        //        });
        //        it("sets single underlying properties from the raw JSON", function () {
        //            var newName = p.prop("ProductName") + "_MODIFIED";
        //            p.prop("ProductName", newName);
        //            expect(p.data.ProductName).toBe(newName);
        //        });
        //        it("sets multiple underlying properties from the raw JSON", function () {
        //            var newStuff = {
        //                ProductName: p.prop("ProductName") + "_MODIFIED",
        //                ProductCode: p.prop("ProductCode") + "_MODIFIED"
        //            };
        //            p.prop(newStuff);
        //            expect(p.data.ProductName).toBe(newStuff.ProductName);
        //            expect(p.data.ProductCode).toBe(newStuff.ProductCode);
        //        });
                
        //    });
            
            

        //    it("should have an actions method that peforms common actions for the object type", function () {
        //        runs(function () {

        //            api.get('product', existingProductCode).then(function (foo) {
        //                product = foo;
        //                return api.get('cart')
        //            }).then(function (c) {
        //                cart = c;
        //                return cart.action('empty');
        //            }).then(function (emptyCart) {
        //                cart = emptyCart;
        //                expect(cart.data.Items.length).toBe(0);
        //                return cart.action('addProduct', {
        //                    Product: product.data,
        //                    Quantity: 1
        //                })
        //            }).then(function (cartItem) {
        //                return cart.action('get');
        //            }).then(function (newCart) {
        //                res = newCart;
        //            });
        //        });

        //        waitsFor(function () {
        //            return res;
        //        }, 3000);

        //        runs(function () {
        //            expect(res.data.Items.length).toBe(1);
        //            expect(res.data.Items[0].Product.ProductCode).toBe(existingProductCode);
        //        });
                    
        //    });

        //    it("should have a getAvailableActions method that returns all actions that can be performed on this resource", function () {
        //        expect(res.getAvailableActions()).toContain("empty");
        //    });

        //    it("should create dummy ApiObjects with no data if you set the third 'isRemote' argument to false", function () {
        //        var p, dummyProduct, m;
        //        p = api.get('product', existingProductCode, false).then(function (product) {
        //            m = "promise resolves immediately";
        //            dummyProduct = product;
        //        });
        //        expect(m).toBe("promise resolves immediately");
        //        expect(Mozu.Utils.ajax).not.toHaveBeenCalled();
        //        expect(dummyProduct.action).toBeTruthy();
        //    });

        //    it("should throw an 'action' event when you successfully run an action method and a 'sync' event if self-updating", function () {
        //        var p, actionName, requestConf, syncEventCalled;
        //        api.get('product', existingProductCode, false).then(function (dummyProduct) {
        //            p = dummyProduct;
        //        });
        //        p.on('action', function (_a, _r) {
        //            actionName = _a;
        //            requestConf = _r;
        //        });
        //        p.on('sync', function () {
        //            syncEventCalled = true;
        //        });
        //        p.get();
        //        waitsFor(function () {
        //            return syncEventCalled;
        //        }, 3000);
        //        runs(function () {
        //            expect(actionName).toBe('get');
        //            expect(requestConf).not.toBeTruthy();
        //            expect(syncEventCalled).toBeTruthy();
        //        });
        //    });

        //    it("should, instead of updating itself, create new ApiObjects of a different type for some actions, and throw a 'spawn' event", function () {
        //        var res, spawnEventThrown, onSpawn = function () {
        //            spawnEventThrown = true;
        //        };
        //        runs(function () {
        //            cart.on('spawn', onSpawn);
        //            cart.action('addProduct', {
        //                Product: product.data,
        //                Quantity: 3
        //            }).then(function (cartItem) {
        //                res = cartItem;
        //            });
        //        });

        //        waitsFor(function () { return res; }, 3000);

        //        runs(function () {
        //            cart.off('spawn', onSpawn);
        //            expect(res.type).toBe('cartitem');
        //        });
        //    });

        //    describe("should, for collections returned by the API, be of a special ApiCollection type, that", function () {
        //        var productsCollection, origLen, newItems = [{}, {}, {}, {}, {}];
        //        beforeEach(function() {
        //            api.get("products").then(function (p) {
        //                productsCollection = p;
        //                origLen = p.length;
        //            });
        //            waitsFor(function() {
        //                return productsCollection;
        //            });
        //        })
        //        afterEach(function () {
        //            productsCollection = null;
        //        });
        //        it("should have an \"isCollection\" flag set to true", function () {
        //            expect(productsCollection.isCollection).toBeTruthy();
        //        });
        //        it("should be an array-like object with a length property", function () {
        //            expect(productsCollection.length).toBeDefined();
        //        });
        //        it("should have a string type property and a string itemType property, for the collection type and the type of its items", function() {
        //            expect(typeof productsCollection.type).toBe("string");
        //            expect(typeof productsCollection.itemType).toBe("string");
        //        });
        //        it("should have an .add method that adds new items", function () {
        //            expect(typeof productsCollection.add).toBe("function");
        //        });
        //        it("should increase in length when items are added", function() {
        //            productsCollection.add(newItems);
        //            expect(productsCollection.length).toBe(origLen + newItems.length);
        //        });
        //        it("should contain items of its item type", function() {
        //            productsCollection.add(newItems);
        //            expect(productsCollection[0] instanceof Mozu.ApiObject).toBeTruthy();
        //            expect(productsCollection[0].type).toBe(productsCollection.itemType);
        //        });
        //        it("should increment its underlying data.Items property to stay in sync when items are added", function () {
        //            expect(productsCollection.length).toEqual(productsCollection.prop("Items").length);
        //            productsCollection.add(newItems);
        //            expect(productsCollection.length).toEqual(productsCollection.prop("Items").length);
        //        });
        //    });
            
        //});
        
    });

});
describe('Mozu SDK', function () {

    // current service URLs
    Mozu.setServiceUrls({
        "ProductService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.ProductRuntime.WebApi/commerce/catalog/storefront/products/",
        "CartService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.Cart.WebApi/commerce/carts/",
        "UserService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.User.WebApi/platform/user/accounts/",
        "OrderService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.Order.WebApi/commerce/orders/",
        "SearchService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.ProductRuntime.WebApi/commerce/catalog/storefront/productsearch/",
        "CmsService": "http://aus01pdweb001.ads.volusion.com:9090/mozu.Content.WebApi/content/documents/",
        "ReferenceService": "http://aus01pdweb001.ads.volusion.com:9090/Mozu.reference.WebApi/platform/reference/"
    });

    it("should expose a Mozu object", function () {
        expect(Mozu).toBeDefined();
    });

    describe("the root object", function () {

        it("should have a Tenant function, a SiteGroup function and a Site function", function () {
            //expect(typeof Mozu.Host).toBe("function");
            expect(typeof Mozu.Tenant).toBe("function");
            expect(typeof Mozu.Site).toBe("function");
            expect(typeof Mozu.SiteGroup).toBe("function");
        });

        it("should return an ApiContext from the Tenant, SiteGroup, and Site functions", function () {
            expect(Mozu.Tenant(1)).toBeDefined();
            //expect(Mozu.Host('flarp')).toBeDefined();
            expect(Mozu.Site(22)).toBeDefined();
            expect(Mozu.SiteGroup(22)).toBeDefined();
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
    
    describe("the ApiInterface object", function () {
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

        describe("the api.request method", function () {
            var req;
            it("should run an ajax request from the request method", function () {
                spyOn(Mozu.Utils, 'ajax').andCallThrough();

                req = api.request('GET', 'http://aus01pdweb001.ads.volusion.com:9090/mozu.ProductRuntime.WebApi/products');

                expect(Mozu.Utils.ajax).toHaveBeenCalled();
            });

            it("should return a Promises/A compliant interface from the request method", function () {
                expect(Mozu.Utils.when.isPromise(req)).toBeTruthy();
            });

            it("should send the JSON response to the .then handler of the promise", function () {
                var req, res;
                runs(function () {
                    req = api.request('GET', 'http://aus01pdweb001.ads.volusion.com:9090/mozu.ProductRuntime.WebApi/products/foobar');
                    req.then(function () {
                        console.log(arguments);
                        res = arguments[0];
                    });
                });

                waitsFor(function () {
                    return res;
                }, 'The api request has returnes a truthy response', 10000);

                runs(function () {
                    expect(JSON.stringify(res)).toBeTruthy();
                });
            });
        });
        
        describe("the api.get method", function () {

            it("should work with shortcuts like 'products'", function () {
                var res;
                runs(function () {
                    api.get('products').then(function (products) {
                        res = products;
                    });
                });

                waitsFor(function () {
                    return res;
                });

                runs(function () {
                    expect(res instanceof Mozu.ApiReference.ApiObject).toBeTruthy();
                });

            });
            
            it("should work with simple url templates, like 'product'", function () {
                var res;
                runs(function () {
                    api.get("product", { ProductCode: "foobar" }).then(function (product) {
                        res = product;
                    });
                });

                waitsFor(function () {
                    return res;
                });

                runs(function () {
                    expect(res.data.ProductCode).toBe("foobar");
                });
            });

            it("should work with the shortcut string to the main path param", function () {
                var res;
                spyOn(Mozu.ApiReference, "getRequestConfig").andCallThrough();
                runs(function () {
                    api.get("product", "foobar").then(function (product) {
                        res = product;
                    });
                    expect(Mozu.ApiReference.getRequestConfig).toHaveBeenCalledWith("get", "product", "foobar", api.context);
                });

                waitsFor(function () {
                    return res;
                });

                runs(function () {
                    expect(res.data.ProductCode).toBe("foobar");
                });
            });

        });

        describe("the .all method of the api interface", function () {

            var foobar, cart;

            it("should make a bunch of API calls at once and return them all to a handler", function () {
                runs(
                    function () {
                        api.all(api.get('product', 'foobar'), api.get('cart')).spread(function (f, c) {
                            foobar = f;
                            cart = c;
                        });
                    });

                waitsFor(function () {
                    return foobar && cart;
                });

                runs(function () {
                    expect(foobar.type).toBe("product");
                    expect(cart.type).toBe("cart");
                });
            });
        });

        describe("the .steps method of the api interface", function () {

            var product, cart, res;

            it("should make calls in sequence, passing the arguments from the previous call to the next one", function () {

                runs(function () {

                    api.steps(function () {
                        return api.get('product', 'foobar');
                    }, function (foobar) {
                        product = foobar;
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

                waitsFor(function () { return res; });

                runs(function () {
                    expect(res.data.Items.length).toBe(1);
                    expect(res.data.Items[0].Product.ProductCode).toBe("foobar");
                });

            });
        });

        describe("the ApiObject returned by the api interface", function() {
            
            var res;
            var product, cart;

            it("should have an actions method that peforms common actions for the object type", function () {
                runs(function () {

                    api.get('product', 'foobar').then(function (foobar) {
                        product = foobar;
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
                });

                runs(function () {
                    expect(res.data.Items.length).toBe(1);
                    expect(res.data.Items[0].Product.ProductCode).toBe("foobar");
                });
                    
            });
            it("should have a getAvailableActions method that returns all actions that can be performed on this resource", function () {
                expect(res.getAvailableActions()).toContain("empty");
            });

            it("should return an API object of a different type for some actions", function () {
                var res;
                runs(function () {
                    cart.action('addProduct', {
                        Product: product.data,
                        Quantity: 3
                    }).then(function (cartItem) {
                        res = cartItem;
                    });
                });

                waitsFor(function () { return res; });

                runs(function () {
                    expect(res.type).toBe('cartitem');
                });
            });
        });

    });
    

});
describe('Mozu SDK', function () {

    it("should expose a Mozu object", function () {
        expect(Mozu).toBeDefined();
    });

    describe("the root object", function () {

        it("should have a Tenant function, a Host function and a Site function", function () {
            expect(typeof Mozu.Host).toBe("function");
            expect(typeof Mozu.Tenant).toBe("function");
            expect(typeof Mozu.Site).toBe("function");
        });

        it("should return an ApiContext from the Host, Tenant and Site functions", function () {
            expect(Mozu.Tenant(1)).toBeDefined();
            expect(Mozu.Host('flarp')).toBeDefined();
            expect(Mozu.Site(22)).toBeDefined();
        });
    });

    describe("the ApiContext object", function() {
        var tenant = Mozu.Tenant(1);
        
        it("should have a tenantId property matching its argument", function() {
            expect(tenant.tenant).toBe(1);
        });

        it("should have a Site and Host function", function () {
            expect(typeof tenant.Site).toBe("function");
            expect(typeof tenant.Host).toBe("function");
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
            expect(Mozu.Store({ 'tenant': 30001, 'site-group': 1, 'site': 30002, 'host': 'http://aus01pdweb001.ads.volusion.com:9090/' }).api()).toBeTruthy();
        });
    });
    
    describe("the ApiInterface object", function () {
        var completeContext = Mozu.Host('http://aus01pdweb001.ads.volusion.com:9090/').Tenant(30001).SiteGroup(1).Site(30002);
        var noTenantContext = Mozu.Host('derp').SiteGroup(1).Site(40000);
        var noSiteContext = Mozu.Host('derp').Tenant(30000).SiteGroup(1);
        var noSiteGroupContext = Mozu.Host('derp').Tenant(30000).Site(1);
        var noHostContext = Mozu.Tenant(4000).SiteGroup(1).Site(2);

        it("should be returned by the 'api' method of a complete ApiContext", function () {
            expect(completeContext.api()).toBeDefined();
        });

        it("should error when any of tenant, site, or host are not supplied", function () {
            expect(noTenantContext.api).toThrow();
            expect(noSiteContext.api).toThrow();
            expect(noSiteGroupContext.api).toThrow();
            expect(noHostContext.api).toThrow();
        });

        var api = completeContext.api();


        it("should have request, get, update, create, and delete methods", function () {
            expect(typeof api.request).toBe("function");
            expect(typeof api.get).toBe("function");
            expect(typeof api.update).toBe("function");
            expect(typeof api.create).toBe("function");
            expect(typeof api.delete).toBe("function");
        });

        describe("the api.request method", function () {
            var req;
            it("should run an ajax request from the request method", function () {
                spyOn(Mozu.Utils, 'ajax').andCallThrough();

                req = api.request('GET', 'mozu.ProductRuntime.WebApi/products');

                expect(Mozu.Utils.ajax).toHaveBeenCalled();
            });

            it("should return a Promises/A compliant interface from the request method", function () {
                expect(Mozu.Utils.when.isPromise(req)).toBeTruthy();
            });

            it("should send the JSON response to the .then handler of the promise", function () {
                var req, res;
                runs(function () {
                    req = api.request('GET', 'mozu.ProductRuntime.WebApi/products/foobar');
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
                    expect(res.Items).toBeTruthy();
                });

            });
            
            it("should work with simple url templates, like 'product'", function () {
                var res;
                runs(function () {
                    api.get("product", { productCode: "foobar" }).then(function (product) {
                        res = product;
                    });
                });

                waitsFor(function () {
                    return res;
                });

                runs(function () {
                    expect(res.ProductCode).toBe("foobar");
                });
            });
            it("should work with the shortcut string to the main path param", function () {
                var res;
                spyOn(Mozu.ApiReference, "getUrlFor").andCallThrough();
                runs(function () {
                    api.get("product", "foobar").then(function (product) {
                        res = product;
                    });
                    expect(Mozu.ApiReference.getUrlFor).toHaveBeenCalledWith("get", "product", "foobar", api.context);
                });

                waitsFor(function () {
                    return res;
                });

                runs(function () {
                    expect(res.ProductCode).toBe("foobar");
                });
            });
        });

    });
    

});
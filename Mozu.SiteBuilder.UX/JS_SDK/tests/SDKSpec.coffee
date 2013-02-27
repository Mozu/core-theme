describe "Mozu SDK", ->
  it "should expose a Mozu object", ->
    expect(Mozu).toBeDefined()

  describe "the root object", ->
    it "should have a Tenant function, a Host function and a Site function", ->
      expect(typeof Mozu.Host).toBe "function"
      expect(typeof Mozu.Tenant).toBe "function"
      expect(typeof Mozu.Site).toBe "function"

    it "should return an ApiContext from the Host, Tenant and Site functions", ->
      expect(Mozu.Tenant(1)).toBeDefined()
      expect(Mozu.Host("flarp")).toBeDefined()
      expect(Mozu.Site(22)).toBeDefined()


  describe "the ApiContext object", ->
    tenant = Mozu.Tenant(1)
    it "should have a tenantId property matching its argument", ->
      expect(tenant.tenant).toBe 1

    it "should have a Site and Host function", ->
      expect(typeof tenant.Site).toBe "function"
      expect(typeof tenant.Host).toBe "function"

    site = undefined
    it "should set the siteid with the site function", ->
      site = tenant.Site(2)
      expect(site.site).toBe 2

    it "should persist tenantId after siteId is set", ->
      expect(site.tenant).toBe 1

    it "should be able to initialize from a conf object as well", ->
      expect(Mozu.Store(
        tenant: 30001
        "site-group": 1
        site: 30002
        host: "http://aus01pdweb001.ads.volusion.com:9090/"
      ).api()).toBeTruthy()


  describe "the ApiInterface object", ->
    completeContext = Mozu.Host("http://aus01pdweb001.ads.volusion.com:9090/").Tenant(30001).SiteGroup(1).Site(30002)
    noTenantContext = Mozu.Host("derp").SiteGroup(1).Site(40000)
    noSiteContext = Mozu.Host("derp").Tenant(30000).SiteGroup(1)
    noSiteGroupContext = Mozu.Host("derp").Tenant(30000).Site(1)
    noHostContext = Mozu.Tenant(4000).SiteGroup(1).Site(2)
    it "should be returned by the 'api' method of a complete ApiContext", ->
      expect(completeContext.api()).toBeDefined()

    it "should error when any of tenant, site, or host are not supplied", ->
      expect(noTenantContext.api).toThrow()
      expect(noSiteContext.api).toThrow()
      expect(noSiteGroupContext.api).toThrow()
      expect(noHostContext.api).toThrow()

    api = completeContext.api()
    it "should have request, get, update, create, and delete methods", ->
      expect(typeof api.request).toBe "function"
      expect(typeof api.get).toBe "function"
      expect(typeof api.update).toBe "function"
      expect(typeof api.create).toBe "function"
      expect(typeof api.remove).toBe "function"

    describe "the api.request method", ->
      req = undefined
      it "should run an ajax request from the request method", ->
        spyOn(Mozu.Utils, "ajax").andCallThrough()
        req = api.request("GET", "mozu.ProductRuntime.WebApi/products")
        expect(Mozu.Utils.ajax).toHaveBeenCalled()

      it "should return a Promises/A compliant interface from the request method", ->
        expect(Mozu.Utils.when.isPromise(req)).toBeTruthy()

      it "should send the JSON response to the .then handler of the promise", ->
        req = undefined
        res = undefined
        runs ->
          req = api.request("GET", "mozu.ProductRuntime.WebApi/products/foobar")
          req.then ->
            console.log arguments_
            res = arguments_[0]


        waitsFor (->
          res
        ), "The api request has returnes a truthy response", 10000
        runs ->
          expect(JSON.stringify(res)).toBeTruthy()



    describe "the api.get method", ->
      it "should work with shortcuts like 'products'", ->
        res = undefined
        runs ->
          api.get("products").then (products) ->
            res = products


        waitsFor ->
          res

        runs ->
          expect(res.Items).toBeTruthy()


      it "should work with simple url templates, like 'product'", ->
        res = undefined
        runs ->
          api.get("product",
            productCode: "foobar"
          ).then (product) ->
            res = product


        waitsFor ->
          res

        runs ->
          expect(res.ProductCode).toBe "foobar"


      it "should work with the shortcut string to the main path param", ->
        res = undefined
        spyOn(Mozu.ApiReference, "getUrlFor").andCallThrough()
        runs ->
          api.get("product", "foobar").then (product) ->
            res = product

          expect(Mozu.ApiReference.getUrlFor).toHaveBeenCalledWith "get", "product", "foobar", api.context

        waitsFor ->
          res

        runs ->
          expect(res.ProductCode).toBe "foobar"





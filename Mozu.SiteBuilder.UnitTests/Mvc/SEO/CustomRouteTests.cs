using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.SEO.Constraints;
using Mozu.SiteBuilder.Mvc.SEO.Mappings;
using NSubstitute;
using Mozu.MZDB.Contracts.Clients;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Should;
using Mozu.Core.Api.Contracts.Client;
using Mozu.MZDB.Contracts;
using System.Net.Http;
using System.Web.Http.Routing;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.Core;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.Core.Logging;
using System.Runtime.Caching;
using System.Web.Http.Dependencies;
using System.Web.Http.Hosting;
using Mozu.Content.Contracts;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using Mozu.Core.Extensions;
using Mozu.ProductRuntime.Contracts;
using Mozu.ProductRuntime.Contracts.Clients;
using Autofac;
using Autofac.Integration.WebApi;
using AutofacContrib.NSubstitute;
using AutoMapper;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.UX.Configuration;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using NSubstitute.Core;


namespace Mozu.SiteBuilder.UnitTests.Mvc.SEO
{
    [TestFixture, Category("CustomRoutes")]
    public class CustomRouteTests
    {
        [TestCaseSource("GoodCases")]
        public void FactoryCanMakeMappings(Mapping mapping, Type expectedType)
        {
            var entityListClient = Substitute.For<IEntityListsWebApiClient>();
            var factory = new RouteMappingFactory(entityListClient);
            var made = factory.BuildMapping(mapping);
            made.GetType().ShouldEqual(expectedType);
        }
        static IEnumerable<object[]> GoodCases()
        {
            var mapping1 = new Mapping { type = Mapping.TypeConst.facet, mapTo = "bar", facetId = "facet@mozu" };
            yield return new object[] { mapping1, typeof(FacetValueFilterMapping) };

            var mapping2 = new Mapping { type = Mapping.TypeConst.direct, mappings = new Dictionary<string, object> { { "butts", "lol" } } };
            yield return new object[] { mapping2, typeof(SiteBuilder.Mvc.SEO.Mappings.DirectMapping) };

            var mapping3 = new Mapping { type = Mapping.TypeConst.mzdb, docId = "blah@foo", listFqn = "sigh" };
            yield return new object[] { mapping3, typeof(MZDBMap) };
        }

        [TestCaseSource("MalformedCases")]
        public void MalformedMappingsBreak(Mapping mapping)
        {
            var entityListClient = Substitute.For<IEntityListsWebApiClient>();
            var factory = new RouteMappingFactory(entityListClient);
            Assert.Throws<ArgumentException>(() => factory.BuildMapping(mapping));

        }
        static IEnumerable<Mapping> MalformedCases()
        {
            var mapping1 = new Mapping { type = Mapping.TypeConst.facet, mapTo = "bar" };
            yield return mapping1;

            var mapping2 = new Mapping { type = Mapping.TypeConst.direct };
            yield return mapping2;

            var mapping3 = new Mapping { type = Mapping.TypeConst.mzdb, listFqn = "sigh" };
            yield return mapping3;
        }

        [TestCaseSource("HappyPathMappings")]
        [TestCaseSource("NoOpPathMappings")]
        public async Task MappersWork(IRouteDataMapping mapping, Dictionary<string, object> inputs, Dictionary<string, object> expectedOutput)
        {
            await mapping.Initialize();
            HttpRequestMessage reqMessage = new HttpRequestMessage(HttpMethod.Get, "http://localhost/foo"); ;
            reqMessage.SetRouteData(new HttpRouteData(new HttpRoute(), new HttpRouteValueDictionary()));
            var outputs = mapping.Map(reqMessage, inputs, "foo");
            outputs.SequenceEqual(expectedOutput).ShouldBeTrue();
        }

        static IEnumerable<object[]> HappyPathMappings()
        {
            yield return new object[] {
                new SiteBuilder.Mvc.SEO.Mappings.DirectMapping(new Mapping(){ mappings =new Dictionary<string, object> { { "red", "green" } }}),
                new Dictionary<string, object> { { "foo", "red" } },
                new Dictionary<string, object> { { "foo", "green" } }

            };

            //yield return new object[] {
            //    new FacetValueFilterMapping(new Mapping(){ facetId="foo"} ),
            //    new Dictionary<string, object> { { "foo", "mauve"}, },
            //    new Dictionary<string, object> { { "foo", "mauve" }, { "facetValueFilter", "mauve" } }};

            var entityClientMock = Substitute.For<IEntityListsWebApiClient, ICloneable>();
            (entityClientMock as ICloneable).Clone().Returns(entityClientMock);

            entityClientMock.GetEntity(Arg.Any<string>(), Arg.Any<string>()).Returns(ctx => Task.FromResult(new ServiceClientResponse<JObject>() { ReadAsSync = () => JObject.Parse("{\"red\":\"green\"}") }));
            yield return new object[] {
                new MZDBMap( entityClientMock , new Mapping (){ listFqn = "list", docId ="doc"}),
                 new Dictionary<string, object> { { "foo", "red" } },
                new Dictionary<string, object> { { "foo", "green" } }

            };
        }

        /// <summary>
        /// Tests that verify that a mapper does not make modifications to the route data if none of its configuration matches the data in the route data.
        /// </summary>
        /// <returns></returns>
        static IEnumerable<object[]> NoOpPathMappings()
        {
            yield return new object[] {
                new SiteBuilder.Mvc.SEO.Mappings.DirectMapping(new Mapping(){ mappings =new Dictionary<string, object> { { "foo", "bar" } }}),
                new Dictionary<string, object> { { "bar", 1234 } },
                new Dictionary<string, object> { { "bar", 1234 } }
            };

            yield return new object[] {
                new FacetValueFilterMapping(new Mapping(){ facetId ="color"}),
                new Dictionary<string, object> { { "foo", 1234 } },
                new Dictionary<string, object> { { "foo", 1234 } }
            };

            var entityClientMock = Substitute.For<IEntityListsWebApiClient, ICloneable>();
            (entityClientMock as ICloneable).Clone().Returns(entityClientMock);
            var obj = new JObject();
            obj["blah"] = "foo";

            entityClientMock.GetEntity(Arg.Any<string>(), Arg.Any<string>()).Returns(ctx => Task.FromResult(Response(obj)));
            yield return new object[] {
                new MZDBMap(entityClientMock, new Mapping(){ listFqn = "list", docId ="doc"}),
                new Dictionary<string, object> { { "butts", "lol" } },
                new Dictionary<string, object> { { "butts", "lol" } }
            };
        }


        [TestCaseSource("ConstraintTests")]
        public async Task ConstraintsWork(string parameterName, ICustomRouteConstraint constraint, Dictionary<string, object> inputs, bool routeShouldMatch)
        {
            var httpRoute = Substitute.For<IHttpRoute>();
            await constraint.Initialize();
            constraint.DoMatch(null, null, parameterName, inputs, HttpRouteDirection.UriResolution).ShouldEqual(routeShouldMatch);
        }

        static IEnumerable<object[]> ConstraintTests()
        {
            yield return new object[]
            {
                "designer",
                new StringListRouteConstraint(new List<string> {"once", "never", "always" }),
                new Dictionary<string, object> { { "designer", "once" } },
                true
            };

            yield return new object[]
            {
                "designer",
                new StringListRouteConstraint(new List<string> {"once", "never", "always" }),
                new Dictionary<string, object> { { "haha", "once" } },
                false
            };

            var attrClient = Substitute.For<IAttributeWebApiClient, ICloneable>();
            (attrClient as ICloneable).Clone().Returns(attrClient);
            var vocabs = new List<ProductAdmin.Contracts.AttributeVocabularyValue>{
                Vocab("meh"),
                Vocab("whatevs")
            };

            var searchClient = Substitute.For<IProductSearchWebApiClient, ICloneable>();
            (searchClient as ICloneable).Clone().Returns(searchClient);


            attrClient.GetAttributeVocabularyValues(Arg.Any<string>()).Returns(Task.FromResult(Response(vocabs)));
            searchClient.Search().ReturnsForAnyArgs(Task.FromResult(Response(new ProductRuntime.Contracts.ProductSearchResult()
            {
                Facets =
                new List<ProductRuntime.Contracts.Facet>() {
                    new ProductRuntime.Contracts.Facet() {
                        Values =new List<FacetValue>() {
                            new FacetValue() { Value ="bing"},
                            new FacetValue(){ Value ="bong" }
                            }
                    }
                }
            })));

            var context = Substitute.For<IApiContext>();
            context.LocaleCode.Returns("en-US");

            yield return new object[]
            {
                "param",
                new ProductAttributeRouteConstraint(attrClient, searchClient, context, "butts"),
                new Dictionary<string, object> { { "param", "meh" } },
                true
            };
            yield return new object[]
            {
                "param",
                new ProductAttributeRouteConstraint(attrClient, searchClient, context, "butts"),
                new Dictionary<string, object> { { "param", "bing" } },
                true
            };
            yield return new object[]
            {
                "param",
                new ProductAttributeRouteConstraint(attrClient, searchClient,context, "butts"),
                new Dictionary<string, object> { { "param", "sure" } },
                false
            };
            yield return new object[]
            {
                "param",
                new ProductAttributeRouteConstraint(attrClient, searchClient,context, "butts"),
                new Dictionary<string, object> { },
                false
            };

            var mzdbClient = Substitute.For<IEntityListsWebApiClient, ICloneable>();
            (mzdbClient as ICloneable).Clone().Returns(mzdbClient);
            var doc = new JObject();
            doc["myfield"] = "value!";
            var coll = new EntityCollection() { Items = new List<JObject> { doc }, TotalCount = 1, PageCount = 1, PageSize = 50, StartIndex = 0 };
            mzdbClient.GetEntities(Arg.Any<string>(), pageSize: Arg.Any<int?>(), startIndex: Arg.Any<int?>()).Returns(Task.FromResult(Response(coll)));
            yield return new object[]
            {
                "param",
                new MzdbRouteConstraint(mzdbClient, "mylist", null, "myfield"),
                new Dictionary<string, object> { {"param", "value!" } },
                true
            };

            yield return new object[]
            {
                "param",
                new MzdbRouteConstraint(mzdbClient, "mylist",null, "myfield"),
                new Dictionary<string, object> { {"param", "sigh" } },
                false
            };
            yield return new object[]
            {
                "param",
                new MzdbRouteConstraint(mzdbClient, "mylist", null,"myfield"),
                new Dictionary<string, object> { },
                false
            };
        }

        static ProductAdmin.Contracts.AttributeVocabularyValue Vocab(string value) {
            var content = new ProductAdmin.Contracts.AttributeVocabularyValueLocalizedContent() { LocaleCode = "en-US", StringValue = value };
            return new ProductAdmin.Contracts.AttributeVocabularyValue
            {
                Content = content,
                LocalizedContent = new List<ProductAdmin.Contracts.AttributeVocabularyValueLocalizedContent> { content },
                Value = value
            };
        }

        [TestCaseSource("ConstraintFactory")]
        public void FactoryCanMakeConstraints(Validator validator, Type expectedType)
        {
            var entityClient = Substitute.For<IEntityListsWebApiClient, ICloneable>();
            ((ICloneable)entityClient).Clone().Returns(entityClient);

            var fact = new ConstraintFactory(entityClient, Substitute.For<IAttributeWebApiClient>(), Substitute.For<IProductSearchWebApiClient>(), Substitute.For<IApiContext>());
            fact.BuildConstraint(validator).GetType().ShouldEqual(expectedType);
        }

        static IEnumerable<object[]> ConstraintFactory()
        {
            var attrConstraint = new Validator { type = Validator.TypeConst.attribute, attributeFQN = "attr" };
            yield return new object[] { attrConstraint, typeof(ProductAttributeRouteConstraint) };

            var mzdbConstraint = new Validator { type = Validator.TypeConst.mzdb, listFqn = "lol", field = "meh" };
            yield return new object[] { mzdbConstraint, typeof(MzdbRouteConstraint) };

            var listConstraint = new Validator { type = Validator.TypeConst.list, values = new List<string> { "one", "two", "three" } };
            yield return new object[] { listConstraint, typeof(StringListRouteConstraint) };
        }

        [Test]
        public async Task CanGetRouteCollectionFromSettingsDoc()
        {
            const int numRoutes = 1;
            var gensettings = new SiteSettings.General.Contracts.GeneralSettings
            {
                CustomRoutes = new CustomRouteSettings
                {
                    Routes = new List<Route>
                    {
                        new Route
                        {
                            Template = "a/{documentName}",
                            Defaults = new Dictionary<string, object>
                            {
                                { "documentList", "pages@Mozu" }
                            },
                            InternalRoute = FancyRoute.CmsPage.ToStringQuickly()
                        }
                    }
                },
                AuditInfo = new Core.Api.Contracts.AuditInfo()
                {
                    UpdateDate = DateTime.MinValue
                }
            };

            var sbapiContext = Substitute.For<ISiteBuilderApiContext>();
            var logger = Substitute.For<ILogger>();
            var cache = new MemoryCache("testcache");

            var entityListClient = Substitute.For<IEntityListsWebApiClient, ICloneable>();
            (entityListClient as ICloneable).Clone().Returns(entityListClient);
            var attrClient = Substitute.For<IAttributeWebApiClient, ICloneable>();
            (attrClient as ICloneable).Clone().Returns(attrClient);
            var searchClient = Substitute.For<IProductSearchWebApiClient, ICloneable>();
            (searchClient as ICloneable).Clone().Returns(searchClient);

            var siteSettingsClient = Substitute.For<IGeneralSettingsWebApiClient, ICloneable>();
            (siteSettingsClient as ICloneable).Clone().Returns(siteSettingsClient);
            siteSettingsClient.GetGeneralSettings().Returns(ctx => Task.FromResult(Response(gensettings)));

            var docListClient = Substitute.For<IDocumentListWebApiClient, ICloneable>();
            (docListClient as ICloneable).Clone().Returns(docListClient);

            var constraintFactory = new ConstraintFactory(entityListClient, attrClient, searchClient, sbapiContext);
            var mappingFactory = new RouteMappingFactory(entityListClient);
            var repo = new CustomRouteRepository(sbapiContext, logger, cache, constraintFactory, mappingFactory, siteSettingsClient, docListClient);

            var collection = await (repo as ICustomRouteCollectionRepository).GetHttpRouteCollection();
            collection.Count.ShouldEqual(numRoutes);
        }

        static ServiceClientResponse<T> Response<T>(T obj)
        {
            return new ServiceClientResponse<T>
            {
                HasException = false,
                ReadAsAsync = () => Task.FromResult(obj),
                ReadAsSync = () => obj,
                ReadException = () => null,
                ResponseMessage = new System.Net.Http.HttpResponseMessage(System.Net.HttpStatusCode.OK)
            };
        }
    }

    [TestFixture, Category("CustomRoutes")]
    public class BfCustomRouteTests
    {
        public class TestCase
        {
            public override string ToString()
            {
                return Name ?? Url;
         }
            public string Name { get; set; }
            public string Url { get; set; }

            public Action<CustomRouteHandler> RouteAction { get; set; }
            public Action<HttpRequestMessage > ValidateRequest { get; set; }
            public Action<CustomRoute> ValidateRoute{ get; set; }
            public Action <CustomRouteHandler , CategoryTree , Mozu.SiteBuilder.Mvc.Helpers.UrlHelper> DoLinkStuff { get; set; }

        }
        public IEnumerable<TestCase> GetTests()
        {
            yield return new TestCase()
            {
                Name = "sale sub cat",
                Url = "sale/women",
                ValidateRoute = route =>
                {
                    Assert.AreEqual(route.InternalRoute, FancyRoute.Category);
                   
                },
                ValidateRequest= req =>
                {
                    Assert.AreEqual((string)req.GetRouteData().Values["categorySlug"], "women");
                },
                DoLinkStuff= (handler, tree, urlhelper) =>
                {
                    var otherCat = tree.FindById(32);
                    var catMap = Mapper.Map<IDictionary<string, object>>(otherCat);
                    var url = handler.GetCanonicalUrl(FancyRoute.Category, () => catMap, true).Result;
                    Assert.AreEqual(url, "/sale/women/clothing/dresses");

                }
            };

            yield return new TestCase()
            {
                Name = "sale with filter clear",
                Url = "sale/women/diesel",
                ValidateRoute = route =>
                {
                    Assert.AreEqual(route.InternalRoute, FancyRoute.Category);

                },
                ValidateRequest = req =>
                {
                    Assert.AreEqual((string)req.GetRouteData().Values["categorySlug"], "women");
                },
                DoLinkStuff = (handler, tree, urlhelper) =>
                {
                    var clearLinks = urlhelper.MakeUrl(SiteBuilder.Mvc.Helpers.UrlHelper.UrlType.Facet, "clear", null, false);
                    Assert.AreEqual(clearLinks, "/sale/women");

                }
            };


      
            yield return new TestCase()
            {
                Name = "cat with facet",
                Url = "women?facetValueFilter=tenant~brand%3acitizens-of-humanity%2ctenant~brand%3adl1961-premium-denim",
                ValidateRoute = route =>
                {
                    Assert.AreEqual(route.InternalRoute, FancyRoute.Category);

                },
                ValidateRequest = req =>
                {
                    Assert.AreEqual((string)req.GetRouteData().Values["categorySlug"], "women");
                },
                DoLinkStuff = (handler, tree, urlhelper) =>
                {
                    var otherCat = tree.FindById(32);
                    var catMap = Mapper.Map<IDictionary<string, object>>(otherCat);
                    var url = handler.GetCanonicalUrl(FancyRoute.Category, () => catMap, true).Result;
                    Assert.AreEqual(url, "/women/clothing/dresses?facetValueFilter=tenant~brand:citizens-of-humanity,tenant~brand:dl1961-premium-denim");

                }
            };
        }
        [Test]
        [TestCaseSource("GetTests")]
        public void Run(TestCase test )
        {
            //  CustomRouteHandler handler = new CustomRouteHandler();

            
            Mapper.AddProfile<Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping.ProductMapping>();
            var subber = new AutofacContrib.NSubstitute.AutoSubstitute();
            subber.Provide<IRouteConfig>(new RouteConfig());
            var sbapiContext = subber.ResolveAndSubstituteFor<ISiteBuilderApiContext>();
            var pc = subber.ResolveAndSubstituteFor<IPageContext>();
         
            var logger = subber.ResolveAndSubstituteFor<ILogger>();
            var cache = new MemoryCache("testcache");
            subber.Provide<ObjectCache>(cache);
            
            HttpRequestMessage reqMessage = new HttpRequestMessage(HttpMethod.Get, "http://localhost/" + test.Url ); ;
            pc.Url.Returns(reqMessage.RequestUri.ToString());

         
            reqMessage.SetRouteData(new HttpRouteData(new HttpRoute(), new HttpRouteValueDictionary()));
            var sc = new SearchContext(reqMessage);
            pc.Search = sc;
            subber.Provide<HttpRequestMessage>(reqMessage);
            IDependencyScope scope = new AutofacWebApiDependencyScope(subber.Container);

            var lt=scope.GetRequestLifetimeScope();
            var xx=lt.Resolve<HttpRequestMessage>();

            reqMessage.Properties[HttpPropertyKeys.DependencyScope] = scope;



            InitServices(subber);

            subber.Provide<ICustomRouteConstraintFactory>(subber.Resolve<ConstraintFactory>());
            subber.Provide<IRouteDataMappingFactory>(subber.Resolve<RouteMappingFactory>());






            var custRepo = subber.ResolveAndSubstituteFor<CustomRouteRepository>();
            var lazyRepo = new Lazy<ICustomRouteCollectionRepository>(() => custRepo);
            subber.Provide<Lazy<ICustomRouteCollectionRepository>>(lazyRepo);



            var catTreeProvider = subber.ResolveAndSubstituteFor<RuntimeCategoryTreeProvider>();
            subber.Provide<ICategoryTreeProvider>(catTreeProvider);
            var yyy = lt.Resolve<ICategoryTreeProvider>();




            var catTree = catTreeProvider.GetAllCategories().Result;
            var customRouteRepo = subber.ResolveAndSubstituteFor<CustomRouteHandler>();
            subber.Provide<ICustomRouteHandler>(customRouteRepo);
            var urlHelper = subber.ResolveAndSubstituteFor<Mozu.SiteBuilder.Mvc.Helpers.UrlHelper>();



            customRouteRepo.RouteIncomingRequest();



            customRouteRepo.GetCanonicalUrl(FancyRoute.Category, () => new Dictionary<string, object>(), true);

            if (test.ValidateRequest != null)
            {
                test.ValidateRequest(reqMessage);
            }
            if (test.ValidateRoute != null)
            {
                test.ValidateRoute(reqMessage.GetRouteData().Route as CustomRoute);
            }

            if (test.DoLinkStuff != null)
            {
                test.DoLinkStuff(customRouteRepo, catTree, urlHelper );
            }

            
            
            

        }

        static T GetResource<T>(string name)
        {
            var ass = typeof(BfCustomRouteTests).Assembly;
            var rname = ass.GetManifestResourceNames().First(x => x.EndsWith(name+".json", StringComparison.OrdinalIgnoreCase));
            var str= ass.GetManifestResourceStream(rname);
            Newtonsoft.Json.JsonSerializer ser = new JsonSerializer();
            return ser.Deserialize<T>(new JsonTextReader(new StreamReader(str)));
            
        }

        void InitServices(AutoSubstitute subber)
        {
            var attrClient = Substitute.For<IAttributeWebApiClient, ICloneable>();
            (attrClient as ICloneable).Clone().Returns(attrClient);
            subber.Provide<IAttributeWebApiClient>(attrClient);


            attrClient.GetAttributeVocabularyValues(Arg.Any<string>()).ReturnsForAnyArgs(x =>
            {
                var att = (string)x.Args()[0];
                var res = Task.FromResult(Response(GetResource<List<ProductAdmin.Contracts.AttributeVocabularyValue>>("IAttributeWebApiClient.GetAttributeVocabularyValues." + att)));
                return res;
            });
            

            var searchClient = Substitute.For<IProductSearchWebApiClient, ICloneable>();
            (searchClient as ICloneable).Clone().Returns(searchClient);
            subber.Provide<IProductSearchWebApiClient>(searchClient);


       
            searchClient.Search().ReturnsForAnyArgs(x =>
            {
                var att =(string)x.Args()[4];
                var searchResult = Task.FromResult(Response(GetResource<ProductRuntime.Contracts.ProductSearchResult>("IProductSearchWebApiClient.Search."+ att)));
                return searchResult;
            });



          //  GetResource<ProductRuntime.Contracts.ProductSearchResult>("IProductSearchWebApiClient.Search." + x.Arg<string>()));
           
            //searchClient.Search(facet:"tenant~brand").Returns(Task.FromResult(Response(searchResultBrand)));
           // searchClient.Search(facet: "tenant~colorgroup").Returns(Task.FromResult(Response(searchResultColorGruop)));

            var catClient = Substitute.For<IProductCategoryRuntimeWebApiClient, ICloneable>();
            (catClient as ICloneable).Clone().Returns(catClient);
            subber.Provide<IProductCategoryRuntimeWebApiClient>(catClient);
            var catTree = GetResource<ProductRuntime.Contracts.CategoryCollection>("IProductCategoryRuntimeWebApiClient.GetCategoryTree");
            catClient.GetCategoryTree().ReturnsForAnyArgs(Task.FromResult(Response(catTree)));


            var docClient = Substitute.For<IDocumentListWebApiClient, ICloneable>();
            (docClient as ICloneable).Clone().Returns(docClient);
            subber.Provide<IDocumentListWebApiClient>(docClient);
           





            var genSettingsClient = Substitute.For<IGeneralSettingsWebApiClient, ICloneable>();
            (genSettingsClient as ICloneable).Clone().Returns(genSettingsClient);
            subber.Provide<IGeneralSettingsWebApiClient>(genSettingsClient);
            var genSettings = GetResource<SiteSettings.General.Contracts.GeneralSettings>("IGeneralSettingsWebApiClient.GetGeneralSettings");
            genSettingsClient.GetGeneralSettings(Arg.Any<string>(), Arg.Any<TargetContextLevelType>()).ReturnsForAnyArgs(Task.FromResult(Response(genSettings)));

        }

        static ServiceClientResponse<T> Response<T>(T obj)
        {
            return new ServiceClientResponse<T>
            {
                HasException = false,
                ReadAsAsync = () => Task.FromResult(obj),
                ReadAsSync = () => obj,
                ReadException = () => null,
                ResponseMessage = new System.Net.Http.HttpResponseMessage(System.Net.HttpStatusCode.OK)
            };
        }

    }
}



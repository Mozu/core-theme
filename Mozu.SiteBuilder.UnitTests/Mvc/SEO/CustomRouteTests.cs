using NUnit.Framework;
using System;
using System.Collections.Generic;
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
using Mozu.Content.Contracts;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using Mozu.Core.Extensions;

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

            var mapping2 = new Mapping { type = Mapping.TypeConst.direct, mappings = new Dictionary<string, string> { { "butts", "lol"} } };
            yield return new object[] { mapping2, typeof(SiteBuilder.Mvc.SEO.Mappings.DirectMapping) };

            var mapping3 = new Mapping { type = Mapping.TypeConst.mzdb, docId = "blah@foo", listName = "sigh" };
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

            var mapping2 = new Mapping { type = Mapping.TypeConst.direct};
            yield return mapping2;

            var mapping3 = new Mapping { type =  Mapping.TypeConst.mzdb, listName = "sigh" };
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
            outputs.SequenceEqual(expectedOutput);
        }

        static IEnumerable<object[]> HappyPathMappings()
        {
            yield return new object[] {
                new SiteBuilder.Mvc.SEO.Mappings.DirectMapping(new Mapping(){ mappings =new Dictionary<string, string> { { "foo", "bar" } }}),
                new Dictionary<string, object> { { "foo", 1234 }, { "butts", "lol" } },
                new Dictionary<string, object> { { "foo", 1234 }, { "butts", "lol" }, { "bar", 1234 } }};

            yield return new object[] {
                new FacetValueFilterMapping(new Mapping(){ facetId="color"} ),
                new Dictionary<string, object> { { "color", "mauve"}, { "foo", 1234 } },
                new Dictionary<string, object> { { "color", "mauve" }, { "foo", 1234 }, { "facetValueFilter", "mauve" } }};

            var entityClientMock = Substitute.For<IEntityListsWebApiClient, ICloneable>();
            (entityClientMock as ICloneable).Clone().Returns(entityClientMock);

            entityClientMock.GetEntity(Arg.Any<string>(), Arg.Any<string>()).Returns(ctx => Task.FromResult(new ServiceClientResponse<JObject>() { ReadAsSync = () => JObject.Parse("{\"blah\":\"foo\"}") }));
            yield return new object[] {
                new MZDBMap( entityClientMock , new Mapping (){ listName = "list", docId ="doc"}),
                new Dictionary<string, object> { { "blah", 1234 }, { "butts", "lol" } },
                new Dictionary<string, object> { { "blah", 1234 }, { "butts", "lol" }, { "foo", 1234 } }};
        }

        /// <summary>
        /// Tests that verify that a mapper does not make modifications to the route data if none of its configuration matches the data in the route data.
        /// </summary>
        /// <returns></returns>
        static IEnumerable<object[]> NoOpPathMappings()
        {
            yield return new object[] {
                new SiteBuilder.Mvc.SEO.Mappings.DirectMapping(new Mapping(){ mappings =new Dictionary<string, string> { { "foo", "bar" } }}),
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
                new MZDBMap(entityClientMock, new Mapping(){ listName = "list", docId ="doc"}),
                new Dictionary<string, object> { { "butts", "lol" } },
                new Dictionary<string, object> { { "butts", "lol" } }
            };
        }


        [TestCaseSource("ConstraintTests")]
        public async Task ConstraintsWork(string parameterName, ICustomRouteConstraint constraint, Dictionary<string, object> inputs, bool routeShouldMatch)
        {
            var httpRoute = Substitute.For<IHttpRoute>();
            await constraint.Initialize();
            constraint.DoMatch(null,null,parameterName, inputs,HttpRouteDirection.UriResolution).ShouldEqual(routeShouldMatch);
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

            attrClient.GetAttributeVocabularyValues(Arg.Any<string>()).Returns(Task.FromResult(Response(vocabs)));
            var context = Substitute.For<IApiContext>();
            context.LocaleCode.Returns("en-US");

            yield return new object[]
            {
                "param",
                new ProductAttributeRouteConstraint(attrClient, context, "butts"),
                new Dictionary<string, object> { { "param", "meh" } },
                true
            };
            yield return new object[]
            {
                "param",
                new ProductAttributeRouteConstraint(attrClient, context, "butts"),
                new Dictionary<string, object> { { "param", "sure" } },
                false
            };
            yield return new object[]
            {
                "param",
                new ProductAttributeRouteConstraint(attrClient, context, "butts"),
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
                new MzdbRouteConstraint(mzdbClient, "mylist", "myfield"),
                new Dictionary<string, object> { {"param", "value!" } },
                true
            };

            yield return new object[]
            {
                "param",
                new MzdbRouteConstraint(mzdbClient, "mylist", "myfield"),
                new Dictionary<string, object> { {"param", "sigh" } },
                false
            };
            yield return new object[]
            {
                "param",
                new MzdbRouteConstraint(mzdbClient, "mylist", "myfield"),
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
            var fact = new ConstraintFactory(Substitute.For<IEntityListsWebApiClient>(), Substitute.For<IAttributeWebApiClient>(), Substitute.For<IApiContext>());
            fact.BuildConstraint(validator).GetType().ShouldEqual(expectedType);
        }

        static IEnumerable<object[]> ConstraintFactory()
        {
            var attrConstraint = new Validator { type = Validator.TypeConst.attribute,attributeCode = "attr"};
            yield return new object[] { attrConstraint, typeof(ProductAttributeRouteConstraint) };

            var mzdbConstraint = new Validator { type = Validator.TypeConst.mzdb, listId = "lol", fieldId = "meh"};
            yield return new object[] { mzdbConstraint, typeof(MzdbRouteConstraint) };

            var listConstraint = new Validator {type = Validator.TypeConst.list, values = new List<string> {"one", "two", "three" } };
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
                    UpdateDate= DateTime.MinValue
                }
            };

            var sbapiContext = Substitute.For<ISiteBuilderApiContext>();
            var logger = Substitute.For<ILogger>();
            var cache = new MemoryCache("testcache");

            var entityListClient = Substitute.For<IEntityListsWebApiClient, ICloneable>();
            (entityListClient as ICloneable).Clone().Returns(entityListClient);
            var attrClient = Substitute.For<IAttributeWebApiClient, ICloneable>();
            (attrClient as ICloneable).Clone().Returns(attrClient);

            var siteSettingsClient = Substitute.For<IGeneralSettingsWebApiClient, ICloneable>();
            (siteSettingsClient as ICloneable).Clone().Returns(siteSettingsClient);
            siteSettingsClient.GetGeneralSettings().Returns(ctx => Task.FromResult(Response(gensettings)));

            var docListClient = Substitute.For<IDocumentListWebApiClient, ICloneable>();
            (docListClient as ICloneable).Clone().Returns(docListClient);

            var constraintFactory = new ConstraintFactory(entityListClient, attrClient, sbapiContext);
            var mappingFactory = new RouteMappingFactory(entityListClient);
            var repo = new SiteRouteRepository(sbapiContext, logger, cache, constraintFactory, mappingFactory, siteSettingsClient, docListClient);

            var collection = await (repo as ISiteRouteRepository).GetHttpRouteCollection();
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
}



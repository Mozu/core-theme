using System;
using System.Linq;
using System.Runtime.Caching;
using Mozu.Core;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers.AttributeHelpers;
using Mozu.SiteBuilder.UX.Admin.MockServices;
using NSubstitute;
using NUnit.Framework;
using Should;

namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api.Models.Attributes
{
    [TestFixture]
    public class MockAttributesTests
    {
        private AttributeController _attributeController;

        [SetUp]
        public void SetUp()
        {
            var ctx = Substitute.For<IApiContext>();
            var cache = new MemoryCache("derp");
            var attributeWebApiClient = new InMemoryAttributeWebApiClient(ctx, cache);
            _attributeController = new AttributeController(new AttributeHelper(attributeWebApiClient));
        }

        [Test]
        public void Mock_attributes_can_be_mapped()
        {
            var collection = _attributeController.ListAttributes(new PagingParamaters(), new FilterCollection()).Result;

            var attributes = collection.Items.Select(AutoMapper.Mapper.Map<ProductAdmin.Contracts.Attribute>);

            attributes.Count().ShouldEqual(collection.Items.Count);
        }
    }
}

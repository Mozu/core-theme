//using System;
//using System.Collections.Generic;
//using System.IO;
//using System.Net;
//using System.Net.Http;
//using NSubstitute;
//using NUnit.Framework;
//using Should;
//using Mozu.Core.Api.Contracts;
//using Mozu.Content.Contracts;
//using Mozu.Content.Contracts.Clients;
//using Mozu.SiteBuilder.Mvc;
//using Mozu.SiteBuilder.Mvc.CMS;

//namespace Mozu.SiteBuilder.IntegrationTests.Mvc.CMS
//{
//    [TestFixture]
//    public class ProvisionHelperTests
//    {
//        private int siteId = 1234567;
//        private ISiteBuilderContext _siteBuilderContext;
//        private IProvisioningWebApiClient _provisioningWebApiClient;
//        private List<ProvisionedFeature> _features;

//        [SetUp]
//        public void SetUp()
//        {
//            _siteBuilderContext = Substitute.For<ISiteBuilderContext>();
//            _provisioningWebApiClient = Substitute.For<IProvisioningWebApiClient>();
//            _features = new List<ProvisionedFeature> {new ProvisionedFeature {Name = "blog"}};
//            _siteBuilderContext.SiteId.Returns(siteId);
//        }

//        [Test]
//        public void ProvisionCms_should_provision_features_for_a_site_that_has_not_been_provisioned()
//        {
//            var helper = GetHelper();

//            _provisioningWebApiClient.WithAny(x => x.ProvisionFeatures(null, null), TestResponse.Void);

//            helper.ProvisionCms();

//            ProvisioningHelper.ProvisionedSites.ShouldContain(siteId);
//        }

//        [Test]
//        public void ProvisionCms_should_not_provision_features_for_a_site_that_has_already_been_provisioned()
//        {
//            ProvisioningHelper.ProvisionedSites.Add(siteId);
//            var helper = GetHelper();

//            helper.ProvisionCms();

//            _provisioningWebApiClient.DidNotReceiveWithAnyArgs().ProvisionFeatures(Arg.Any<FeatureProvisionMessage>(), Arg.Any<bool?>());
//            ProvisioningHelper.ProvisionedSites.ShouldContain(siteId);
//        }

//        [Test]
//        public void ProvisionCms_should_not_add_site_to_Provisioned_list_if_provision_features_fails()
//        {
//            var siteId = 42;
//            _provisioningWebApiClient.With(x => x.GetProvisionedFeatures(), new List<ProvisionedFeature>());
//            _provisioningWebApiClient.WithAny(x => x.ProvisionFeatures(null, null), TestResponse.Void);
//            var helper = GetHelper();

//            helper.ProvisionCms();

//            ProvisioningHelper.ProvisionedSites.ShouldNotContain(siteId);
//        }

//        [Test]
//        public void ProvisionCms_should_not_add_site_to_Provisioned_list_if_exception_is_thrown()
//        {
//            var siteId = 42;
//            _provisioningWebApiClient.ThrowsAny(x => x.GetProvisionedFeatures(), new OutOfMemoryException());

//            var helper = GetHelper();

//            Assert.Throws<OutOfMemoryException>(helper.ProvisionCms);

//            ProvisioningHelper.ProvisionedSites.ShouldNotContain(siteId);
//        }

//        private ProvisioningHelper GetHelper()
//        {
//            return new ProvisioningHelper(_provisioningWebApiClient, _siteBuilderContext);
//        }
//    }
//}


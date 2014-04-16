using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Web;
using Mozu.Core;
using Mozu.Core.Crypto;
using Mozu.SiteBuilder.UX.Admin.Api.Models.AppManagement;
using Mozu.SiteBuilder.UX.Admin.Helpers.SecurityHelpers;
using Mozu.Tenant.Contracts;
using NUnit.Framework;
using NSubstitute;

namespace Mozu.SiteBuilder.UnitTests.Admin.Api
{
    [TestFixture]
    public class SecureCapabilityConfigUrlTest
    {

        [TestCase("list", "e4b873aeb6da4964b14dac6747ceac2d", "https://parternship.com/mozu/register",
            "http://t-9582.mozu.com/admin/app/capabilities/list?_dc=1397148414568&page=1&start=0&limit=25",
            "https://mudflapuniverse.com/admin/app/capabilities/list?_dc=1397148414568&page=1&start=0&limit=25",
            "https://mudflapuniverse.com/admin/app/capabilities/edit/e4b873aeb6da4964b14dac6747ceac2d/#configure",
            9582, "mudflapuniverse.com", "readme")]
        [TestCase("edit", "e542ac2f762448f98daba24500cf49b4", "https://integrations1-hp.mozu-qa.com/Salesforce",
            "https://integrations1-hp.mozu-qa.com/Salesforce?tenantId=2544&messageHash=3lugj%2f9QiUJkGtAk5Ui9YxCMhcsjHUpR31iA2JmxFnw%3d&dt=Wed%2c+16+Apr+2014+18%3a51%3a39+GMT",
            "https://sb.mozu-qa.com/admin/app/capabilities/edit/e542ac2f762448f98daba24500cf49b4",
            "https://sb.mozu-qa.com/admin/app/capabilities/edit/e542ac2f762448f98daba24500cf49b4/#configure",
            2544, "t2544.sandbox.mozu-qa.com", "WLoltYBKbHCf5Kf/L8yY1sD33mnv8gdNzgrTP5fIwRg=")]
        [TestCase("#configure", "e542ac2f762448f98daba24500cf49b4", "https://integrations1-hp.mozu-qa.com/Salesforce",
            "https://integrations1-hp.mozu-qa.com/Salesforce?tenantId=2544&messageHash=3lugj%2f9QiUJkGtAk5Ui9YxCMhcsjHUpR31iA2JmxFnw%3d&dt=Wed%2c+16+Apr+2014+18%3a51%3a39+GMT",
            "https://sb.mozu-qa.com/admin/app/capabilities/edit/e542ac2f762448f98daba24500cf49b4/#configure",
            "https://sb.mozu-qa.com/admin/app/capabilities/edit/e542ac2f762448f98daba24500cf49b4/#configure",
            2544, "t2544.sandbox.mozu-qa.com", "WLoltYBKbHCf5Kf/L8yY1sD33mnv8gdNzgrTP5fIwRg=")]
        public void Given_ConfigUrl_And_SharedSecret_Should_Build_UrlParameters(string scenario, string capabilityId, 
            string configUrl, string reqUrl, string origUrl, string expectedRetUrl,
            int tenantId, string domain, string appHashKey)
        {
            //arrange
            var expectedBody = string.Format("x-vol-tenant-domain={0}&x-vol-return-url={1}", domain, expectedRetUrl);
            var sut = InitConfigUrlHelper(reqUrl, origUrl);
            var cap = CreateCapability(configUrl, appHashKey, capabilityId);
            var tenant = CreateTenant(tenantId, domain);

            //act
            var actual = sut.BuildSecureUrl(cap, tenant);
            Assert.IsNotNull(actual, scenario);

            var uri = new Uri(actual.UIConfigurationUrl);
            var qCollection = HttpUtility.ParseQueryString(uri.Query);
            var actualTenantId = qCollection.Get("tenantId");
            
            var actualDt = qCollection.Get("dt");
            
            var actualHash = HttpUtility.UrlEncode(qCollection.Get("messageHash"));
            var expectedHash = HttpUtility.UrlEncode(Sha256HashGenerator.Hash(appHashKey, actualDt + expectedBody));
            var expectedUrl = string.Format("{0}?tenantId={1}&messageHash={2}&dt={3}", configUrl, tenantId, 
                expectedHash, HttpUtility.UrlEncode(actualDt));
            
            //assert
            Assert.That(tenantId, Is.EqualTo(int.Parse(actualTenantId)));
            Assert.That(actualHash, Is.EqualTo(expectedHash), scenario);
            Assert.That(cap.UIConfigurationUrl, Is.EqualTo(expectedUrl), scenario);
            Assert.That(cap.TenantDomain, Is.EqualTo(domain), scenario);
            Assert.That(cap.ConfigReturnUrl, Is.EqualTo(expectedRetUrl), scenario);
            
        }

        
        [TestCase("sharedSecretHash")]
        public void When_SharedSecret_Then_ShouldEqualExpectedHashKey(string scenario)
        {
            //arrange
            var sharedSecret = "beeeb5b58bf046708a29a245009fc4f9";
            var expectedHashKey = "3FQ33qcG0iWx8Yq63Y7cZY8AnEUCMd7nu/b4qle+AaQ=";

            //act
            var actual = Sha256HashGenerator.Hash(sharedSecret, sharedSecret);

            //assert
            Assert.That(actual, Is.EqualTo(expectedHashKey), scenario);

        }

        [TestCase("1", "YVGhVJ3bkZ+HXNb3++dTN4M5/CQm3kIXS+i0Iwnbhh8=",
            "x-vol-tenant-domain=t2544.sandbox.mozu-qa.com&x-vol-return-url=https://t2544.sandbox.mozu-qa.com/admin/app/capabilities/edit/e542ac2f762448f98daba24500cf49b4/#configure",
            "Wed, 16 Apr 2014 17:10:03 GMT",
            "7eBePfIrs/w/LqKNTTmLFyjGFA+bDOmnsSMz29gGHKY=")]
        public void When_DateAndBodyAndAppHashKey_Then_ShouldReturnCorrectMsgHash(string scenario, string appHashKey, string body, string dt, string expectedHash)
        {
            //arrange

            //act
            var actualHashedMsg = Sha256HashGenerator.Hash(appHashKey, dt + body);

            //assert
            Assert.That(actualHashedMsg, Is.EqualTo(expectedHash), scenario);
        }


        //[TestCase("negative test")]
        public void Given_A_When_B_Then_Should_Throw_Exception(string scenario)
        {
            //arrange


            //act
            //Assert.Throws<ApiWebClientException>(
            //        () => client.UpdateDeveloperAccountOwner(devAccountActual.Id, newUserId));

        }

        #region privates
        private static Tenant.Contracts.Tenant CreateTenant(int tenantId, string domain)
        {
            var tenant = new Tenant.Contracts.Tenant()
            {
                Id = tenantId,
                Domain = new Domain { DomainName = domain }
            };
            return tenant;
        }

        private static Capability CreateCapability(string configUrl, string appHashKey, string capabilityId)
        {
            var cap = new Capability
            {
                Id = capabilityId,
                UIConfigurationUrl = configUrl,
                AppHashKey = appHashKey
            };
            return cap;
        }

        private static ISecureCapabilityConfigUrlHelper InitConfigUrlHelper(string reqUrl, string origUrl)
        {
            var mockHttpRequest = Substitute.For<IHttpRequestHeaderWrapper>();
            mockHttpRequest.GetHeader("x-vol-orig-url").Returns(origUrl);
            mockHttpRequest.GetRequestUri().Returns(new Uri(reqUrl));
            return new SecureCapabilityConfigUrlHelper(mockHttpRequest);
        }

        #endregion

    }
}

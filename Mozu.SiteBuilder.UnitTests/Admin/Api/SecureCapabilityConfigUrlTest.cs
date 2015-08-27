using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
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
    [Category("QueryString")]
    [TestFixture]
    public class SecureCapabilityConfigUrlTest
    {
        [TestCase("list", "e4b873aeb6da4964b14dac6747ceac2d", "https://parternship.com/mozu/register",
            "https://mudflapuniverse.com/Admin/t-9582/capability/edit/e4b873aeb6da4964b14dac6747ceac2d/#configure",
            9582, null, "mudflapuniverse.com", "readme", "Thu, 17 Apr 2014 15:13:25 GMT")]
        [TestCase("edit", "e542ac2f762448f98daba24500cf49b4", "https://integrations1-hp.mozu-qa.com/Salesforce",
            "https://t2544.sandbox.mozu-qa.com/Admin/s-4839/capability/edit/e542ac2f762448f98daba24500cf49b4/#configure",
            2544, 4839, "t2544.sandbox.mozu-qa.com", "WLoltYBKbHCf5Kf/L8yY1sD33mnv8gdNzgrTP5fIwRg=", "Thu, 17 Apr 2014 15:13:25 GMT")]
        [TestCase("#configure Site", "e542ac2f762448f98daba24500cf49b4", "https://integrations1-hp.mozu-qa.com/Salesforce",
            "https://t2544.sandbox.mozu-qa.com/Admin/s-4839/capability/edit/e542ac2f762448f98daba24500cf49b4/#configure",
            2544, 4839, "t2544.sandbox.mozu-qa.com", "WLoltYBKbHCf5Kf/L8yY1sD33mnv8gdNzgrTP5fIwRg=", "Thu, 17 Apr 2014 15:13:25 GMT")]
        [TestCase("#configure Tenant", "e542ac2f762448f98daba24500cf49b4", "https://integrations1-hp.mozu-qa.com/Salesforce",
            "https://t2544.sandbox.mozu-qa.com/Admin/t-2544/capability/edit/e542ac2f762448f98daba24500cf49b4/#configure",
            2544, null, "t2544.sandbox.mozu-qa.com", "WLoltYBKbHCf5Kf/L8yY1sD33mnv8gdNzgrTP5fIwRg=", "Thu, 17 Apr 2014 15:13:25 GMT"
            )]
        [TestCase("Sanjay", "e542ac2f762448f98daba24500cf49b4", "https://integrations1-hp.mozu-qa.com/Salesforce",
            "https://t2544.sandbox.mozu-qa.com/Admin/t-2544/capability/edit/e542ac2f762448f98daba24500cf49b4/#configure",
            2544, null, "t2544.sandbox.mozu-qa.com", "YVGhVJ3bkZ+HXNb3++dTN4M5/CQm3kIXS+i0Iwnbhh8=", "Wed, 16 Apr 2014 17:10:03 GMT"
            )]
        public void Given_ConfigUrl_And_SharedSecret_Should_Build_UrlParameters(string scenario, string capabilityId, 
            string configUrl, string expectedRetUrl, int tenantId, int? siteId, string domain, string appHashKey, string date)
        {
            //arrange
            var expectedBody = string.Format("x-vol-tenant-domain={0}&x-vol-return-url={1}", domain, expectedRetUrl);
            var expectedHash = ComputeHash(appHashKey, date, expectedBody);

            var sut = InitConfigUrlHelper(tenantId, siteId, date);
            var cap = CreateCapability(configUrl, appHashKey, capabilityId);
            var tenant = CreateTenant(tenantId, domain);

            //act
            var actual = sut.BuildSecureUrl(cap, tenant);
            Assert.IsNotNull(actual, scenario);

            var uri = new Uri(actual.UIConfigurationUrl);
            var qCollection = HttpUtility.ParseQueryString(uri.Query);
            var actualTenantId = qCollection.Get("tenantId");
            var actualHash = qCollection.Get("messageHash");  //HttpUtility.UrlEncode(
            var expectedUrl = string.Format("{0}?tenantId={1}&messageHash={2}&dt={3}", configUrl, tenantId, 
                HttpUtility.UrlEncode(expectedHash), HttpUtility.UrlEncode(date));
            
            //assert
            Assert.That(actualHash, Is.EqualTo(expectedHash), scenario);
            Assert.That(cap.UIConfigurationUrl, Is.EqualTo(expectedUrl), scenario);
            Assert.That(cap.TenantDomain, Is.EqualTo(domain), scenario);
            Assert.That(cap.ConfigReturnUrl, Is.EqualTo(expectedRetUrl), scenario);
            Assert.That(tenantId, Is.EqualTo(int.Parse(actualTenantId)), scenario);
        }

        

        [TestCase("From Sanjay", "YVGhVJ3bkZ+HXNb3++dTN4M5/CQm3kIXS+i0Iwnbhh8=",
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

        private static ISecureCapabilityConfigUrlHelper InitConfigUrlHelper(int tenantId, int? siteId, string date)
        {
            var mockApiContext = Substitute.For<IApiContext>();
            mockApiContext.TenantId.Returns(tenantId);
            mockApiContext.SiteId.Returns(siteId);

            var mockDateProvider = Substitute.For<IHttpSpecDateProvider>();
            mockDateProvider.GetRfc1123Format().Returns(date);

            return new SecureCapabilityConfigUrlHelper(mockApiContext, mockDateProvider);
        }

        [TestCase("Sanjay's expected result")]
        public void TestHashMethod(string scenario)
        {
            //arrange
            string expectedHash = "7eBePfIrs/w/LqKNTTmLFyjGFA+bDOmnsSMz29gGHKY=";
            string appHashKey = "YVGhVJ3bkZ+HXNb3++dTN4M5/CQm3kIXS+i0Iwnbhh8=";
            string date = "Wed, 16 Apr 2014 17:10:03 GMT";
            string body =
                "x-vol-tenant-domain=t2544.sandbox.mozu-qa.com&x-vol-return-url=https://t2544.sandbox.mozu-qa.com/admin/app/capabilities/edit/e542ac2f762448f98daba24500cf49b4/#configure";
            //act
            var actual = ComputeHash(appHashKey, date, body);

            //assert
            Assert.That(actual, Is.EqualTo(expectedHash), scenario);

        }

        private string ComputeHash(string appHashKey, string date, string body)
        {
            byte[] hashArray;
            using (var encryptor = new SHA256Managed())
            {
                var payload = string.Concat(appHashKey, date, body);
                var payloadByteArray = Encoding.UTF8.GetBytes(payload);
                hashArray = encryptor.ComputeHash(payloadByteArray);
            }
            var hash = Convert.ToBase64String(hashArray);
            return hash;
        }

        #endregion

    }
}

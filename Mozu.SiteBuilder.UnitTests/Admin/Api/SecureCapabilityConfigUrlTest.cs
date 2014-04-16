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
        private const string CapabilityId = "e4b873aeb6da4964b14dac6747ceac2d";

        [TestCase("1", "https://parternship.com/mozu/register",
            "http://t-9582.mozu.com/admin/app/capabilities/list?_dc=1397148414568&page=1&start=0&limit=25",
            "https://mudflapuniverse.com/admin/app/capabilities/list?_dc=1397148414568&page=1&start=0&limit=25",
            "https://mudflapuniverse.com/admin/app/capabilities/edit/" + CapabilityId + "/#configure",
            9582, "mudflapuniverse.com", "readme")]
        public void Given_ConfigUrl_And_SharedSecret_Should_Build_UrlParameters(string scenario, string configUrl, string reqUrl, string origUrl, string expectedRetUrl,
            int tenantId, string domain, string sharedSecret)
        {
            //arrange
            var appHashKey = Sha256HashGenerator.Hash(sharedSecret, sharedSecret); 
            var body = string.Format("x-vol-tenant-domain={0}&x-vol-return-url={1}", domain, expectedRetUrl);
            
            var mockHttpRequest = Substitute.For<IHttpRequestHeaderWrapper>();
            mockHttpRequest.GetHeader(Arg.Any<string>()).Returns(origUrl);
            mockHttpRequest.GetRequestUri().Returns(new Uri(reqUrl));

            var cap = new Capability
                {
                    Id = CapabilityId,
                    UIConfigurationUrl = configUrl,
                    AppHashKey = appHashKey
                };
            var tenant = new Tenant.Contracts.Tenant()
                {
                    Id = tenantId,
                    Domain = new Domain { DomainName = domain }
                };
            var sut = new SecureCapabilityConfigUrlHelper(mockHttpRequest);

            //act
            var actual = sut.BuildSecureUrl(cap, tenant);
            
            Assert.IsNotNull(actual, scenario);

            var uri = new Uri(actual.UIConfigurationUrl);
            var qCollection = HttpUtility.ParseQueryString(uri.Query);
            var actualTenantId = qCollection.Get("tenantId");
            
            var dt = qCollection.Get("dt");
            var encodedDt = HttpUtility.UrlEncode(dt);
            
            var actualHash = HttpUtility.UrlEncode(qCollection.Get("messageHash"));
            var expectedHash = HttpUtility.UrlEncode(Sha256HashGenerator.Hash(appHashKey, dt + body));
            var expectedUrl = string.Format("{0}?tenantId={1}&messageHash={2}&dt={3}", configUrl, tenantId, 
                expectedHash, encodedDt);
            
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


        //[TestCase("negative test")]
        public void Given_A_When_B_Then_Should_Throw_Exception(string scenario)
        {
            //arrange


            //act
            //Assert.Throws<ApiWebClientException>(
            //        () => client.UpdateDeveloperAccountOwner(devAccountActual.Id, newUserId));

        }

    }
}

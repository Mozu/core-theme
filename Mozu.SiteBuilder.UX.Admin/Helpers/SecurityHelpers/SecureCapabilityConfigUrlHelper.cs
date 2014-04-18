using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Crypto;
using Mozu.Core.Exceptions;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.UX.Admin.Api.Models.AppManagement;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.SecurityHelpers
{
    public interface ISecureCapabilityConfigUrlHelper
    {
        Capability BuildSecureUrl(Capability capability, Tenant.Contracts.Tenant tenant);
    }

    public class SecureCapabilityConfigUrlHelper : ISecureCapabilityConfigUrlHelper
    {
        public const string X_VOL_RETURN_URL = "x-vol-return-url";
        public const string RETURN_ANCHOR = "#configure";
        public const string X_VOL_TENANT_DOMAIN = "x-vol-tenant-domain";

        private readonly IApiContext _apiContext;
        private readonly IHttpSpecDateProvider _httpSpecDateProvider;

        public SecureCapabilityConfigUrlHelper(IApiContext apiContext, IHttpSpecDateProvider httpSpecDateProvider)
        {
            _apiContext = apiContext;
            _httpSpecDateProvider = httpSpecDateProvider;
        }

        public Capability BuildSecureUrl(Capability capability, Tenant.Contracts.Tenant tenant)
        {
            if (string.IsNullOrEmpty(capability.UIConfigurationUrl) || string.IsNullOrEmpty(capability.AppHashKey))
            {
                LoggingService.LoggerFor<SecureCapabilityConfigUrlHelper>().Warn(string.Format("Missing UIConfigUrl or AppHashKey for app {0} and capability {1}", capability.AppId, capability.Id));
                return capability;
            }
                
            var retUrl = BuildReturnUrl(tenant, capability.Id);
            var body = string.Format("{0}={1}&{2}={3}", X_VOL_TENANT_DOMAIN, tenant.Domain.DomainName, X_VOL_RETURN_URL, retUrl);
            var dt = _httpSpecDateProvider.GetRfc1123Format();
            var hashedMsg = ComputeHash(capability.AppHashKey, dt, body);   //Sha256HashGenerator.Hash(capability.AppHashKey, dt + body);
            var secureUrl = string.Format("{0}{1}tenantId={2}&messageHash={3}&dt={4}",  //https://partner.com?tenantId=123&messageHash=RG7es7Etc&dt=Wed, 
                capability.UIConfigurationUrl,
                ((capability.UIConfigurationUrl.Contains("?")) ? "&" : "?"),
                tenant.Id,
                HttpUtility.UrlEncode(hashedMsg),
                HttpUtility.UrlEncode(dt));

            capability.UIConfigurationUrl = secureUrl;
            capability.TenantDomain = tenant.Domain.DomainName;
            capability.ConfigReturnUrl = retUrl;
            return capability;
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

        private string BuildReturnUrl(Tenant.Contracts.Tenant tenant, string capabilityId)
        {
            var siteOrTenantSegment = (_apiContext.SiteId.HasValue)
                ? string.Format("s-{0}", _apiContext.SiteId.Value)
                : string.Format("t-{0}", _apiContext.TenantId);

            return string.Format("https://{0}/Admin/{1}/capability/edit/{2}/{3}", tenant.Domain.DomainName, siteOrTenantSegment,
                capabilityId, RETURN_ANCHOR);
        }

    }

    /// <summary>
    /// To enable deterministic unit testing
    /// </summary>
    public interface IHttpSpecDateProvider
    {
        string GetRfc1123Format();
    }

    public class HttpSpecDateProvider : IHttpSpecDateProvider
    {

        public string GetRfc1123Format()
        {
            return DateTime.UtcNow.ToString("R");
        }
    }

}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Crypto;
using Mozu.Core.Exceptions;
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
        public const string X_VOL_ORIGIN_URL = "x-vol-orig-url";
        public const string X_VOL_TENANT_DOMAIN = "x-vol-tenant-domain";
        public const string DATE_TIME_FORMAT = "R"; //RFC-1123;

        private readonly IHttpRequestHeaderWrapper _httpRequest;

        public SecureCapabilityConfigUrlHelper(IHttpRequestHeaderWrapper httpRequest)
        {
            _httpRequest = httpRequest;
        }

        public Capability BuildSecureUrl(Capability capability, Tenant.Contracts.Tenant tenant)
        {
            if (string.IsNullOrEmpty(capability.UIConfigurationUrl))
                return capability;
            
            var retUrl = BuildReturnUrl(capability.Id);
            var body = string.Format("{0}={1}&{2}={3}", X_VOL_TENANT_DOMAIN, tenant.Domain.DomainName, 
                X_VOL_RETURN_URL, retUrl);
            var dt = DateTime.UtcNow.ToString(DATE_TIME_FORMAT);
            var hashedMsg = Sha256HashGenerator.Hash(capability.AppHashKey, dt + body);
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

        private string BuildReturnUrl(string capabilityId)
        {
            var origUrl = _httpRequest.GetHeader(X_VOL_ORIGIN_URL);
            var uri = (string.IsNullOrEmpty(origUrl)) ? _httpRequest.GetRequestUri() : new Uri(origUrl);

            var sb = new StringBuilder("https://");
            sb.Append(uri.Host);
            for (int i = 0; i < uri.Segments.Length - 1; i++)
            {
                sb.Append(uri.Segments[i]);
            }
            sb.Append("edit/").Append(capabilityId);
            sb.Append("/#configure");
            return sb.ToString();
        }

    }

    public interface IHttpRequestHeaderWrapper
    {
        Uri GetRequestUri();
        string GetHeader(string name);
    }

    //for unit testing
    public class HttpRequestHeaderWrapper : IHttpRequestHeaderWrapper
    {
        private readonly HttpContextBase _httpContext;

        public HttpRequestHeaderWrapper(HttpContextBase httpContext)
        {
            _httpContext = httpContext;
        }

        public Uri GetRequestUri()
        {
            if (_httpContext != null && _httpContext.Request != null)
            {
                return _httpContext.Request.Url;
            }

            try
            {
                if (HttpContext.Current != null && HttpContext.Current.Request != null)
                {
                    return HttpContext.Current.Request.Url;
                }
            }
            catch (Exception)
            {
                // supress HttpContext.Current not available exceptions
            }
            return null;
        }

        public string GetHeader(string name)
        {
            if (_httpContext != null && _httpContext.Request != null)
            {
                return _httpContext.Request.Headers.Get(name);
            }
            try
            {
                if (HttpContext.Current != null)
                {
                    return HttpContext.Current.Request.Headers.Get(name);
                }
            }
            catch (Exception)
            {
                // supress HttpContext.Current not available exceptions
            }
            return null;
        }

    }
}
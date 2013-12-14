using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.Core;
using Mozu.Core.Settings;
using APIConstants = Mozu.Core.Api.Contracts.Constants;

namespace Mozu.SiteBuilder.Mvc.Contexts
{
    public class ClientApiContext
    {
        private static List<ServiceInfo> _serviceInfos;


        private readonly Lazy<string> _apiClaims = new Lazy<string>(() =>
        {
            LightweightAppClaims claim = LightweightAppClaims.CreateForPublicStorefront();
            //var list = claim.BehaviorIds.ToList();
            //list.Add(new WishlistCreateBehavior().Id);
            //list.Add(new WishlistDeleteBehavior().Id);
            //list.Add(new WishlistReadBehavior().Id);
            //list.Add(new WishlistUpdateBehavior().Id);
            //claim.BehaviorIds = list.ToArray();
            return claim.ToAccessToken();
        });

        private readonly IApiContext _apiContext;
        private readonly Lazy<PageContext> _pageContextLazy;
        private readonly ISettings _settings;
        private Dictionary<string, string> _serviceMap;


        public ClientApiContext(ISettings settings, IApiContext apiContext, Lazy<PageContext> pageContextLazy)
        {
            _settings = settings;
            _apiContext = apiContext;
            _pageContextLazy = pageContextLazy;


            Headers = BuildHeaders(apiContext);
        }

        public Dictionary<string, string> Headers { get; set; }

        public Dictionary<string, string> Urls
        {
            get
            {
                if (_serviceMap == null)
                {
                    _serviceMap = BuildUrls();
                }
                return _serviceMap;
            }
            set { _serviceMap = value; }
        }

        private Dictionary<string, string> BuildUrls()
        {
            var urls = new Dictionary<string, string>();
            List<ServiceInfo> sis = GetServiceInfos(_settings);
            if (!_pageContextLazy.Value.HandledByProxy)
            {
                return sis.ToDictionary(x => x.Id, y => y.InternalUrl);
            }
            var uriBuilder = new UriBuilder(_pageContextLazy.Value.Url);
            string defaultHost = uriBuilder.Uri.GetComponents(UriComponents.HostAndPort, UriFormat.Unescaped);
            uriBuilder.Scheme = "https";
            string secureHost = uriBuilder.Uri.GetComponents(UriComponents.HostAndPort, UriFormat.Unescaped);
            var sslEnabled = _settings.AppSettings("sslEnabled") == "true";

            return sis.ToDictionary(x => x.Id, y =>
            {
                if (y.SkipRename)
                {
                    return y.InternalUrl;
                }
                if (sslEnabled && y.RequiresSsl)
                {
                    return secureHost + y.VirturalPath;
                }
                return defaultHost + y.VirturalPath;
            });
        }

        private Dictionary<string, string> BuildHeaders(IApiContext apiContext)
        {
            var header = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            header[APIConstants.Headers.APP_CLAIMS] = _apiClaims.Value;
            header[APIConstants.Headers.CURRENCY] = apiContext.CurrencyCode;
            header[APIConstants.Headers.LOCALE] = apiContext.LocaleCode;
            header[APIConstants.Headers.SITE] = apiContext.SiteId.HasValue ? apiContext.SiteId.Value.ToString() : "";
            header[APIConstants.Headers.MASTER_CATALOG] = apiContext.MasterCatalogId.HasValue ? apiContext.MasterCatalogId.Value.ToString() : "";
            header[APIConstants.Headers.TENANT] = apiContext.TenantId.ToString();
            header[APIConstants.Headers.USER_CLAIMS] = apiContext.UserClaims.ToAccessToken();
            header[APIConstants.Headers.BYPASS_CACHE] = apiContext.ShouldBypassCache.ToString();
            if (apiContext.DataViewMode == DataViewModeType.Pending)
            {
                header[APIConstants.Headers.DATA_VIEW_MODE] = apiContext.DataViewMode.ToString();
            }


            ///*************************************************88
            // * REMOVE AFTER CUSTOMER IS FIXED
            // * 
            // * **********************************************/

            //var appClaim  =LightweightAppClaims.CreateForSystemApp("food", false);

            //apiContext.UserClaims.BehaviorIds = appClaim.BehaviorIds;

            //header[APIConstants.Headers.APP_CLAIMS] = appClaim.ToAccessToken();
            //header[APIConstants.Headers.USER_CLAIMS] = apiContext.UserClaims.ToAccessToken();

            ///*************************************************88
            // * REMOVE AFTER CUSTOMER IS FIXED
            // * 
            // * **********************************************/


            return header;
        }


        private static List<ServiceInfo> GetServiceInfos(ISettings settings)
        {
            if (_serviceInfos == null)
            {
                var sis =
                    new List<ServiceInfo>
                    {
                        new ServiceInfo
                        {
                            Id = "ProductService",
                            InternalUrl = settings.AppSettings("service-url-ProductRuntimeWebApi")
                        },
                        new ServiceInfo
                        {
                            Id = "CategoryService",
                            InternalUrl = settings.AppSettings("service-url-ProductCategoryRuntimeWebApi")
                        },
                        new ServiceInfo
                        {
                            Id = "CartService",
                            InternalUrl = settings.AppSettings("service-url-CartWebApi")
                        },
                        new ServiceInfo
                        {
                            Id = "CustomerService",
                            InternalUrl = settings.AppSettings("service-url-CustomerAccountWebApi"),
                            RequiresSsl = true
                        },
                        new ServiceInfo
                        {
                            Id = "OrderService",
                            InternalUrl = settings.AppSettings("service-url-OrderWebApi"),
                            RequiresSsl = true
                        },
                        new ServiceInfo
                        {
                            Id = "SearchService",
                            InternalUrl = settings.AppSettings("service-url-ProductSearchWebApi")
                        },
                        new ServiceInfo
                        {
                            Id = "ReferenceService",
                            InternalUrl = settings.AppSettings("service-url-ReferenceDataWebApi")
                        },
                        new ServiceInfo
                        {
                            Id = "PaymentService",
                            InternalUrl = settings.AppSettings("service-url-StorefrontCardsWebApi"),
                            SkipRename = true,
                            RequiresSsl = true
                        },
                        new ServiceInfo
                        {
                            Id = "addressValidationService",
                            InternalUrl = settings.AppSettings("service-url-AddressValidationWebApi")
                        },
                        new ServiceInfo
                        {
                            Id = "wishlistService",
                            InternalUrl = settings.AppSettings("service-url-StorefrontCardsWebApi")
                        },
                        new ServiceInfo
                        {
                            Id = "ReturnService",
                            InternalUrl = settings.AppSettings("service-url-ReturnWebApi"),
                            RequiresSsl = true
                        },new ServiceInfo
                        {
                            Id = "storefrontUserService",
                            InternalUrl = "/user/",
                            IsSiteBuiderRoute = true,
                            VirturalPath = "/user/",
                            RequiresSsl = true
                        }
                    };
                foreach (ServiceInfo si in sis)
                {
                    if (string.IsNullOrEmpty(si.InternalUrl))
                    {
                        throw new EntryPointNotFoundException("missing appsetting for " + si.Id  );
                    }
                    int idx = si.InternalUrl.IndexOf("webapi/", StringComparison.OrdinalIgnoreCase);
                    if (idx > 0)
                    {
                        si.VirturalPath = "/api" + si.InternalUrl.Substring(idx + 6);
                    }
                }
                return sis;
                _serviceInfos = sis;
            }
            return _serviceInfos;
        }


        private class ServiceInfo
        {
            public string InternalUrl { get; set; }
            public string VirturalPath { get; set; }
            public string Id { get; set; }

            public bool RequiresSsl { get; set; }

            public bool IsSiteBuiderRoute { get; set; }

            public bool SkipRename { get; set; }
        }
    }
}
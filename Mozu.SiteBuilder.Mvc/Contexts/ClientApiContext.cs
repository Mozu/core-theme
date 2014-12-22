using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using Mozu.Core;
using Mozu.Core.Settings;
using APIConstants = Mozu.Core.Api.Contracts.Constants;

namespace Mozu.SiteBuilder.Mvc.Contexts
{
    public class ClientApiContext
    {
     


        private readonly Lazy<string> _apiClaims = new Lazy<string>(() =>
        {
            LightweightAppClaims claim = LightweightAppClaims.CreateForPublicStorefront();
            return claim.ToAccessToken();
        });

        private readonly IApiContext _apiContext;
        private readonly Lazy<PageContext> _pageContextLazy;
        private readonly HttpRequestMessage _requestMessage;
        private readonly ISettings _settings;
        private Dictionary<string, string> _serviceMap;


        public ClientApiContext(ISettings settings, IApiContext apiContext, Lazy<PageContext> pageContextLazy, HttpRequestMessage requestMessage)
        {
            _settings = settings;
            _apiContext = apiContext;
            _pageContextLazy = pageContextLazy;
            _requestMessage = requestMessage;


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
            string defaultHost = string.Empty;
            string secureHost = string.Empty;


            var uriBuilder = new UriBuilder(_pageContextLazy.Value.Url ?? _requestMessage.RequestUri.ToString());
            defaultHost = uriBuilder.Uri.GetComponents(UriComponents.SchemeAndServer, UriFormat.Unescaped);
            uriBuilder.Scheme = "https";
            uriBuilder.Port = 443;
            secureHost = uriBuilder.Uri.GetComponents(UriComponents.SchemeAndServer, UriFormat.Unescaped);

            bool sslEnabled = _settings.CoreSettings.IsSSLValidationEnabled;

            bool useCoors = _settings.Urls("useCORS") == "true";

            return sis.ToDictionary(x => x.Id, y =>
            {
                if (y.SkipRename)
                {
                    return y.InternalUrl;
                }
                if (!useCoors)
                {
                    if (sslEnabled && y.RequiresSsl/* && !_pageContextLazy.Value.IsSecure*/)
                    {
                        return secureHost + y.VirturalPath;
                    }
                    else if (y.IsSiteBuiderRoute)
                    {
                        return defaultHost + y.VirturalPath;
                    }
                    return y.VirturalPath;
                }
                else
                {
                    if (y.IsSiteBuiderRoute)
                    {
                        if (sslEnabled && y.RequiresSsl)
                        {
                            return secureHost + y.VirturalPath;
                        }
                        else
                        {
                            return defaultHost + y.VirturalPath;
                        }

                    }

                    return y.InternalUrl;
                }
             

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
            header[APIConstants.Headers.CATALOG] = apiContext.CatalogId.HasValue ? apiContext.CatalogId.Value.ToString() : "";
            header[APIConstants.Headers.TENANT] = apiContext.TenantId.ToString();
            header[APIConstants.Headers.USER_CLAIMS] = apiContext.UserClaims.ToAccessToken();
         //   header[APIConstants.Headers.BYPASS_CACHE] = apiContext.ShouldBypassCache.ToString();
            if (apiContext.DataViewMode == DataViewModeType.Pending)
            {
                header[APIConstants.Headers.DATA_VIEW_MODE] = apiContext.DataViewMode.ToString();
            }



            return header;
        }

        private static List<ServiceInfo> _serviceInfos = null;

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
                            InternalUrl = settings.Urls("service-url-ProductRuntimeWebApi")
                        },
                         new ServiceInfo
                        {
                            Id = "DocumentListService",
                            InternalUrl = settings.Urls("service-url-DocumentListWebApi"),
                            RequiresSsl = true
                        },
                        new ServiceInfo
                        {
                            Id = "EntityListService",
                            InternalUrl = settings.Urls("service-url-EntityListsWebApi"),
                            RequiresSsl = true
                        },
                        new ServiceInfo
                        {
                            Id = "CategoryService",
                            InternalUrl = settings.Urls("service-url-ProductCategoryRuntimeWebApi")
                        },
                        new ServiceInfo
                        {
                            Id = "CartService",
                            InternalUrl = settings.Urls("service-url-CartWebApi")
                        },
                        new ServiceInfo
                        {
                            Id = "CustomerService",
                            InternalUrl = settings.Urls("service-url-CustomerAccountWebApi"),
                            RequiresSsl = true
                        },
                        new ServiceInfo
                        {
                            Id = "CustomerAttributeDefService",
                            InternalUrl = settings.Urls("service-url-CustomerAttributeDefinitionWebApi"),
                            RequiresSsl = true
                        },
                        new ServiceInfo
                        {
                            Id = "InStockNotificationService",
                            InternalUrl = settings.Urls("service-url-InStockNotificationSubscriptionWebApi")
                        },
                        new ServiceInfo
                        {
                            Id = "ShippingService",
                            InternalUrl = settings.Urls("service-url-ShippingWebApi"),
                            RequiresSsl = true
                        },
                        new ServiceInfo
                        {
                            Id = "OrderService",
                            InternalUrl = settings.Urls("service-url-OrderWebApi"),
                            RequiresSsl = true
                        },
                        new ServiceInfo
                        {
                            Id = "SearchService",
                            InternalUrl = settings.Urls("service-url-ProductSearchWebApi")
                        },
                        new ServiceInfo
                        {
                            Id = "ReferenceService",
                            InternalUrl = settings.Urls("service-url-ReferenceDataWebApi")
                        },
                        new ServiceInfo
                        {
                            Id = "PaymentService",
                            InternalUrl = settings.Urls("service-url-StorefrontCardsWebApi"),
                            SkipRename = true,
                            RequiresSsl = true
                        },
                        new ServiceInfo
                        {
                            Id = "addressValidationService",
                            InternalUrl = settings.Urls("service-url-AddressValidationWebApi")
                        },
                        new ServiceInfo
                        {
                            Id = "wishlistService",
                            InternalUrl = settings.Urls("service-url-WishlistWebApi")
                        },
                        new ServiceInfo
                        {
                            Id = "ReturnService",
                            InternalUrl = settings.Urls("service-url-ReturnWebApi"),
                            RequiresSsl = true
                        },
                        new ServiceInfo
                        {
                            Id = "storefrontUserService",
                            InternalUrl = "/user/",
                            IsSiteBuiderRoute = true,
                            VirturalPath = "/user/",
                            RequiresSsl = true
                        },
                        new ServiceInfo
                        {
                            Id = "locationService",
                            InternalUrl = settings.Urls("service-url-LocationRuntimeWebApi")
                        },
                        new ServiceInfo
                        {
                            Id = "creditService",
                            InternalUrl = settings.Urls("service-url-CreditWebApi")
                        }
                        ,new ServiceInfo
                        {
                             Id = "paypalExpress",
                             SkipRename= true,
                            InternalUrl = settings.Urls("paypalExpressUrl")
                        }


                        
                    };
                foreach (ServiceInfo si in sis)
                {
                    if (string.IsNullOrEmpty(si.InternalUrl))
                    {
                        throw new EntryPointNotFoundException("missing appsetting for " + si.Id);
                    }
                    int idx = si.InternalUrl.IndexOf("webapi/", StringComparison.OrdinalIgnoreCase);
                    if (idx > 0)
                    {
                        si.VirturalPath = "/api" + si.InternalUrl.Substring(idx + 6);
                    }
                }
                return sis;
                
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
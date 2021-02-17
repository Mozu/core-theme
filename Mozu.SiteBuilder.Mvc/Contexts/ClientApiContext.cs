using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using Mozu.Core;
using Mozu.Core.Settings;
using Mozu.Core.Api.Client;
using APIConstants = Mozu.Core.Api.Contracts.Constants;
using static Mozu.SiteBuilder.Mvc.Tags.PreloadJsonTag;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Mozu.SiteBuilder.Mvc.Extensions;
using RestSharp.Validation;

namespace Mozu.SiteBuilder.Mvc.Contexts
{
    public class ClientApiContext
    {
        private readonly Lazy<string> _apiClaims = new Lazy<string>(() =>
        {
            LightweightAppClaims claim = LightweightAppClaims.CreateForPublicStorefront();
            return claim.ToAccessToken();
        });

        private readonly PageContext _pageContext;
        private readonly HttpContext _context;
        private readonly ISettings _settings;
        private Dictionary<string, string> _serviceMap;

        public ClientApiContext(ISettings settings, IApiContext apiContext, PageContext pageContext, HttpContext context)
        {
            _settings = settings;
            apiContext = apiContext.Copy();
            _pageContext = pageContext;
            _context = context;

            if (pageContext?.Visit != null && apiContext.UserClaims != null)
            {
                apiContext.UserClaims.Bag["VisitId"] = pageContext.Visit.VisitId;
            }

            Headers = BuildHeaders(apiContext);
        }

        public Dictionary<string, string> Headers { get; set; }

        public Dictionary<string, string> Urls
        {
            get { return _serviceMap ??= BuildUrls(); }
            set => _serviceMap = value;
        }

        private Dictionary<string, string> BuildUrls()
        {
            var urls = new Dictionary<string, string>();
            var sis = GetServiceInfos(_settings);
            var defaultHost = string.Empty;
            var secureHost = string.Empty;


            var uriBuilder = new UriBuilder(_pageContext.Url ?? _context.GetRequestUri().ToString());
            defaultHost = uriBuilder.Uri.GetComponents(UriComponents.SchemeAndServer, UriFormat.Unescaped);
            uriBuilder.Scheme = "https";
            uriBuilder.Port = 443;
            secureHost = uriBuilder.Uri.GetComponents(UriComponents.SchemeAndServer, UriFormat.Unescaped);

            var sslEnabled = _settings.CoreSettings.IsSSLValidationEnabled;

            var useCoors = _settings.AsMozuSettings().Routes.GetValue<string>("useCORS") == "true";

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

                    if (y.IsSiteBuiderRoute)
                    {
                        return defaultHost + y.VirturalPath;
                    }

                    return y.VirturalPath;
                }
                else
                {
                    if (!y.IsSiteBuiderRoute) return y.InternalUrl;

                    if (sslEnabled && y.RequiresSsl)
                    {
                        return secureHost + y.VirturalPath;
                    }

                    return defaultHost + y.VirturalPath;
                }
            });
        }

        string GetUserClaims (IApiContext apiContext)
        {
            return apiContext.SiteId.HasValue ? (apiContext.UserClaims ?? LightweightUserClaims.CreateForAnonymousShopper(apiContext.TenantId, apiContext.SiteId.Value)).ToAccessToken() : "";
        }

        public static bool OmitUserFields => MozuConfigurationManager.Settings.AppSettingsAsNullableBool("sitebuilder_preload_json_omitUserFields").GetValueOrDefault(true);

        private Dictionary<string, string> BuildHeaders(IApiContext apiContext)
        {
            var header = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                [APIConstants.Headers.CURRENCY] = apiContext.CurrencyCode,
                [APIConstants.Headers.LOCALE] = apiContext.LocaleCode,
                [APIConstants.Headers.SITE] = apiContext.SiteId.HasValue ? apiContext.SiteId.Value.ToString() : "",
                [APIConstants.Headers.MASTER_CATALOG] = apiContext.MasterCatalogId.HasValue
                    ? apiContext.MasterCatalogId.Value.ToString()
                    : "",
                [APIConstants.Headers.CATALOG] =
                    apiContext.CatalogId.HasValue ? apiContext.CatalogId.Value.ToString() : "",
                [APIConstants.Headers.TENANT] = apiContext.TenantId.ToString()
            };

            if (_pageContext.UserScopeType.HasValue)
            {
                header[APIConstants.Headers.USER_SCOPE_TYPE] = _pageContext.UserScopeType.ToString();
            }

            //food/
            if (OmitUserFields)
            {
                header[APIConstants.Headers.USER_CLAIMS] = "__mzrpt__";
                header[APIConstants.Headers.APP_CLAIMS] = "__mzrpt__";
            }
            else
            {
                header[APIConstants.Headers.PURCHASE_LOCATION] = apiContext.PurchaseLocation?.ToString();
                header[APIConstants.Headers.USER_CLAIMS] = GetUserClaims(apiContext);
                header[APIConstants.Headers.APP_CLAIMS] = _apiClaims.Value;
            }
            //   header[APIConstants.Headers.BYPASS_CACHE] = apiContext.ShouldBypassCache.ToString();
            if (apiContext.DataViewMode != DataViewModeType.Pending) return header;

            header[APIConstants.Headers.DATA_VIEW_MODE] = apiContext.DataViewMode.ToString();
            if (apiContext.PreviewDate.HasValue)
            {
                header[APIConstants.Headers.PREVIEW_DATE] = apiContext.PreviewDate.Value.ToString(Mozu.Core.Constants.MozuDateTimeFormat);
            }

            return header;
        }

        private static readonly List<ServiceInfo> ServiceInfos = null;

        private static List<ServiceInfo> GetServiceInfos(ISettings settings)
        {
            if (ServiceInfos != null) return ServiceInfos;

            var sis =
                new List<ServiceInfo>
                {
                    new ServiceInfo
                    {
                        Id = "ProductService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("ProductRuntimeWebApi")
                    },
                    new ServiceInfo
                    {
                        Id = "DocumentListService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("DocumentListWebApi"),
                        RequiresSsl = true
                    },
                    new ServiceInfo
                    {
                        Id = "EntityListService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("EntityListsWebApi"),
                        RequiresSsl = true
                    },
                    new ServiceInfo
                    {
                        Id = "CategoryService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("ProductCategoryRuntimeWebApi")
                    },
                    new ServiceInfo
                    {
                        Id = "CartService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("CartWebApi")
                    },
                    new ServiceInfo
                    {
                        Id = "CustomerService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("CustomerAccountWebApi"),
                        RequiresSsl = true
                    },
                    new ServiceInfo
                    {
                        Id = "B2BAccountService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("B2BAccountWebApi"),
                        RequiresSsl = true
                    },
                    new ServiceInfo
                    {
                        Id = "CustomerAttributeDefService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("CustomerAttributeDefinitionWebApi"),
                        RequiresSsl = true
                    },
                    new ServiceInfo
                    {
                        Id = "AccountAttributeDefService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("AccountAttributeDefinitionWebApi"),
                        RequiresSsl = true
                    },
                    new ServiceInfo
                    {
                        Id = "InStockNotificationService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("InStockNotificationSubscriptionWebApi"),
                        RequiresSsl = true
                    },
                    new ServiceInfo
                    {
                        Id = "ShippingService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("ShippingWebApi"),
                        RequiresSsl = true
                    },
                    new ServiceInfo
                    {
                        Id = "OrderService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("OrderWebApi"),
                        RequiresSsl = true
                    },
                    new ServiceInfo
                    {
                        Id = "SearchService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("ProductSearchWebApi")
                    },
                    new ServiceInfo
                    {
                        Id = "ReferenceService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("ReferenceDataWebApi")
                    },
                    new ServiceInfo
                    {
                        Id = "PaymentService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("StorefrontCardsWebApi"),
                        SkipRename = true,
                        RequiresSsl = true
                    },
                    new ServiceInfo
                    {
                        Id = "addressValidationService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("AddressValidationWebApi")
                    },
                    new ServiceInfo
                    {
                        Id = "wishlistService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("WishlistWebApi")
                    },
                    new ServiceInfo
                    {
                        Id = "ReturnService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("ReturnWebApi"),
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
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("LocationRuntimeWebApi")
                    },
                    new ServiceInfo
                    {
                        Id = "creditService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("CreditWebApi")
                    }
                    ,new ServiceInfo
                    {
                        Id = "paypalExpress",
                        SkipRename= true,
                        InternalUrl = settings.AppSettings("PaypalExpressRedirectUrl")
                    },
                    new ServiceInfo
                    {
                        Id = "OrderAttributeDefService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("OrderAttributeWebApi"),
                        RequiresSsl = true
                    },
                    new ServiceInfo
                    {
                        Id = "LocationAttributeDefService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("LocationAttributeDefinitionWebApi"),
                        RequiresSsl = true
                    },
                    new ServiceInfo
                    {
                        Id = "CheckoutService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("CheckoutWebApi"),
                        RequiresSsl = true
                    }, 
                    new ServiceInfo
                    {
                        Id = "tokenService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("StorefrontTokensWebApi"),
                        SkipRename = true,
                        RequiresSsl = true
                    },
                    new ServiceInfo
                    {
                        Id = "DiscountService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("DiscountRuntimeSecondaryWebApi"),
                        RequiresSsl = true
                    },
                    new ServiceInfo
                    {
                        Id = "StorefrontShipmentsService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("StorefrontShipmentsWebApi"),
                        RequiresSsl = true
                    }, 
                    new ServiceInfo
                    {
                        Id = "QuoteService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("QuoteWebApi"),
                        RequiresSsl = true
                    },
                     new ServiceInfo
                    {
                        Id = "B2BContactService",
                        InternalUrl = settings.AsMozuSettings().Routes.GetValue<string>("B2BContactWebApi"),
                        RequiresSsl = true
                    }
                };
            foreach (var si in sis)
            {
                if (string.IsNullOrEmpty(si.InternalUrl))
                {
                    throw new EntryPointNotFoundException("missing appsetting for " + si.Id);
                }
               
                var idx = si.InternalUrl.IndexOf("webapi/", StringComparison.OrdinalIgnoreCase);
                if (idx > 0)
                {
                    var localPath = new Uri( si.InternalUrl).PathAndQuery;
                    idx = localPath.IndexOf('/', 1);
                    si.VirturalPath = "/api" + localPath.Substring(idx);
                }
            }
            return sis;
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
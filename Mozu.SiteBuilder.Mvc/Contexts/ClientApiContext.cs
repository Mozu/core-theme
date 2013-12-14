using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.Core;
using Mozu.Core.Behaviors;
using Mozu.Core.Settings;
using Newtonsoft.Json.Linq;
using APIConstants = Mozu.Core.Api.Contracts.Constants;

namespace Mozu.SiteBuilder.Mvc.Contexts
{
    public class ClientApiContext
    {


        public ClientApiContext(ISettings settings, IApiContext apiContext)
        {

            this.Urls = BuildUrls(settings);
            this.Headers = BuildHeaders(apiContext);
        }

        private Dictionary<string, string> BuildHeaders(IApiContext apiContext)
        {
            var header = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            header[APIConstants.Headers.APP_CLAIMS] = _apiClaims.Value;
            header[APIConstants.Headers.CURRENCY] = apiContext.CurrencyCode;
            header[APIConstants.Headers.LOCALE] = apiContext.LocaleCode;
            header[APIConstants.Headers.SITE] = apiContext.SiteId.HasValue ? apiContext.SiteId.Value.ToString() : "";
         //   header[APIConstants.Headers.SITE_GROUP] = apiContext.MasterCatalogId.HasValue ? apiContext.MasterCatalogId.Value.ToString() : "";
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

        private static Dictionary<string, string> _gUrls;
        //todo:update core
        private Lazy<string> _apiClaims = new Lazy<string>(() =>
            {


                var claim = LightweightAppClaims.CreateForPublicStorefront();
                //var list = claim.BehaviorIds.ToList();
                //list.Add(new WishlistCreateBehavior().Id);
                //list.Add(new WishlistDeleteBehavior().Id);
                //list.Add(new WishlistReadBehavior().Id);
                //list.Add(new WishlistUpdateBehavior().Id);
                //claim.BehaviorIds = list.ToArray();
                return claim.ToAccessToken();
            });
            //LightweightAppClaims.CreateForPublicStorefront().ToAccessToken());

        private static readonly List<string> NonProxyUrls = new List<string> {
            "PaymentService",
            "storefrontUserService"
        };

        private static Dictionary<string, string> BuildUrls(ISettings settings)
        {
            if (_gUrls == null)
            {
                var urls = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                urls["ProductService"] = settings.AppSettings("service-url-ProductRuntimeWebApi");
                urls["CategoryService"] = settings.AppSettings("service-url-ProductCategoryRuntimeWebApi");
                urls["CartService"] = settings.AppSettings("service-url-CartWebApi");
                urls["UserService"] = settings.AppSettings("service-url-UserWebApi");
                urls["CustomerService"] = settings.AppSettings("service-url-CustomerAccountWebApi");
                urls["OrderService"] = settings.AppSettings("service-url-OrderWebApi");
                urls["ReturnService"] = settings.AppSettings("service-url-ReturnWebApi");
                urls["SearchService"] = settings.AppSettings("service-url-ProductSearchWebApi");
                urls["CmsService"] = settings.AppSettings("service-url-DocumentListWebApi");
                urls["ReferenceService"] = settings.AppSettings("service-url-ReferenceDataWebApi");
                urls["PaymentService"] = settings.AppSettings("service-url-StorefrontCardsWebApi");
                urls["addressValidationService"] = settings.AppSettings("service-url-AddressValidationWebApi");
                urls["wishlistService"] = settings.AppSettings("service-url-WishlistWebApi");
                urls["storefrontUserService"] = "/user/";

                if (settings.AppSettings("ReverseProxy") == "true")
                {
                    
                    foreach (var url in urls.ToArray())
                    {

                        int idx = (((string) url.Value) ?? "").IndexOf("webapi/", StringComparison.OrdinalIgnoreCase);
                        if (idx > 0 && !NonProxyUrls.Contains(url.Key))
                        {
                            urls[url.Key] = "/api" + ((string) url.Value).Substring(idx + 6);
                        }
                    }
                }
                _gUrls = urls;
            }
            return _gUrls;
        }

        public Dictionary<string, string> Headers { get; set; }
        public Dictionary<string, string> Urls { get; set; }


    }
}
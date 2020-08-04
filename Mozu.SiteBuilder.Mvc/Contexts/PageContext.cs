using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net.Http;
using System.Web;
using Mozu.Core;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.Visit;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Newtonsoft.Json.Linq;
using Mozu.SiteBuilder.UX.Models.Customers;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using Mozu.Core.Configuration;
using Mozu.Core.Money;
using Mozu.SiteBuilder.Mvc.Tags;


namespace Mozu.SiteBuilder.Mvc.Contexts
{
    public class PagingParameters
    {
        private readonly SearchContext search;

        public PagingParameters(SearchContext search)
        {
            // TODO: Complete member initialization
            this.search = search;
        }
        public string FacetValueFilter
        {
            get => search.ToFacetValueFilter();
            set => throw new NotSupportedException();
        }
        public int? PageSize
        {
            get => search.PageSize;
            set => throw new NotSupportedException();
        }
        public int? StartIndex
        {
            get => search.StartIndex;
            set => throw new NotSupportedException();
        }
      

        public static PagingParameters Create(SearchContext  search)
        {
            return new PagingParameters(search);
            
        }
        public override string ToString()
        {
            return $"PagingParameters,{StartIndex},{PageSize},{FacetValueFilter}";
        }
    }

    public static class CmsContextExtensions
    {
        public static string GetTemplate(this DocumentRequest documentRequest, SiteContext siteContext, string defaultTemplate = null)
        {
            if (documentRequest?.Document == null) return defaultTemplate;

            PageTypeDefinition pageDefinition = null;
            var pageTypeDefinitionKey = documentRequest.Document.Get<string>("page_type_definition");
            pageTypeDefinitionKey = string.IsNullOrWhiteSpace(pageTypeDefinitionKey) ? defaultTemplate : pageTypeDefinitionKey;
            if (!string.IsNullOrEmpty(pageTypeDefinitionKey))
            {
                pageDefinition = siteContext.Theme.PageTypes.FirstOrDefault(x => string.Equals(x.Id, pageTypeDefinitionKey, StringComparison.OrdinalIgnoreCase));
            }
            if (pageDefinition != null && !string.IsNullOrWhiteSpace(pageDefinition.Template))
            {
                defaultTemplate = pageDefinition.Template;
            }
            return defaultTemplate;
        }
    } 

    public class SortingParameters
    {
        private readonly SearchContext _search;

        public SortingParameters(SearchContext search)
        {
            _search = search;
        }
        public string Sort
        {
            get => _search.SortBy;
            set => throw new NotSupportedException();
        }
        public static SortingParameters Create(SearchContext search)
        {
            return new SortingParameters(search);
        }
    }

    public interface ICrawlerInfo
    {
        bool IsCrawler { get; set; }
        string CanonicalUrl { get; set; }
        string NextUrl { get; set; }
        string PreviousUrl { get; set; }
        bool? NoIndex { get; set; }
    }

    public interface IPageContext
    {
        [System.Runtime.Serialization.IgnoreDataMember]
        [Newtonsoft.Json.JsonIgnore]
        [System.Text.Json.Serialization.JsonIgnore]
        NameValueCollection Query { get; }
        [System.Runtime.Serialization.IgnoreDataMember]
        [System.Text.Json.Serialization.JsonIgnore]
        [Newtonsoft.Json.JsonIgnore]
        IRequestCookieCollection Cookies { get; }
        string ThemeId { get; }
        bool IsDebugMode { get; }

        SortingParameters Sorting { get; set; }
        string CdnCacheBustKey { get; }
        PagingParameters Pagination { get; set; }
        bool HandledByProxy { get; set; }
        bool IsSecure { get; set; }
        string PageType { get; set; }
        string PageTypeId { get; set; }
        List<KeyValuePair<string, string>> ShippingCountries { get; set; }
        List<KeyValuePair<string, string>> BillingCountries { get; set; }
        bool IsCrawler { get; }
        ICrawlerInfo CrawlerInfo { get; }
        bool IsMobile { get; }
        bool IsTablet { get; }
        bool IsDesktop { get; }
        CmsPageContext CmsContext { get; set; }
        SearchContext Search { get; set; }
        Visit Visit { get; set; }
        string Title { get; set; }
        string MetaDescription { get; set; }
        string MetaTitle { get; set; }
        string VariationId { get; set; }
        JArray Variations { get; set; }
        string MetaKeywords { get; set; }
        EditModes? EditMode { get; set; }
        UX.Models.Customers.User User { get; set; }
        UserProfile UserProfile { get; }
        LocationInfo PurchaseLocation { get; }
        string ProductCode { get; set; }
        string FeedUrl { get; set; }
        string ListName { get; set; }
        string ListViewName { get; set; }
        string DocumentId { get; set; }
        bool IsEditMode { get; set; }
        string Url { get; set; }
        DataViewModeType DataViewMode { get; set; }
        string SecureHost { get; set; }
        List<KeyValuePair<string, string>> BillingStates { get; set; }
        List<KeyValuePair<string, string>> ShippingStates { get; set; }
        string VisaCheckoutButtonUrl { get; set; }
        string VisaCheckoutJavaScriptSdkUrl { get; set; }
        JObject ReasonCollection { get; set; }
        DateTime Now { get; set; }
        string CategoryCode { get; set; }
        int? CategoryId { get; set; }
        List<Core.Extensible.Contracts.Attribute> StorefrontOrderAttributes { get; set; }
        string CorrelationId { get;  }
        Currency CurrencyInfo
        {
            get;
        }

        NumberFormatInfo NumberFormat
        {
            get; 
        }
        
        CurrencyRateInfo CurrencyRateInfo
        {
            get;
        }
        DebugModeFlagValues DebugFlags { get; }

        [System.Runtime.Serialization.IgnoreDataMember]
        [System.Text.Json.Serialization.JsonIgnore]
        [Newtonsoft.Json.JsonIgnore]
        public string MonetateId
        {
            get;
            set;
        }
    }

    public class CrawlerInfo: ICrawlerInfo
    {
        public bool IsCrawler { get; set; }
        public string CanonicalUrl { get; set; }
        public string NextUrl { get; set; }
        public string PreviousUrl { get; set; }
        public bool? NoIndex { get; set; }
    }

    public interface IIpAddressFinderOuter
    {
        string IpAddress { get; set; }
    }

    public class IpAddressFinderOuter: IIpAddressFinderOuter
    {
        public IpAddressFinderOuter(HttpContext context)
        {
            if (context.Request == null) return;
            if (context.Request.Headers.TryGetValue("x-forwarded-for", out var val) == false || val.Any() == false)
            {
                val = new string[] { context.Request.Headers["REMOTE_ADDR"] };
            }
            IpAddress = val.Where(_ => !string.IsNullOrEmpty(_)).SelectMany( _ => _.Split(',')).Select(_ => _.Trim()).FirstOrDefault(_ => _.IsIPAddressValid());
                
            if (!IpAddress.IsIPAddressValid())
            {
                IpAddress = "127.0.0.1";
            }
        }
        public string IpAddress { get; set; }
    }


    public class PageContext : IEditableContext, IPageContext
    {
        private ISiteBuilderApiContext _apiContext;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly ISettings _settings;
        private IMobileDetectionProvider _mobileDetectionProvider;
        private readonly HttpContext _context;
        private ISiteContext _siteContext;

        private PageContext()
        {

        }
        public static PageContext CreateForTesting(ISiteBuilderApiContext apiContext = null , IMobileDetectionProvider mobileDetectionProvider = null , ISiteContext siteContext = null)
        {
            var pc = new PageContext()
            {
                _apiContext = apiContext,
                 _mobileDetectionProvider = mobileDetectionProvider,
                _siteContext = siteContext
            };
            return pc;
        }
        public PageContext(ISiteBuilderApiContext apiContext, IAuthenticationHelper authenticationHelper, ISettings settings, IMobileDetectionProvider mobileDetectionProvider, HttpContext context, IRequestUrlFinderOuter requestURLGetter, Lazy<ICategoryTreeProvider> categoryTreeProvider
            , IIpAddressFinderOuter ipAddressFinderOuter,
            ISiteContext siteContext)
        {
            _apiContext = apiContext;
            _authenticationHelper = authenticationHelper;
            _settings = settings;
            _mobileDetectionProvider = mobileDetectionProvider;
            _context = context;
            _siteContext = siteContext;
            _crawlerInfo = new CrawlerInfo()
            {
                IsCrawler = IsCrawler
            };

            IsEditMode = _apiContext.IsEditMode;
            HandledByProxy = IsHeaderTrue(Core.Api.Contracts.Constants.Headers.HANDLED_BY_PROXY, _context);
            IsSecure = IsHeaderTrue(Core.Api.Contracts.Constants.Headers.SSL_HANDLED, _context);
            Now = apiContext.PreviewDate.GetValueOrDefault(DateTime.UtcNow);
            Url = requestURLGetter.GetRequestUrl();
            Search = SearchContext.Get(_context.Request);
            Sorting = SortingParameters.Create(Search);
            Pagination = PagingParameters.Create(Search);
            SecureHost = _settings.CoreSettings.IsSSLValidationEnabled ? CreateSecureUrl(Url) : CreateDefaultUrl(Url);
            DataViewMode = apiContext.DataViewMode;
            _userProfile = new Lazy<UserProfile>(() => CreateProfileFromToken(_apiContext.UserClaims, _authenticationHelper));
            PurchaseLocation = string.IsNullOrWhiteSpace(apiContext.PurchaseLocation) ? null : new LocationInfo() { Code = apiContext.PurchaseLocation };
            _user = new Lazy<User>(() => CreateUserFromClaims(_apiContext.UserClaims, _userProfile));
            IpAddress = ipAddressFinderOuter.IpAddress;
            try
            {
                var mid = string.Empty;
                if (context?.Request?.Cookies?.TryGetValue("mt.v", out  mid)== true)
                {
                    this.MonetateId = mid?.Trim();
                }

            }
            catch
            {
            }
        }

        bool _initCurrency = false;
        void InitCurrencySettings()
        {
            if (_initCurrency)
            {
                return;
            }
            _initCurrency = true;


            if (_siteContext.CurrencyExchangeRate != null &&
                Enum.TryParse(_siteContext.CurrencyExchangeRate.ToCurrencyCode, out CurrencyCode cc))
            {
                CurrencyInfo = CurrencyRepository.Get(cc);

                NumberFormat = new NumberFormatInfo()
                {
                    CurrencyDecimalDigits = CurrencyInfo.Precision,
                    CurrencySymbol = CurrencyInfo.Symbol
                };

                CurrencyRateInfo = new CurrencyRateInfo()
                {
                    Rate = _siteContext.CurrencyExchangeRate.Rate,
                    Rounding = _siteContext.CurrencyExchangeRate.DecimalPlaces
                };
            }
            else
            {
                var localeCode = _apiContext.LocaleCode;
                var cultureNumberFormatInfo = (localeCode != null) ? CultureInfo.GetCultureInfo(localeCode).NumberFormat : null;
                NumberFormat = _siteContext.NumberFormat;
                if (cultureNumberFormatInfo != null && NumberFormat != null)
                {
                    NumberFormat.CurrencyPositivePattern = cultureNumberFormatInfo.CurrencyPositivePattern;
                    NumberFormat.CurrencyNegativePattern = cultureNumberFormatInfo.CurrencyNegativePattern;
                }
                CurrencyInfo = _siteContext.CurrencyInfo;
                CurrencyRateInfo = CurrencyRateInfo.Empty;
            }
        }

        [JsonPreloadFilter]
        public string CorrelationId => _apiContext.TraceContext?.CorrelationId;

        [JsonPreloadFilter]
        public string IpAddress
        {
            get;
            set;
        }

        static UserProfile CreateProfileFromToken(LightweightUserClaims userClaims, IAuthenticationHelper _authenticationHelper)
        {
            string ptoken = _authenticationHelper.GetProfileToken();

            var prof = new UserProfile
            {
                UserId = userClaims?.UserId
            };

            if (string.IsNullOrEmpty(ptoken)) return prof;
            try
            {
                UserProfile pt = UserProfile.Parse(ptoken);
                prof.EmailAddress = pt.EmailAddress;
                prof.FirstName = pt.FirstName;
                prof.LastName = pt.LastName;
            }
            catch
            {
            }

            return prof;
        }

        static User CreateUserFromClaims(LightweightUserClaims userClaims, Lazy<UserProfile> userProfile)
        {
            var accountId = -1;

            //TODO: chusk 18 Nov 2015 - should maybe default to some dummy placeholder User.
            if (userClaims == null) return null;
            var profile = userProfile.Value;
            if (profile == null) return null;
            var segments = new List<string>();
            if (userClaims.Bag != null)
            {
                if (userClaims.Bag.TryGetValue("AccountId", out var tempStr))
                {
                    if (!int.TryParse(tempStr, out accountId))
                    {
                        accountId = -1;
                    }
                }
                if (userClaims.Bag.TryGetValue("segments", out tempStr) && !string.IsNullOrEmpty(tempStr))
                {
                    try
                    {
                        segments = JsonConvert.DeserializeObject<List<string>>(tempStr);
                    }
                    catch { }
                }
            }
            var behaviors = new List<int>();
            if (userClaims.BehaviorIds != null && userClaims.BehaviorIds.Any())
            {
                behaviors.AddRange(userClaims.BehaviorIds);
            }

            return new User
            {
                Email = userProfile.Value.EmailAddress,
                FirstName = userProfile.Value.FirstName,
                LastName = userProfile.Value.LastName,
                UserId = userClaims.UserId,
                AccountId = accountId > 0 ? accountId : (int?)null,
                IsAuthenticated = !userClaims.IsAnonymous && userClaims.IsAuthenticationHot,
                IsAnonymous = userClaims.IsAnonymous,
                Segments = segments,
                Behaviors = behaviors
            };
        }

        private static string CreateDefaultUrl(string url)
        {
            return GetSchemeAndServer(new UriBuilder(url).Uri);
        }

        private static string GetSchemeAndServer(Uri uri)
        {
            return uri.GetComponents(UriComponents.SchemeAndServer, UriFormat.Unescaped);
        }

        private static string CreateSecureUrl(string url)
        {
            var uriBuilder = new UriBuilder(url);
            var host = GetSchemeAndServer(uriBuilder.Uri);
            uriBuilder.Port = 443;
            uriBuilder.Scheme = "https";
            return GetSchemeAndServer(uriBuilder.Uri);
        }

        [System.Runtime.Serialization.IgnoreDataMember]
        [Newtonsoft.Json.JsonIgnore]
        [System.Text.Json.Serialization.JsonIgnore]
        public NameValueCollection Query => HttpUtility.ParseQueryString(_context.Request.QueryString.Value);

        [System.Runtime.Serialization.IgnoreDataMember]
        [Newtonsoft.Json.JsonIgnore]
        [System.Text.Json.Serialization.JsonIgnore]
        public IRequestCookieCollection Cookies => _context.Request.Cookies;

        private string _themeId;

        //used to serialize out the themid to the page.   Sitecontext is still kinda the canonical loc, but since based on user agent ... needs to be lesser client cached page context 
        public string ThemeId
        {
            get => _themeId ??= this._context.RequestServices.Resolve<SiteContext>().ThemeId;
            set => _themeId = value;
        }
        [JsonPreloadFilter]
        public bool IsDebugMode => _apiContext.IsDebugMode;

        public DebugModeFlagValues DebugFlags => _apiContext.DebugFlags;
        [System.Runtime.Serialization.IgnoreDataMember]
        [Newtonsoft.Json.JsonIgnore]
        [System.Text.Json.Serialization.JsonIgnore]
        public string MonetateId { get; set; }

        public SortingParameters Sorting
        {
            get; set;
        }
        string _cdnCacheBustKey;
        public string CdnCacheBustKey
        {
            get => _cdnCacheBustKey ?? _context.RequestServices.Resolve<ISiteContext>().GeneralSettings.CdnCacheBustKey;
            set => _cdnCacheBustKey = value;
        }

        public PagingParameters Pagination
        {
            get; set;
        }

        bool IsHeaderTrue(string headerName, HttpContext context)
        {
            if (!context.Request.Headers.TryGetValue(headerName, out var values)) return false;

            var val = values.FirstOrDefault();
            if (bool.TryParse(val, out var ret))
            {
                return ret;
            }

            return val == "1";
        }

        [System.Text.Json.Serialization.JsonIgnore]
        [System.Runtime.Serialization.IgnoreDataMember]
        public bool HandledByProxy { get; set; }

        /// <summary>
        /// is this request via https or not
        /// </summary>
        public bool IsSecure { get; set; }
        public string PageType { get; set; }
        public string PageTypeId { get; set; }
        public List<KeyValuePair<string, string>> ShippingCountries { get; set; }
        public List<KeyValuePair<string, string>> BillingCountries { get; set; }
        [JsonPreloadFilter] public bool IsCrawler => _mobileDetectionProvider.IsCurrentRequestCrawler;

        [JsonPreloadFilter] public bool IsMobile => _mobileDetectionProvider.IsCurrentRequestMobile;

        [JsonPreloadFilter]
        public bool IsTablet => _mobileDetectionProvider.IsCurrentRequestTablet;

        [JsonPreloadFilter]
        public bool IsDesktop => (!_mobileDetectionProvider.IsCurrentRequestMobile &&!_mobileDetectionProvider.IsCurrentRequestTablet);

        public CmsPageContext CmsContext { get; set; }

        SearchContext _sc;
        public SearchContext Search
        {
            get => _sc ?? SearchContext.Get(_context.Request);
            set => _sc = value;
        }
        [JsonPreloadFilter]
        public Visit Visit
        {
            get; set;
        }

        public string Title { get; set; }

        public string MetaDescription { get; set; }

        public string MetaTitle { get; set; }

        public string MetaKeywords { get; set; }

        [JsonConverter(typeof(StringEnumConverter))]
        public EditModes? EditMode { get; set; }

        private Lazy<UserProfile> _userProfile;
        private Lazy<User> _user;
        [JsonPreloadFilter]
        public User User
        {
            get => _user.Value;
            set
            {
                _user = new Lazy<User>(() => value);
            }
        }
        [JsonPreloadFilter]
        public UserProfile UserProfile
        {
            get => _userProfile.Value;
            set
            {
                _userProfile = new Lazy<UserProfile>(() => value);
            }
        }
        [JsonPreloadFilter]
        public LocationInfo PurchaseLocation { get; set; }


        public string ProductCode { get; set; }

        public string FeedUrl { get; set; }

        public string ListName { get; set; }

        public string ListViewName { get; set; }

        public string DocumentId { get; set; }
        [JsonPreloadFilter]
        public bool IsEditMode { get => _apiContext.IsEditMode;
            set => _apiContext.IsEditMode = value;
        }
        [JsonPreloadFilter]
        public bool IsAdminMode => _apiContext.IsAdminMode;

        public string VariationId { get; set; }
        public JArray Variations { get; set; }
        public string Url { get; set; }

        public DataViewModeType DataViewMode { get; set; }

        public string SecureHost { get; set; }

        public List<KeyValuePair<string, string>> BillingStates { get; set; }
        public List<KeyValuePair<string, string>> ShippingStates { get; set; }
        public string VisaCheckoutButtonUrl { get; set; }
        public string VisaCheckoutJavaScriptSdkUrl { get; set; }
        public JObject ReasonCollection { get; set; }
        [JsonPreloadFilter]
        public DateTime Now { get; set; }

        public string CategoryCode { get; set; }
        public int? CategoryId { get => Search.CategoryId;
            set => Search.CategoryId = value;
        }
        public List<Core.Extensible.Contracts.Attribute> StorefrontOrderAttributes { get; set; }


        ICrawlerInfo _crawlerInfo;
        [JsonPreloadFilter]
        public ICrawlerInfo CrawlerInfo => _crawlerInfo;

        Currency _currency;
        public Currency CurrencyInfo
        {
            get
            {
                InitCurrencySettings();
                return _currency;
            }
            set => _currency = value;
        }

        NumberFormatInfo _numberFormatInfo;
        public NumberFormatInfo NumberFormat
        {
            get
            {
                InitCurrencySettings();
                return _numberFormatInfo;
            }
            set => _numberFormatInfo = value;
        }

        
        CurrencyRateInfo _currencyRateInfo;
        [JsonPreloadFilter]
        public CurrencyRateInfo CurrencyRateInfo
        {
            get
            {
                InitCurrencySettings();
                return _currencyRateInfo;
            }
            set => _currencyRateInfo = value;
        }
      
    }
    public class LocationInfo
    {
        [JsonPreloadFilter]
        public string Code { get; set; }
    }
    public class CurrencyRateInfo
    {
        [JsonPreloadFilter]
        public decimal? Rate { get; set; }
        [JsonPreloadFilter]
        public int? Rounding { get; set; }
        public static readonly CurrencyRateInfo Empty = new CurrencyRateInfo();
        public bool IsEmpty()
        {
            return Equals(Empty, this);
        }

    }


}

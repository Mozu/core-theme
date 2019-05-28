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
using Mozu.Core.Money;
using Mozu.SiteBuilder.Mvc.Tags;


namespace Mozu.SiteBuilder.Mvc.Contexts
{
    public class PagingParameters
    {
        private SearchContext search;

        public PagingParameters(SearchContext search)
        {
            // TODO: Complete member initialization
            this.search = search;
        }
        public string FacetValueFilter
        {
            get
            {
                return search.ToFacetValueFilter();
            }
            set { throw new NotSupportedException(); }
        }
        public int? PageSize
        {
            get
            {
                return search.PageSize;
            }
            set { throw new NotSupportedException(); }
        }
        public int? StartIndex
        {
            get
            {
                return search.StartIndex;
            }
            set { throw new NotSupportedException(); }
        }
      

        public static PagingParameters Create(SearchContext  search)
        {
            return new PagingParameters(search);
            
        }
        public override string ToString()
        {
            return string.Format("PagingParameters,{0},{1},{2}", this.StartIndex, this.PageSize, this.FacetValueFilter );
        }
    }

    public static class CmsContextExtensions
    {
        public static string GetTemplate(this DocumentRequest documentRequest, SiteContext siteContext, string defaultTemplate = null)
        {
            if (documentRequest != null &&  documentRequest.Document!= null)
            {
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
               
            }
            return defaultTemplate;
        }
    } 

    public class SortingParameters
    {
        private SearchContext search;

        public SortingParameters(SearchContext search)
        {
           
            this.search = search;
        }
        public string Sort
        {
            get
            {
                return this.search.SortBy;
            }
            set
            {
                throw new NotSupportedException();
            }
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
        NameValueCollection Query { get; }
        HttpCookieCollection Cookies { get; }
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
        public IpAddressFinderOuter(HttpRequestMessage request)
        {
            if (request != null)
            {
                IEnumerable<string> val = null;
                if ( request?.Headers.TryGetValues("x-forwarded-for", out val) == false || val?.Any()== false)
                {
                    val = new string[] { ((System.Web.HttpContextWrapper)request?.Properties["MS_HttpContext"])?.Request?.ServerVariables["REMOTE_ADDR"] };
                }
                IpAddress = val?.SelectMany( _ => _.Split(',')).Select(_ => _.Trim()).Where(_ => _.IsIPAddressValid()).FirstOrDefault();
                
                if ( !IpAddress.IsIPAddressValid())
                {
                    IpAddress = "127.0.0.1";
                }
            }
        }
        public string IpAddress { get; set; }
    }


    public class PageContext : IEditableContext, IPageContext
    {
        private ISiteBuilderApiContext _apiContext;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly HttpRequestMessage _requestMessage;
        private readonly ISettings _settings;
        private IMobileDetectionProvider _mobileDetectionProvider;
        private readonly HttpContextBase _context;
        private ISiteContext _siteContext;
        LocationInfo _location;

        private PageContext()
        {

        }
        public static PageContext CreateForTesting(ISiteBuilderApiContext apiContext = null, IMobileDetectionProvider mobileDetectionProvider = null, ISiteContext siteContext = null)
        {
            var pc = new PageContext()
            {
                _apiContext = apiContext,
                _mobileDetectionProvider = mobileDetectionProvider,
                _siteContext = siteContext
            };
            return pc;
        }
        public PageContext(ISiteBuilderApiContext apiContext, IAuthenticationHelper authenticationHelper, HttpRequestMessage requestMessage, ISettings settings, IMobileDetectionProvider mobileDetectionProvider, HttpContextBase context, IRequestUrlFinderOuter requestURLGetter, Lazy<ICategoryTreeProvider> categoryTreeProvider
            , IIpAddressFinderOuter ipAddressFinderOuter,
            ISiteContext siteContext)
        {
            _apiContext = apiContext;
            _authenticationHelper = authenticationHelper;
            _requestMessage = requestMessage;
            _settings = settings;
            _mobileDetectionProvider = mobileDetectionProvider;
            _context = context;
            this._siteContext = siteContext;
            _crawlerInfo = new CrawlerInfo()
            {
                IsCrawler = IsCrawler
            };

            IsEditMode = _apiContext.IsEditMode;
            HandledByProxy = IsHeaderTrue(Core.Api.Contracts.Constants.Headers.HANDLED_BY_PROXY, requestMessage);
            IsSecure = IsHeaderTrue(Core.Api.Contracts.Constants.Headers.SSL_HANDLED, requestMessage);
            Now = apiContext.PreviewDate.GetValueOrDefault(DateTime.UtcNow);
            Url = requestURLGetter.GetRequestUrl();

            Sorting = SortingParameters.Create(Search);
            Pagination = PagingParameters.Create(Search);
            SecureHost = _settings.CoreSettings.IsSSLValidationEnabled ? CreateSecureUrl(Url) : CreateDefaultUrl(Url);
            DataViewMode = apiContext.DataViewMode;
            _userProfile = new Lazy<UserProfile>(() => CreateProfileFromToken(_apiContext.UserClaims, _authenticationHelper));
            _location = string.IsNullOrWhiteSpace(apiContext.PurchaseLocation) ? null : new LocationInfo() { Code = apiContext.PurchaseLocation };
            _user = new Lazy<User>(() => CreateUserFromClaims(_apiContext.UserClaims, _userProfile));
            IpAddress = ipAddressFinderOuter.IpAddress;
        }

        bool _initCurrency = false;
        void InitCurrencySettings()
        {
            if (_initCurrency == true)
            {
                return;
            }
            _initCurrency = true;
            Mozu.Core.Money.CurrencyCode cc;


            if (_siteContext.CurrencyExchangeRate != null &&
                Mozu.Core.Money.CurrencyCode.TryParse(_siteContext.CurrencyExchangeRate.ToCurrencyCode, out cc))
            {
                CurrencyInfo = Mozu.Core.Money.CurrencyRepository.Get(cc);
     

                NumberFormat = new NumberFormatInfo()
                {
                    CurrencyDecimalDigits = CurrencyInfo.Precision,
                    CurrencySymbol = CurrencyInfo.Symbol
                };

                this.CurrencyRateInfo = new CurrencyRateInfo()
                {
                    Rate = _siteContext.CurrencyExchangeRate.Rate,
                    Rounding = _siteContext.CurrencyExchangeRate.DecimalPlaces
                };
            }
            else
            {
                var localeCode = _apiContext.LocaleCode;
                NumberFormatInfo cultureNumberFormatInfo;
                cultureNumberFormatInfo = (localeCode != null) ? CultureInfo.GetCultureInfo(localeCode).NumberFormat : null;
                NumberFormat = _siteContext.NumberFormat;
                if (cultureNumberFormatInfo != null && NumberFormat != null)
                {
                    NumberFormat.CurrencyPositivePattern = cultureNumberFormatInfo.CurrencyPositivePattern;
                    NumberFormat.CurrencyNegativePattern = cultureNumberFormatInfo.CurrencyNegativePattern;
                }
                CurrencyInfo = _siteContext.CurrencyInfo;
                this.CurrencyRateInfo = CurrencyRateInfo.Empty;
            }
        }

        [JsonPreloadFilter]
        public string CorrelationId
        {
            get { return _apiContext.TraceContext?.CorrelationId; }
        }
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
                UserId = userClaims != null ? userClaims.UserId : null
            };

            if (!string.IsNullOrEmpty(ptoken))
            {
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
            }

            return prof;
        }

        static User CreateUserFromClaims(LightweightUserClaims userClaims, Lazy<UserProfile> userProfile)
        {
            string tempStr;
            int accountId = -1;

            //TODO: chusk 18 Nov 2015 - should maybe default to some dummy placeholder User.
            if (userClaims == null) return null;
            var profile = userProfile.Value;
            if (profile == null) return null;
            var segments = new List<string>();
            if (userClaims.Bag != null)
            {

                if (userClaims.Bag.TryGetValue("AccountId", out tempStr))
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
        public NameValueCollection Query
        {
            get { return _context.Request.QueryString; }
        }

        [System.Runtime.Serialization.IgnoreDataMember]
        [Newtonsoft.Json.JsonIgnore]
        public HttpCookieCollection Cookies
        {
            get { return _context.Request.Cookies; }
        }

        private string _themeId;


        //used to serialize out the themid to the page.   Sitecontext is still kinda the canonical loc, but since based on user agent ... needs to be lesser client cached page context 
        public string ThemeId
        {
            get
            {
                if (_themeId == null)
                {
                    _themeId = this._requestMessage.Resolve<SiteContext>().ThemeId;
                }
                return _themeId;
            }
            set
            {
                _themeId = value;
            }
        }
        [JsonPreloadFilter]
        public bool IsDebugMode
        {
            get { return _apiContext.IsDebugMode; }
        }
        public DebugModeFlagValues DebugFlags => _apiContext.DebugFlags;

        public SortingParameters Sorting
        {
            get; set;
        }
        string _cdnCacheBustKey;
        public string CdnCacheBustKey
        {
            get { return _cdnCacheBustKey ?? _requestMessage.Resolve<ISiteContext>().GeneralSettings.CdnCacheBustKey; }
            set { _cdnCacheBustKey = value; }
        }

        public PagingParameters Pagination
        {
            get; set;
        }

        bool IsHeaderTrue(string headerName, HttpRequestMessage requestMessage)
        {
            IEnumerable<string> values;
            if (requestMessage.Headers.TryGetValues(headerName, out values))
            {


                bool ret;
                var val = values.FirstOrDefault();
                if (bool.TryParse(val, out ret))
                {
                    return ret;
                }

                return val == "1";
            }
            return false;
            ;
        }


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
        [JsonPreloadFilter]
        public bool IsCrawler
        {
            get { return _mobileDetectionProvider.IsCurrentRequestCrawler; }
        }
        [JsonPreloadFilter]
        public bool IsMobile
        {
            get { return _mobileDetectionProvider.IsCurrentRequestMobile; }
        }
        [JsonPreloadFilter]
        public bool IsTablet
        {
            get { return _mobileDetectionProvider.IsCurrentRequestTablet; }
        }
        [JsonPreloadFilter]
        public bool IsDesktop
        {
            get
            {
                return (!_mobileDetectionProvider.IsCurrentRequestMobile &&
                        !_mobileDetectionProvider.IsCurrentRequestTablet);
            }
        }

        public CmsPageContext CmsContext { get; set; }

        SearchContext _sc;
        public SearchContext Search
        {
            get
            {
                return _sc ?? SearchContext.Get(_requestMessage);
            }
            set
            {
                _sc = value;
            }
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
            get
            {
                return _user.Value;
            }
            set
            {
                _user = new Lazy<User>(() => value);
            }
        }
        [JsonPreloadFilter]
        public UserProfile UserProfile
        {
            get
            {
                return _userProfile.Value;
            }
            set
            {
                _userProfile = new Lazy<UserProfile>(() => value);
            }
        }
        [JsonPreloadFilter]
        public LocationInfo PurchaseLocation
        {
            get
            {
                return _location;
            }
            set
            {
                _location = value;
            }
        }


        public string ProductCode { get; set; }

        public string FeedUrl { get; set; }

        public string ListName { get; set; }

        public string ListViewName { get; set; }

        public string DocumentId { get; set; }
        [JsonPreloadFilter]
        public bool IsEditMode { get { return _apiContext.IsEditMode; } set { _apiContext.IsEditMode = value; } }
        [JsonPreloadFilter]
        public bool IsAdminMode { get { return _apiContext.IsAdminMode; } }
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
        public int? CategoryId { get { return Search.CategoryId; } set { Search.CategoryId = value; } }
        public List<Core.Extensible.Contracts.Attribute> StorefrontOrderAttributes { get; set; }


        ICrawlerInfo _crawlerInfo;
        [JsonPreloadFilter]
        public ICrawlerInfo CrawlerInfo
        {
            get
            {
                return _crawlerInfo;
            }

        }
        Currency _currency;
        public Currency CurrencyInfo
        {
            get
            {
                InitCurrencySettings();
                return _currency;
            }
            set
            {
                _currency = value;
            }
        }

        NumberFormatInfo _numberFormatInfo;
        public NumberFormatInfo NumberFormat
        {
            get
            {
                InitCurrencySettings();
                return _numberFormatInfo;
            }
            set
            {
                _numberFormatInfo = value;
            }
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
            set
            {
                _currencyRateInfo = value;
            }
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
            return Object.Equals(Empty, this);
        }

    }


}

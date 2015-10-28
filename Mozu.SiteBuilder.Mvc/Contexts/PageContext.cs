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
        bool IsMobile { get; }
        bool IsTablet { get; }
        bool IsDesktop { get; }
        CmsPageContext CmsContext { get; set; }
        SearchContext Search { get; set; }
        Visit Visit { get; set; }
        string Title { get; set; }
        string MetaDescription { get; set; }
        string MetaTitle { get; set; }
        string MetaKeywords { get; set; }
        EditModes? EditMode { get; set; }
        UX.Models.Customers.User User { get; set; }
        UserProfile UserProfile { get; }
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
    }

    public class PageContext : IEditableContext, IPageContext
    {
        private readonly ISiteBuilderApiContext _apiContext;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly HttpRequestMessage _requestMessage;
        private readonly ISettings _settings;
        private readonly IMobileDetectionProvider _mobileDetectionProvider;
        private readonly HttpContextBase _context;

        public PageContext(ISiteBuilderApiContext apiContext, IAuthenticationHelper authenticationHelper, HttpRequestMessage requestMessage, ISettings settings, IMobileDetectionProvider mobileDetectionProvider, HttpContextBase context, IRequestUrlFinderOuter requestURLGetter, Lazy<ICategoryTreeProvider> categoryTreeProvider)
        {
            _apiContext = apiContext;
            _authenticationHelper = authenticationHelper;
            _requestMessage = requestMessage;
            _settings = settings;
            _mobileDetectionProvider = mobileDetectionProvider;
            _context = context;

            IsEditMode = _apiContext.IsEditMode;
            HandledByProxy = IsHeaderTrue(Core.Api.Contracts.Constants.Headers.HANDLED_BY_PROXY, requestMessage);
            IsSecure = IsHeaderTrue(Core.Api.Contracts.Constants.Headers.SSL_HANDLED, requestMessage);
            Now = apiContext.PreviewDate.GetValueOrDefault(DateTime.UtcNow);
            Url = requestURLGetter.GetRequestUrl();
           
            Sorting = SortingParameters.Create(Search);
            Pagination = PagingParameters.Create(Search);
            SecureHost = _settings.CoreSettings.IsSSLValidationEnabled ? CreateSecureUrl(Url) : CreateDefaultUrl(Url);
            DataViewMode = apiContext.DataViewMode;
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
        }

        public bool IsDebugMode 
        {
            get { return _apiContext.IsDebugMode; }
        }
        public SortingParameters Sorting
        {
            get; set;
        }

        public string CdnCacheBustKey
        {
            get { return _requestMessage.Resolve<ISiteContext>().GeneralSettings.CdnCacheBustKey; }
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




        public bool IsCrawler
        {
            get { return _mobileDetectionProvider.IsCurrentRequestCrawler; }
        }
        
        public bool IsMobile
        {
            get { return _mobileDetectionProvider.IsCurrentRequestMobile; }
        }
        
        public bool IsTablet
        {
            get { return _mobileDetectionProvider.IsCurrentRequestTablet; }
        }
        
        public bool IsDesktop
        {
            get
            {
                return (!_mobileDetectionProvider.IsCurrentRequestMobile &&
                        !_mobileDetectionProvider.IsCurrentRequestTablet);
            }
        }

        public CmsPageContext CmsContext {get;set;}

        public SearchContext  Search
        {
            get
            {
                return SearchContext.Get(_requestMessage);
            }
            set
            {
                ;
            }
        }


       
        public Visit Visit {
            get; set;
        }

        public string Title { get; set; }

      
        public string MetaDescription { get; set; }

        public string MetaTitle { get; set; }

        public string MetaKeywords { get; set; }

        [JsonConverter(typeof(StringEnumConverter))]
        public EditModes? EditMode { get; set; }


        

        


        private UserProfile _userProfile;
        private UX.Models.Customers.User _user;

        public UX.Models.Customers.User User
        {
            get
            {
                if (_user == null)
                {


                    string tempStr;
                    int accountId = -1;
                    if (_apiContext.UserClaims.Bag.TryGetValue("AccountId", out tempStr))
                    {
                        if (!int.TryParse(tempStr, out accountId))
                        {
                            accountId = -1;
                        }
                    }

                    _user = _user ?? new UX.Models.Customers.User
                                     {
                                         Email = UserProfile.EmailAddress, //profile != null ? profile.EmailAddress : null,
                                         FirstName = UserProfile.FirstName, // profile != null ? profile.FirstName : null,
                                         LastName = UserProfile.LastName, // profile != null ? profile.LastName : null,
                                         UserId = _apiContext.UserClaims.UserId, // gcu.UserId,
                                         AccountId = accountId > 0 ? (int?) accountId : (int?) null,


                                         IsAuthenticated = !_apiContext.UserClaims.IsAnonymous && _apiContext.UserClaims.IsAuthenticationHot, //!gcu.IsAnonymous && gcu.IsAuthenticated,
                                         IsAnonymous = _apiContext.UserClaims.IsAnonymous
                                     };
                }
                return _user;
            }
            set
            {
                _user = value;
            }
        }



        public UserProfile UserProfile
        {
            get
            {
                if (_userProfile == null)
                {
                    string ptoken = _authenticationHelper.GetProfileToken();

                    _userProfile = new UserProfile
                    {
                        UserId = _apiContext.UserClaims != null ? _apiContext.UserClaims.UserId : null
                    };

                    if (!string.IsNullOrEmpty(ptoken))
                    {
                        try
                        {
                            UserProfile pt = UserProfile.Parse(ptoken);
                            ((UserProfile)_userProfile).EmailAddress = pt.EmailAddress;
                            ((UserProfile)_userProfile).FirstName = pt.FirstName;
                            ((UserProfile)_userProfile).LastName = pt.LastName;
                        }
                        catch
                        {
                        }
                    }
                }
                return _userProfile as UserProfile;
            }
        }


    //cms docs and template ids

       

        public string ProductCode { get; set; }

      

        public string FeedUrl { get; set; }

        public string ListName { get; set; }

        public string ListViewName { get; set; }

        public string DocumentId { get; set; }

        public bool IsEditMode { get { return _apiContext.IsEditMode;  } set { _apiContext.IsEditMode = value; } }

        public string Url { get; set; }

        public DataViewModeType DataViewMode { get; set; }

        //public string IpAddress
        //{
        //    get
        //    {
        //        var req = System.Web.HttpContext.Current.Request;
        //        return req.Headers["x-forwarded-for"] ?? req.ServerVariables["REMOTE_ADDR"];;
        //    }
        //}


        public string SecureHost { get; set; }

        public List<KeyValuePair<string, string>> BillingStates { get; set; }
        public List<KeyValuePair<string, string>> ShippingStates { get; set; }
        public string VisaCheckoutButtonUrl { get; set; }
        public string VisaCheckoutJavaScriptSdkUrl { get; set; }
        public JObject ReasonCollection { get; set; }
        public DateTime Now { get; set; }

        public  string CategoryCode { get; set; }
        public int? CategoryId { get { return Search.CategoryId; } set { Search.CategoryId = value; } }
    }
}

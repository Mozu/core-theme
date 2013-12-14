using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Configuration;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using FiftyOne.Foundation.Mobile.Detection;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.Visit;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Mozu.SiteBuilder.Mvc.Contexts
{
    public class PageContext : Mozu.SiteBuilder.UX.Models.IEditableContext
    {
        private readonly ISiteBuilderApiContext _apiContext;
        private readonly IAuthenticationHelper _authenticationHelper;

        public PageContext(ISiteBuilderApiContext  apiContext, IAuthenticationHelper authenticationHelper, HttpRequestMessage requestMessage)
        {
            _apiContext = apiContext;
            _authenticationHelper = authenticationHelper;
            this.IsEditMode = _apiContext.IsEditMode;
            IEnumerable<string> values;
           
            HandledByProxy = IsheaderTrue(Mozu.Core.Api.Contracts.Constants.Headers.HANDLED_BY_PROXY, requestMessage);
           
            IsSecure = IsheaderTrue(Mozu.Core.Api.Contracts.Constants.Headers.SSL_HANDLED, requestMessage); 
       
            string origionalUrl = null;

            if (requestMessage.Headers.TryGetValues(Mozu.Core.Api.Contracts.Constants.Headers.ORIGINAL_URL, out values))
            {
                this.Url = values.FirstOrDefault();
            }



        }

        bool IsheaderTrue(string headerName, HttpRequestMessage requestMessage)
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

        public bool IsSecure { get; set; }
        public string PageType { get; set; }
        public string PageTypeId { get; set; }

        public CmsPageContext CmsContext {get;set;}

        public SearchContext  Search
        { get; set; }
        public Visit Visit { get; set; }

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


                                         IsAuthenticated = !_apiContext.UserClaims.IsAnonymous && _apiContext.UserClaims.IsAuthenticated, //!gcu.IsAnonymous && gcu.IsAuthenticated,
                                         IsAnonymous = _apiContext.UserClaims.IsAnonymous
                                     };
                }
                return _user;
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

        public int? CategoryId { get; set; }

        public string FeedUrl { get; set; }

        public string CollectionId { get; set; }

        public string DocumentId { get; set; }

        public bool IsEditMode { get; set; }

        public string Url { get; set; }
    }
}

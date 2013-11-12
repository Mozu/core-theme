using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Mozu.SiteBuilder.Mvc.Contexts
{
    public class PageContext : Mozu.SiteBuilder.UX.Models.IEditableContext
    {
        private readonly ISiteBuilderApiContext _apiContext;
        private readonly IAuthenticationHelper _authenticationHelper;

        public PageContext(ISiteBuilderApiContext  apiContext, IAuthenticationHelper authenticationHelper)
        {
            _apiContext = apiContext;
            _authenticationHelper = authenticationHelper;
            this.IsEditMode = _apiContext.IsEditMode;
        }
        public bool IsSecure { get; set; }
        public string PageType { get; set; }
        public string PageTypeId { get; set; }

        public CmsPageContext CmsContext {get;set;}

        public string Title { get; set; }

      
        public string MetaDescription { get; set; }

        public string MetaTitle { get; set; }

        [JsonConverter(typeof(StringEnumConverter))]
        public EditModes? EditMode { get; set; }


        

        private UserProfile _userProfile;
        private UX.Models.Customers.User _user;

        public UX.Models.Customers.User User
        {
            get
            {
                _user = _user ?? new UX.Models.Customers.User
                {
                    Email = UserProfile.EmailAddress, //profile != null ? profile.EmailAddress : null,
                    FirstName = UserProfile.FirstName, // profile != null ? profile.FirstName : null,
                    LastName = UserProfile.LastName, // profile != null ? profile.LastName : null,
                    UserId = _apiContext.UserClaims.UserId, // gcu.UserId,
                    IsAuthenticated = !_apiContext.UserClaims.IsAnonymous && _apiContext.UserClaims.IsAuthenticated, //!gcu.IsAnonymous && gcu.IsAuthenticated,
                    IsAnonymous = _apiContext.UserClaims.IsAnonymous
                };

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
    }
}

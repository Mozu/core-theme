using Mozu.Core;
using Mozu.Core.Extensions;
using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Headers;
using System.Collections;
using Mozu.SiteBuilder.Mvc.Contexts;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.Mvc
{
    public interface ICustomerSegmentPricingService{
        List<string> GetCustomerSegments();
        Task<bool> AllowCustomerSegmentPricing();
        Task<string> GetAllowedCustomerSegmentsAsString(string overrideCustomerSegments = null);
    }
    public class CustomerSegmentPricingService:ICustomerSegmentPricingService
    {
        const string ThemeSettingKey = "customerSegmentSpecificPricing";
        private readonly IApiContext _apiContext;
        private readonly ISiteContext _siteContext;
        private readonly IPageContext _pageContext;

        public CustomerSegmentPricingService(
            ISiteContext siteContext, 
            IPageContext pageContext,
            IApiContext apiContext
            ){
            _siteContext = siteContext;
            _apiContext = apiContext;
            _pageContext = pageContext;
        }
        public List<String> GetCustomerSegments (){
            return _pageContext?.User?.Segments ;
        }

        public async Task<bool> AllowCustomerSegmentPricing()
        {
            try
            {
                await _siteContext.Init();
                var themeSetting = _siteContext.ThemeSettings;
                if ( themeSetting != null)
                {
                    return  themeSetting.Get<bool?>(ThemeSettingKey) == true;
                }
                return false;
            }
            catch
            {
                return false;
            }
        }
        public async Task<string> GetAllowedCustomerSegmentsAsString(string overrideCustomerSegments = null)
        {
            if (! string.IsNullOrEmpty( overrideCustomerSegments ) )
            {
                return overrideCustomerSegments;
            }
            if ( await this.AllowCustomerSegmentPricing())
            {
                var cs = this.GetCustomerSegments();
                if ( cs?.Count > 0 )
                {
                    cs.Sort();
                    return string.Join(",", cs);
                }
            }
            return null;
        }
    }
}
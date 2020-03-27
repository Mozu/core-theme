using Mozu.Core;
using Mozu.Core.Extensions;
using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Headers;

namespace Mozu.SiteBuilder.Mvc
{
    /// <summary>
    /// Handles determining the dataviewmode of a particular request.
    /// 
    /// right now this is determined via the edit mode of the apicontext, a request header, or a site cookie.
    /// </summary>
    public interface IDataViewModeFinderOuter
    {
        DataViewModeType GetDataViewMode(LightweightUserClaims userclaims);
    }
    public class DataViewModeFinderOuter : IDataViewModeFinderOuter
    {
        private ICookieProvider _cookies;
        private IEditModeFinderOuter _editmodeGetter;
        private HttpContext _httpContext;

        public DataViewModeFinderOuter(IEditModeFinderOuter editModeGetter, HttpContext httpContext, ICookieProvider cookies)
        {
            _editmodeGetter = editModeGetter;
            _httpContext = httpContext;
            _cookies = cookies;
        }

        public DataViewModeType GetDataViewMode(LightweightUserClaims userclaims)
        {
            return GetDataViewMode(_editmodeGetter, _httpContext.Request.Headers, _cookies, userclaims);
        }

        private static DataViewModeType GetDataViewMode(IEditModeFinderOuter editModeGetter, IHeaderDictionary headers, ICookieProvider cookies, LightweightUserClaims userclaims)
        {
            var isEditMode = editModeGetter.IsEditMode() ? DataViewModeType.Pending : DataViewModeType.NoneSet;
            var headerMode = GetModeFromHeaders(headers);
            var cookieMode = GetModeFromCookie(cookies);
            var scopeMode = GetModeFromUserScope(userclaims);

            var modeToReturn = new[] { isEditMode, headerMode, cookieMode, scopeMode, DataViewModeType.Live }.Aggregate(DataViewModeType.NoneSet, (prev, next) => prev != DataViewModeType.NoneSet ? prev : next);
            return modeToReturn;
        }

        static int previewBehaviorId = new Core.Behaviors.PublishPreviewBehavior().Id;
        private static DataViewModeType GetModeFromUserScope(LightweightUserClaims userclaims)
        {
            return userclaims != null && userclaims.ScopeType.EqualsIgnoreCase(UserScopeType.Tenant.ToStringQuickly()) && userclaims.BehaviorIds != null && userclaims.BehaviorIds.Contains(previewBehaviorId) 
                    ? DataViewModeType.Pending 
                    : DataViewModeType.NoneSet; 
        }

        private static DataViewModeType GetModeFromCookie(ICookieProvider cookies)
        {
            var cookie = cookies.GetRequestCookie(Constants.COOKIENAME);
            if (cookie == null || cookie["dataview"].IsNullOrEmpty()) return DataViewModeType.NoneSet;
            return cookie["dataview"].ToEnum<DataViewModeType>();
        }

        private static DataViewModeType GetModeFromHeaders(IHeaderDictionary headers)
        {
            return !headers.Keys.Contains(Core.Api.Contracts.Constants.Headers.DATA_VIEW_MODE) ? DataViewModeType.NoneSet : 
                headers[Core.Api.Contracts.Constants.Headers.DATA_VIEW_MODE].First().ToEnum<DataViewModeType>();
        }
    }
}

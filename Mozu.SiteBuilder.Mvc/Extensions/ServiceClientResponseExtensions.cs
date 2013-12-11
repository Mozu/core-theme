using System;
using System.Linq;
using Mozu.Core.Api.Contracts.Client;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class ServiceClientResponseExtensions
    {
        public static string ETag<T>(this ServiceClientResponse<T> scr)
        {
            if (scr.ResponseMessage != null && scr.ResponseMessage.Headers != null && scr.ResponseMessage.Headers.ETag != null)
                return scr.ResponseMessage.Headers.ETag.Tag;
            else
                return null;
        }
    }
}

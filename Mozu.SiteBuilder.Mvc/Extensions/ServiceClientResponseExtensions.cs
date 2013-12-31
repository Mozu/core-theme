using System;
using System.Linq;
using System.Security.Cryptography;
using Mozu.Core.Api.Contracts.Client;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class ServiceClientResponseExtensions
    {
        public static string ETag<T>(this ServiceClientResponse<T> scr)
        {
            if (scr.ResponseMessage != null && scr.ResponseMessage.Headers != null && scr.ResponseMessage.Headers.ETag != null && scr.ResponseMessage.Headers.ETag.Tag != null)
                return scr.ResponseMessage.Headers.ETag.Tag.Replace("\"", "");
            else
                return null;
        }
        public static byte[] ETagBytes<T>(this ServiceClientResponse<T> scr)
        {
            var etag = scr.ETag();
            Guid g;
            if (Guid.TryParse(etag, out g))
            {
                return g.ToByteArray();
            }
           
            return System.Text.Encoding.UTF8.GetBytes(etag??string.Empty);
        }

        public static ServiceClientResponse<T> HashEtag<T>(this ServiceClientResponse<T> scr, HashAlgorithm haherAlgorithm, bool finalize = false)
        {
            var etag = scr.ETagBytes();
            haherAlgorithm.TransformBlock(etag, 0, etag.Length, etag, 0);
            return scr;
        }
    }
}

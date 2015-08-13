using System;
using System.Linq;
using System.Security.Cryptography;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Mozu.Core.Exceptions;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class ServiceClientResponseExtensions
    {

        public static T GetResultOrDefault<T>(this Task<ServiceClientResponse<T>> task, T defaultT = default(T))
        {
            if ( task.IsSuccess())
            {
                return task.Result.ReadAsSync();
            }
            return defaultT;
        }

        public static T GetResultOrDefault<T>(this Task<ServiceClientResponse<T>> task, Func<T> defaultFn)
        {
            if (task.IsSuccess())
            {
                return task.Result.ReadAsSync();
            }
            return defaultFn();
        }

        public static bool IsSuccess<T> ( this Task<T> task ) where T : ServiceClientResponse
        {
            if (!task.IsCompleted || task.IsFaulted)
            {
                return false;
            }
            try
            {
                var res = task.Result;
                if (res.HasException)
                {
                    return false;
                }
                return (int)res.ResponseMessage.StatusCode < 400;
                
            }
            catch
            {
                return false;
            }
            
        }
        public static Exception GetException<T>(this Task<T> task) where T : ServiceClientResponse
        {
            if (task.Exception != null)
            {
                return task.Exception;
            }

            try
            {
                var res = task.Result;
                if (res.HasException)
                {
                    return res.ReadException();
                }
                
            }
            catch (Exception ex)
            {
                return ex;
            }
            return null;
        }

        public static string ETag<T>(this T scr) where T : ServiceClientResponse
        {
            if (scr.ResponseMessage != null && scr.ResponseMessage.Headers != null && scr.ResponseMessage.Headers.ETag != null && scr.ResponseMessage.Headers.ETag.Tag != null)
                return scr.ResponseMessage.Headers.ETag.Tag.Replace("\"", "");
            else
                return null;
        }
        public static byte[] ETagBytes<T>(this T scr) where T : ServiceClientResponse
        {
            var etag = scr.ETag();
            Guid g;
            if (Guid.TryParse(etag, out g))
            {
                return g.ToByteArray();
            }
           
            return System.Text.Encoding.UTF8.GetBytes(etag??string.Empty);
        }

        public static HashAlgorithm HashAuditInfo(this HashAlgorithm hashAlgorithm , AuditInfo info )
        {
            if (info != null)
            {
                var date = info.UpdateDate.HasValue ? info.UpdateDate.Value : info.CreateDate.GetValueOrDefault(DateTime.MaxValue);
                var block = BitConverter.GetBytes(date.Ticks);
                hashAlgorithm.TransformBlock(block, 0, block.Length, block, 0);
            }
            return hashAlgorithm;
        }

       
        public static T HashEtag<T>(this T scr, HashAlgorithm hashAlgorithm, bool finalize = false) where T : ServiceClientResponse
        {
            var etag = scr.ETagBytes();
            hashAlgorithm.TransformBlock(etag, 0, etag.Length, etag, 0);
            return scr;
        }

        public static void ThrowExceptionsIfAny<T>(this IEnumerable<T> serviceClientResponses) where T : ServiceClientResponse
        {
            var taskExceptions = serviceClientResponses.Where(result => result.HasException);
            var exCount = taskExceptions.Count();
            if (exCount == 0)
                return;
            if (exCount == 1)
                throw taskExceptions.First().ReadException();
            taskExceptions.ThrowAccumulatedException();
        }

        private static void ThrowAccumulatedException<T>(this IEnumerable<T> taskExceptions) where T : ServiceClientResponse
        {
            var sb = new StringBuilder();
            foreach (var ex in taskExceptions.Select(x => x.ReadException()).Where(x => x != null))
            {
                sb.AppendFormat("{0};", ex.Message, Mozu.Core.Constants.StringSplits.Semicolon);
            }
            throw new VaeUnexpectedErrorException(sb.ToString(0, sb.Length - 2));
        }
    }
}

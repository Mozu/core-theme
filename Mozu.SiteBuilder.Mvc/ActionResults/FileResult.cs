using System;
using System.Net.Http;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public abstract class FileResult : IActionResult 
    {
        // Fields
        private string _fileDownloadName;

        // Methods
        protected FileResult(string contentType)
        {
            if (string.IsNullOrEmpty(contentType))
            {
                throw new ArgumentException("MvcResources.Common_NullOrEmpty, contentType");
            }
            ContentType = contentType;
        }
        public string Range { get; set; }
        // Properties
        public string ContentType { get; private set; }

        public string FileDownloadName
        {
            get => (_fileDownloadName ?? string.Empty);
            set => _fileDownloadName = value;
        }

        public string Etag { get; set; }
        public DateTimeOffset? LastModifiedDate { get; set; }

        public Task ExecuteResultAsync(ActionContext context)
        {
            var response = context.HttpContext.Response;
            WriteHeaders(response);
            return WriteFileAsync(response);
        }

        private void WriteHeaders(HttpResponse response)
        {
            response.ContentType = ContentType;

            if (!string.IsNullOrEmpty(Etag))
            {
                response.Headers.Add("ETag", Etag);
            }
            if (LastModifiedDate.HasValue)
            {
                response.Headers.Add("Last-Modified", LastModifiedDate.Value.ToUniversalTime().ToString("r"));
            }
            if (!string.IsNullOrEmpty(FileDownloadName))
            {
                var headerValue = ContentDispositionUtil.GetHeaderValue(FileDownloadName);
                response.Headers.Add("Content-Disposition", headerValue);
            }

            if (string.IsNullOrEmpty(Range)) return;

            response.Headers.Add("Content-Range", Range);
            response.StatusCode = 206;
        }

        protected abstract void WriteFile(HttpResponse response);

        protected abstract Task WriteFileAsync(HttpResponse response);
        // Nested Types
        internal static class ContentDispositionUtil
        {
            // Fields
            private const string HexDigits = "0123456789ABCDEF";

            // Methods
            private static void AddByteToStringBuilder(byte b, StringBuilder builder)
            {
                builder.Append('%');
                int num = b;
                AddHexDigitToStringBuilder(num >> 4, builder);
                AddHexDigitToStringBuilder(num % 0x10, builder);
            }

            private static void AddHexDigitToStringBuilder(int digit, StringBuilder builder)
            {
                builder.Append("0123456789ABCDEF"[digit]);
            }

            private static string CreateRfc2231HeaderValue(string filename)
            {
                var builder = new StringBuilder("attachment; filename*=UTF-8''");
                foreach (byte num in Encoding.UTF8.GetBytes(filename))
                {
                    if (IsByteValidHeaderValueCharacter(num))
                    {
                        builder.Append((char)num);
                    }
                    else
                    {
                        AddByteToStringBuilder(num, builder);
                    }
                }
                return builder.ToString();
            }

            public static string GetHeaderValue(string fileName)
            {
                foreach (char ch in fileName)
                {
                    if (ch > '\x007f')
                    {
                        return CreateRfc2231HeaderValue(fileName);
                    }
                }
                var disposition = new ContentDisposition
                                      {
                                          FileName = fileName
                                      };
                return disposition.ToString();
            }

            private static bool IsByteValidHeaderValueCharacter(byte b)
            {
                if ((0x30 <= b) && (b <= 0x39))
                {
                    return true;
                }
                if ((0x61 <= b) && (b <= 0x7a))
                {
                    return true;
                }
                if ((0x41 <= b) && (b <= 90))
                {
                    return true;
                }
                switch (b)
                {
                    case 0x3a:
                    case 0x5f:
                    case 0x7e:
                    case 0x24:
                    case 0x26:
                    case 0x21:
                    case 0x2b:
                    case 0x2d:
                    case 0x2e:
                        return true;
                }
                return false;
            }
        }
    }
}
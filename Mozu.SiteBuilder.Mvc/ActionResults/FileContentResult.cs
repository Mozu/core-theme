using System;
using System.Web;
using Microsoft.AspNetCore.Http;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public class FileContentResult : FileResult
    {
        // Methods
        public FileContentResult(byte[] fileContents, string contentType)
            : base(contentType)
        {
            FileContents = fileContents ?? throw new ArgumentNullException(nameof(fileContents));
        }

        // Properties
        public byte[] FileContents { get; private set; }

        protected override void WriteFile(HttpResponse response)
        {
            response.Body.Write(FileContents, 0, FileContents.Length);
        }

        protected override System.Threading.Tasks.Task WriteFileAsync(HttpResponse response)
        {
            return response.Body.WriteAsync(FileContents, 0, FileContents.Length);
        }
    }
}
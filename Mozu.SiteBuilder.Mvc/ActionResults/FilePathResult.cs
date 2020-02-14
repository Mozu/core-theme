using System;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Http;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public class FilePathResult : FileResult
    {
        // Methods
        public FilePathResult(string fileName, string contentType)
            : base(contentType)
        {
            if (string.IsNullOrEmpty(fileName))
            {
                throw new ArgumentException("MvcResources.Common_NullOrEmpty, fileName");
            }
            this.FileName = fileName;
        }

        protected override void WriteFile(HttpResponse response)
        {
            response.TransmitFile(this.FileName);
        }

        // Properties
        public string FileName { get; private set; }

        protected override System.Threading.Tasks.Task WriteFileAsync(HttpResponse response)
        {
            TaskCompletionSource<bool> tcs = new TaskCompletionSource<bool>();
            tcs.SetResult(true);
            response.TransmitFile( this.FileName);
            return tcs.Task;
        }
    }
}
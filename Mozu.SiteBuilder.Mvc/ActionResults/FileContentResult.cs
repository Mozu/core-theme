using System;
using System.Web;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public class FileContentResult : FileResult
    {
        // Methods
        public FileContentResult(byte[] fileContents, string contentType)
            : base(contentType)
        {
            if (fileContents == null)
            {
                throw new ArgumentNullException("fileContents");
            }
            FileContents = fileContents;
        }

        // Properties
        public byte[] FileContents { get; private set; }

        protected override void WriteFile(HttpResponseBase response)
        {
            response.OutputStream.Write(FileContents, 0, FileContents.Length);
        }

        protected override System.Threading.Tasks.Task WriteFileAsync(HttpResponseBase response)
        {
            return response.OutputStream.WriteAsync( FileContents, 0, FileContents.Length);
        }
    }
}
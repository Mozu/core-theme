using System;
using System.IO;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.FileProviders.Physical;

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
            FileName = fileName;
        }

        protected override void WriteFile(HttpResponse response)
        {
            response.SendFileAsync(new PhysicalFileInfo(new FileInfo(FileName)));
        }

        // Properties
        public string FileName { get; private set; }

        protected override Task WriteFileAsync(HttpResponse response)
        {
            return response.SendFileAsync(new PhysicalFileInfo(new FileInfo(Fixuup(FileName))));
        }
        static string Fixuup(string path)
        {
            if ( path[0] == '~')
            {
                return Path.Join(System.Environment.CurrentDirectory, path.Substring(1));
            }
            return path;
        }

    }
}
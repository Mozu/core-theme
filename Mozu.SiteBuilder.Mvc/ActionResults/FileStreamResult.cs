using System;
using System.IO;
using System.Threading.Tasks;
using System.Web;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public class FileStreamResult : FileResult
    {
        // Fields
        private const int BufferSize = 0x1000;

        // Methods
        public FileStreamResult(Stream fileStream, string contentType)
            : base(contentType)
        {
            if (fileStream == null)
            {
                throw new ArgumentNullException("fileStream");
            }
            FileStream = fileStream;
        }

     

        // Properties
        public Stream FileStream { get; private set; }

        protected override void WriteFile(HttpResponseBase response)
        {
           
            
            Stream outputStream = response.OutputStream;
            using (FileStream)
            {
                var buffer = new byte[0x1000];
                while (true)
                {
                    int count = FileStream.Read(buffer, 0, 0x1000);
                    if (count == 0)
                    {
                        return;
                    }
                    outputStream.Write(buffer, 0, count);
                }
            }
        }

        

        protected async override Task WriteFileAsync(HttpResponseBase response)
        {
            Stream outputStream = response.OutputStream;
            using (FileStream)
            {
                var buffer = new byte[0x1000];
                while (true)
                {
                    int count = await FileStream.ReadAsync( buffer, 0, 0x1000).ConfigureAwait(false);
                    if (count == 0)
                    {
                        return;
                    }
                    outputStream.Write( buffer, 0, count);
                }
            }
        }
    }
}
using System;
using System.IO;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Http;

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
            FileStream = fileStream ?? throw new ArgumentNullException(nameof(fileStream));
        }

        // Properties
        public Stream FileStream { get; private set; }

        protected override void WriteFile(HttpResponse response)
        {   
            var outputStream = response.Body;
            using (FileStream)
            {
                var buffer = new byte[0x1000];
                while (true)
                {
                    var count = FileStream.Read(buffer, 0, BufferSize);
                    if (count == 0)
                    {
                        return;
                    }
                    outputStream.Write(buffer, 0, count);
                }
            }
        }

        protected override async Task WriteFileAsync(HttpResponse response)
        {
            var outputStream = response.Body;
            await using (FileStream)
            {
                var buffer = new byte[0x1000];
                while (true)
                {
                    var count = await FileStream.ReadAsync( buffer, 0, BufferSize).ConfigureAwait(false);
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
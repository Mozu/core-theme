using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using Burrows.Exceptions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.TestData
{
    public class TestDataBroker
    {
        private static string[] _names;
        public static TestDataBroker Default = new TestDataBroker();
        static TestDataBroker()
        {
            _names = typeof(TestDataBroker).Assembly.GetManifestResourceNames();

            //_names.GroupBy(x=> x.LastIndexOf())
        }
        public Stream GetFileContent(string path)
        {
            var name = _names.FirstOrDefault(x => x.EndsWith(path, StringComparison.OrdinalIgnoreCase));
            if (name == null)
            {
                throw new Exception("cant find resource for path "+ path );
            }
            return typeof (TestDataBroker).Assembly.GetManifestResourceStream(name);
        }

        public T GetFileContent<T>(string path)
        {
            var stream = GetFileContent(path);
            var ser = new JsonSerializer();
            return ser.Deserialize<T>(new JsonTextReader(new StreamReader(stream)));
        }

        public IEnumerable<T> GetFileContents<T>(string path)
        {
            return _names.Where(x => x.IndexOf(path, StringComparison.OrdinalIgnoreCase) > -1).Select(x => GetFileContent<T>(x)).ToList();
            
        }

        public IEnumerable<Object> GetFileContents(string path)
        {
            return _names.Where(x => x.IndexOf(path, StringComparison.OrdinalIgnoreCase) > -1).Select(x => GetFileObjectContent(x)).ToList();

        }

        public Object GetFileObjectContent(string path)
        {
            var stream = GetFileContent(path);
            var ser = new JsonSerializer();
            return ser.Deserialize(new JsonTextReader(new StreamReader(stream)));
        }
    }
}
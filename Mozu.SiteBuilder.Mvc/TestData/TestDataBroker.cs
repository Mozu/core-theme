using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.Mvc.TestData
{
    public class TestDataBroker
    {
        private static readonly string[] Names;
        static TestDataBroker()
        {
            Names = typeof(TestDataBroker).Assembly.GetManifestResourceNames();

            //_names.GroupBy(x=> x.LastIndexOf())
        }
        public static Stream GetFileContent(string path)
        {
            var name = Names.FirstOrDefault(x => x.EndsWith(path, StringComparison.OrdinalIgnoreCase));
            if (name == null)
            {
                throw new Exception("cant find resource for path "+ path );
            }
            return typeof (TestDataBroker).Assembly.GetManifestResourceStream(name);
        }

        public static T GetFileContent<T>(string path)
        {
            var stream = GetFileContent(path);
            var ser = new JsonSerializer();
            return ser.Deserialize<T>(new JsonTextReader(new StreamReader(stream)));
        }

        public static IEnumerable<T> GetFileContents<T>(string path)
        {
            return Names.Where(x => x.IndexOf(path, StringComparison.OrdinalIgnoreCase) > -1).Select(GetFileContent<T>).ToList();
            
        }

        public static IEnumerable<Object> GetFileContents(string path)
        {
            return Names.Where(x => x.IndexOf(path, StringComparison.OrdinalIgnoreCase) > -1).Select(GetFileObjectContent).ToList();

        }

        public static Object GetFileObjectContent(string path)
        {
            var stream = GetFileContent(path);
            var ser = new JsonSerializer();
            return ser.Deserialize(new JsonTextReader(new StreamReader(stream)));
        }
    }
}
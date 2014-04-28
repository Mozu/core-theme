using System;
using System.Collections;
using System.IO;
using System.Net.Http;
using Autofac;

using Mozu.SiteBuilder.Mvc.Extensions;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    internal class TemplateLoader : ITemplateLoader
    {
   

        //public TextReader GetTemplate(string path)
        //{
           
        //}
         
        public bool IsUpdated(string path, DateTime timestamp)
        {
            
            return File.GetLastWriteTime(path) != timestamp;
        }

        Tuple<TextReader, DateTime> ITemplateLoader.GetTemplate(string path)
        {
            var file = new System.IO.FileInfo(path);
            return new Tuple<TextReader, DateTime>(file.OpenText(), file.LastWriteTime);
        }
    }
}
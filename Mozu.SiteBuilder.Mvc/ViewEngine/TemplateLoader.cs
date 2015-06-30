using System;
using System.Collections;
using System.IO;
using System.Net.Http;
using Autofac;

using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Themes;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    internal class TemplateLoader : ITemplateLoader
    {
        private readonly Lazy<IThemeRepository> _themeRepo;


        public TemplateLoader(Lazy<IThemeRepository> themeRepo)
        {
            _themeRepo = themeRepo;
        }

        //public TextReader GetTemplate(string path)
        //{
           
        //}
         
        public bool IsUpdated(string path, DateTime timestamp)
        {
            bool isUpdated= _themeRepo.Value.GetLastWriteTime(path).ToUniversalTime() != timestamp.ToUniversalTime();
            return isUpdated;

        }

        Tuple<TextReader, DateTime> ITemplateLoader.GetTemplate(string path)
        {
            var file = new System.IO.FileInfo(path);
            return new Tuple<TextReader, DateTime>(file.OpenText(), file.LastWriteTime);
        }
    }
}
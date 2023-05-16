using System;
using System.Collections;
using System.IO;
using System.Net.Http;

using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Themes;
using NDjango.Interfaces;
using Mozu.Core.Settings;
using Mozu.Core.Mongo;
using MongoDB.Driver.GridFS;
using MongoDB.Driver;
using System.Threading;
using System.Text.RegularExpressions;
using System.Text;

namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    internal class TemplateLoader : ITemplateLoader
    {
        private readonly Lazy<IThemeRepository> _themeRepo;

        private readonly Lazy<ISettings> _settings;
        Lazy<IThemeContentRetriever> _contentRetriever;

        public TemplateLoader(Lazy<IThemeRepository> themeRepo, Lazy<ISettings> settings,
            Lazy<IThemeContentRetriever> contentRetriever)
        {
            _themeRepo = themeRepo;
            _settings = settings;
            _contentRetriever = contentRetriever;
        }

        //public TextReader GetTemplate(string path)
        //{
           
        //}
         
        public bool IsUpdated(string path, DateTime timestamp)
        {
            

            var themeInfo = ThemeFileSystemInfoHelper.ToInfo(path);

            var timestamp2 = _themeRepo.Value.GetLastWriteTime(themeInfo.ThemeId, themeInfo.VirtualPath);
            return timestamp2.ToUniversalTime() > timestamp.ToUniversalTime();


        }
        
        Tuple<TextReader, DateTime> ITemplateLoader.GetTemplate(string path)
        {
            var themeInfo = ThemeFileSystemInfoHelper.ToInfo(path);
            var text = TryAddCbToRequireScript(path, _contentRetriever.Value.GetContent(themeInfo, CancellationToken.None));
            
            var timestamp = _themeRepo.Value.GetLastWriteTime(themeInfo.ThemeId, themeInfo.VirtualPath);
            return new Tuple<TextReader, DateTime>(new StringReader(text), timestamp);

        }
        static Regex RequireRegex = new Regex(@"<script.*require.*(?<dotjs>\.js\"")");




        //adds ver on require script for cache busting with CDN's
        static string TryAddCbToRequireScript( string path, string content)
        {
            if (path.IndexOf("trailing-scripts.hypr", StringComparison.OrdinalIgnoreCase) ==-1)
            {
                return content;
            }
            var match = RequireRegex.Match(content);
            if(match.Success)
            {
                var g = match.Groups["dotjs"];
                return new StringBuilder(content.Substring(0, g.Index)).Append(".js?ver=1.4").Append(content.Substring(g.Index + 3)).ToString();
            }
            return content;


        }

       


    }
}
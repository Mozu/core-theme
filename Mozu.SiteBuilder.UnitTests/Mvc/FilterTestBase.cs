using System;
using System.Collections.Generic;
using System.IO;
using System.Web;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Hypr.Tags;
using NDjango;
using NDjango.FiltersCS;
using NDjango.Interfaces;
using NDjango.Misc;
using NUnit.Framework;


namespace Mozu.SiteBuilder.UnitTests.Mvc
{
    public class TemplateTestBase
    {
        private class TestTemplateLoader : ITemplateLoader{
            private readonly Dictionary<string, string> _templates;

            public TestTemplateLoader ( Dictionary<string,string> templates)
            {
                _templates = templates;
            }

            public Tuple<TextReader, DateTime> GetTemplate(string path)
            {
                string templateString;
                if (!_templates.TryGetValue( path, out templateString))
                {
                    templateString = path;
                }
                return new Tuple<TextReader, DateTime>(new StringReader(templateString), DateTime.UtcNow);
            }

            public bool IsUpdated(string path, DateTime timestamp)
            {
                return false;
            }
        }

        public Dictionary<string, string> Templates = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        
      
        private ITemplateManager Manager
        {
            get;set;
        }
        void InitManager(){
            Manager = new TemplateManagerProvider()
                    .WithLibrary(typeof (AddFilter).Assembly)
                    .WithLibrary(typeof (HyprViewEngine).Assembly)
                    .WithLibrary(typeof (DropZoneTag).Assembly)
                    .WithLoader(new TestTemplateLoader(Templates))
                    .WithSetting("settings.DEFAULT_AUTOESCAPE", true).GetNewManager();
        }
           

        public class TestDescriptor
        {
            public string Name { get; set; }
            public string Template { get; set; }
            public Dictionary<string, object> Context { get; set; }
            public object Expected { get; set; }
            public override string ToString()
            {
                return Name;
            }
            public TestDescriptor()
            {
                Context = new Dictionary<string, object>();
            }

            public Dictionary<string, string> Templates { get; set; }
        }

        public   void RunTemplate(TestDescriptor desc, ITemplateManager manager)
        {
            NDjango.Utilities.UtilConfig.Comparer = new NDjango.FiltersCS.DjangoComparer();
            
            var context = SetupContext(desc);
            InitTempaltes(desc);
            var template = manager.GetTemplate(desc.Template);
            var renderer = new TemplateRenderer(manager, template, context);
            var rendered = RenderTemplate(renderer);
            Assert.AreEqual(desc.Expected, rendered, string.Format("expected was different that actual. expected: {0}. Actual: {1}", desc.Expected, rendered));
        }

        protected void RunTemplate(TestDescriptor desc)
        {
            InitManager();
            RunTemplate(desc, Manager);
        }
        private void InitTempaltes ( TestDescriptor desc)
        {
            Templates.Clear();
            if (desc.Templates != null)
            {
                foreach ( var kvp in desc.Templates)
                {
                    Templates[kvp.Key] = kvp.Value;
                }
            }
        }
        private static string RenderTemplate(TemplateRenderer renderer)
        {
            var writer = new StringWriter();
            renderer.Render(writer);
            writer.Flush();
            return writer.ToString();
        }

        private static Dictionary<string, object> SetupContext(TestDescriptor desc)
        {
            var dict = desc.Context == null ? new Dictionary<string, object>() : desc.Context;
            
            //add viewContextNode
            var hyprviewcontext = new HyprViewContext(null, null, null);
            dict.Add("_vc", hyprviewcontext);
            hyprviewcontext.HttpContext = new HttpContextWrapper(new HttpContext(new HttpRequest("Default", "http://mozilla.com", ""), new HttpResponse(new StreamWriter(new MemoryStream()))));
            return dict;
        }
    }
}

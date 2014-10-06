using System;
using System.Collections.Generic;
using System.IO;
using Mozu.SiteBuilder.Mvc.Configuration;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using NDjango;
using NDjango.FiltersCS;
using NDjango.Interfaces;
using NDjango.Misc;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.Mvc.Filters
{
    public class FilterTestBase
    {
        private class TestTemplateLoader : ITemplateLoader{
            public Tuple<TextReader, DateTime> GetTemplate(string path)
            {
                return new Tuple<TextReader, DateTime>(new StringReader(path), DateTime.UtcNow);
            }

            public bool IsUpdated(string path, DateTime timestamp)
            {
                return false;
            }
        }
        
        private ITemplateManager _manager;



        protected ITemplateManager Manager
        {
            get
            {
                return (_manager ?? (_manager = new TemplateManagerProvider()
                    .WithLibrary(typeof (AddFilter).Assembly)
                    .WithLibrary(typeof (HyprViewEngine).Assembly)
                    .WithLibrary(typeof (AutofacModule).Assembly)
                    .WithLoader(new TestTemplateLoader())
                    .WithSetting("settings.DEFAULT_AUTOESCAPE", true).GetNewManager()));
            }
        }

        public class TestDescriptor
        {
            public string Name { get; set; }
            public string Template { get; set; }
            public object[] Context { get; set; }
            public object Expected { get; set; }
            public override string ToString()
            {
                return Name;
            }
        }

        public static void RunTemplate(TestDescriptor desc, ITemplateManager manager)
        {
            var context = SetupContext(desc);
            var template = manager.GetTemplate(desc.Template);
            var renderer = new TemplateRenderer(manager, template, context);
            var rendered = RenderTemplate(renderer);
            Assert.AreEqual(desc.Expected, rendered);
        }

        public void RunTemplate(TestDescriptor desc)
        {
            RunTemplate(desc, Manager);
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
            var dict = new Dictionary<string, object>();
            if (desc.Context == null) return dict;

            for (int i = 0; i <= desc.Context.Length - 2; i += 2)
                dict.Add(desc.Context[i].ToString(), desc.Context[i + 1]);
            
            return dict;
        }
    }
}

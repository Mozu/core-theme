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
using System.Net.Http;
//using Autofac;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Mozu.Core.Test;

//using Autofac;
//using AutofacContrib.NSubstitute;

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
            NDjango.Utilities.UtilConfig.Comparer = new DjangoComparer();
            ResolverConfig.Resolver = new JsonCleaningCaseInsensitiveMemberResolver();
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
            public Func<string, Tuple<bool, string>> ExpectedFunc { get; set; }
            public Action<string, TestDescriptor> AssertFn { get; set; }
            public override string ToString()
            {
                return Name;
            }
            public TestDescriptor()
            {
                Context = new Dictionary<string, object>();
            }

            public Dictionary<string, string> Templates { get; set; }

            public  Action<IServiceCollection> ContainerModifier  { get; set; }

            public static Func<string, Tuple<bool, string>> ContainsLiteral(string expected)
            {
                
                return actual =>
                {
                    if (actual.Contains(expected))
                    {
                        return new Tuple<bool, string>(true, string.Empty);
                    }
                    else
                    {
                        return new Tuple<bool, string>(false, string.Format("actual didn't contain expected. expected: {0}. Actual: {1}", expected, actual));
                    }
                };
            }

            public static Func<string, Tuple<bool, string>> CompareLiteral(string expected)
            {
                return actual =>
                {
                    if (actual.Equals(expected))
                    {
                        return new Tuple<bool, string>(true, string.Empty);
                    }
                    else
                    {
                        return new Tuple<bool, string>(false, string.Format("expected was different that actual. expected: {0}. Actual: {1}", expected, actual));
                    }
                };
            }
        }

        public   void RunTemplate(TestDescriptor desc, ITemplateManager manager)
        {
            NDjango.Utilities.UtilConfig.Comparer = new NDjango.FiltersCS.DjangoComparer();
            
            var context = SetupContext(desc);
            InitTempaltes(desc);
            var template = manager.GetTemplate(desc.Template);
            var renderer = new TemplateRenderer(manager, template, context);
            var rendered = RenderTemplate(renderer);
            var expected = desc.ExpectedFunc(rendered);
            if ( desc.AssertFn != null)
            {
                desc.AssertFn(rendered, desc);
            }
            Assert.IsTrue(expected.Item1, expected.Item2);
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
            var dict = desc.Context ?? new Dictionary<string, object>();

            dict["true"] = true;
            dict["false"] = false;
            dict["now"] = DateTime.UtcNow;
            //add viewContextNode
            var hyprviewcontext = new HyprViewContext(null, null, null);
            var modifier = desc.ContainerModifier ?? (cb => { });
            var autoSub =  new AutoSubstitute(modifier);
            
            hyprviewcontext.LifetimeScope = autoSub.ServiceProvider;
            dict.Add("_vc", hyprviewcontext);
            
            hyprviewcontext.HttpContext = autoSub.Resolve<HttpContext>() ?? new DefaultHttpContext();
            return dict;
        }
    }
}

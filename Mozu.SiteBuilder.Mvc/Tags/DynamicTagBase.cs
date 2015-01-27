// -----------------------------------------------------------------------
// <copyright file="ComplexEmptyTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.Tags
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using NDjango.Interfaces;
    using System.Reflection;
    using NDjango.FiltersCS.Compatibility;


    //todo remove reflection... get cache of name params 
    public abstract class DynamicTagBase : SimpleTagBase
    {
        
        protected override ArgumentCollection.ParseStrategy ArgumentParserStrategy
        {
            get
            {
                return ArgumentCollection.Strategies.MultiMapsWithOutPut;
            }
        }

        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunc)
        {
            Arguments = arguments;
            Context = context;

            var parmamSets = GetType().GetMethods().Where(x => x.Name == "Process").Select(x => x.GetParameters()).Where(x => x.Length == arguments.Count);

            var pVals = new List<object>();
            foreach (var parms in parmamSets)
            {
                if (IsParamMatch(arguments, pVals, parms))
                {
                    var buffer = Invoke(arguments, ref context, pVals);
                    return WalkResultHelpers.Buffer(buffer).ToFSharpList();
                }
                pVals.Clear();
            }

            throw new RenderingError("failed to find matching Process method for", new Microsoft.FSharp.Core.FSharpOption<Exception>(null));
        }       

        private string Invoke( ArgumentCollection arguemnts, ref IContext context, List<object> pVals)
        {
            var t = GetType();
            var tag = (DynamicTagBase)Activator.CreateInstance(t);
            tag.Context = context;
   
            tag.Arguments = arguemnts;
            object ret;
            try
            {
                //todo : speed up relection by adding a  deleget getter to the types
                ret = t.InvokeMember("Process", BindingFlags.InvokeMethod, null, tag, pVals.ToArray());
            }
            catch (TargetInvocationException tex)
            {
                var ex = tex.InnerException;
                var tagName = t.GetCustomAttributes(typeof(NameAttribute), false).OfType<NameAttribute>().Select(x => x.Name).FirstOrDefault();
                var args = string.Join(" ", arguemnts.Select(x => x.TokenValue).ToArray());
                string msg = string.Format("error running tag {0} {1}", tagName, args);
                throw new InvalidOperationException(msg, ex);
            }
            catch (Exception ex)
            {
                var tagName = t.GetCustomAttributes(typeof(NameAttribute), false).OfType<NameAttribute>().Select(x => x.Name).FirstOrDefault();
                var args = string.Join(" ", arguemnts.Select(x => x.TokenValue).ToArray());
                string msg = string.Format("error running tag {0} {1}", tagName, args);
                throw new InvalidOperationException(msg, ex);
            }
            context = tag.Context;
            return ret == null ? string.Empty : ret.ToString();
        }

        private static bool IsParamMatch(ArgumentCollection arguemnts, List<object> pVals, ParameterInfo[] parms)
        {
            if (arguemnts.Count !=  parms.Length)
            {
                return false;
            }
            bool isMatch = true;
            for (int i = 0; i < parms.Length; i++)
            {
                TagArgument arg;
                if (arguemnts.TryGetArgument(parms[i].Name, out arg))
                {
                    pVals.Add(arg.Value);
                }
                else
                {
                    
                    arg = arguemnts[i];
                    if ( arg.ArgumentType == TagArgument.ArgumentTypes.ValueArgument && 
                        parms[i].ParameterType.IsInstanceOfType(arg.Value))
                    {
                        pVals.Add(arg.Value);
                    }
                    else
                    {
                        isMatch = false;
                        break;
                    }

                }
            }
            return isMatch;
        }

        

        public Object Html
        {
            get;
            set;
        }
        public ArgumentCollection Arguments
        {
            get;
            set;
        }

        public IContext Context
        {
            get;
            set;
        }
        
        
    }

}

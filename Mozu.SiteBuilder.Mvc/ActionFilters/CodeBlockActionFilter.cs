using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using Microsoft.ClearScript.V8;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.Core.CodeBlocks;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Microsoft.ClearScript;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, Inherited = true, AllowMultiple = true)]
    public class CodeBlockViewActionFilter : CodeBlockActionFilter
    {
        public override void OnBlockComplete(HttpActionContext actionContext, object blockContext, object result, ICodeBlock block)

        {
            IDictionary<string, object> dic = blockContext as IDictionary<string, object>;
            object responseMessage;
            if (dic.TryGetValue("ResponseMessage", out responseMessage) && responseMessage != null)
            {
                actionContext.Response = (HttpResponseMessage)responseMessage;
            }
        }

        public override bool OnBlockError(HttpActionContext actionContext, object blockContext, Exception error, ICodeBlock block)
        {
            return true;
        }

        public delegate T3 FuncWithNullableParamters<in T1, in T2, T3>(T1 arg1 = null, T2 arg2 = null)
            where T1 : class
            where T2 : class
            where T3 : class;
        public override object CreateBlockContext(HttpActionContext actionContext, object existing)
        {
            var context = (dynamic)existing;
            if (context == null)
            {
                context = (dynamic)new ExpandoObject();
                var res = (IDictionary<string, object>)new ExpandoObject();
                context.res = res;

                res["model"] = (object)null;
                context.ResponseMessage = (HttpResponseMessage)null;
                context.util = new ExpandoObject();
                res["redirect"] = new FuncWithNullableParamters<object, object, object>((arg1, arg2) =>
                {
                    if (arg1 is int)
                    {
                        context.ResponseMessage = actionContext.Request.CreateResponse((HttpStatusCode)(int)arg1);
                        context.ResponseMessage.Headers.Location = new Uri(arg2.ToString());
                    }
                    else
                    {
                        context.ResponseMessage = actionContext.Request.CreateResponse(HttpStatusCode.Redirect);
                        context.ResponseMessage.Headers.Location = new Uri(arg1.ToString());
                    }
                    return res;
                });
                res["render"] = new CodeBlockCallback<object, object, object>((arg1, arg2, arg3) =>
                {
                    if (actionContext.Response != null && actionContext.Response.Content is ObjectContent && ((ObjectContent)actionContext.Response.Content).Value is ViewResultBase)
                    {
                        var vrb = ((ObjectContent)actionContext.Response.Content).Value as ViewResultBase;
                        vrb.ViewName = arg1.ToString();

                    }
                });
                var req = (IDictionary<string, object>)new ExpandoObject();
                context.req = req;
                var httpContext = actionContext.Request.Resolve<HttpContextBase>();
                req["query"] = httpContext.Request.QueryString;
                req["cookies"] = httpContext.Request.Cookies;
                req["path"] = httpContext.Request.Path;

                context.util.appendModel = new System.Action<object, string, object>((mdl, prop, config) =>
                {
                    var dic = mdl as IDictionary<string, object>;
                    if (config == null || prop == null || dic == null)
                    {
                        return;
                    }

                    var ser = new JsonSerializer();
                    ser.Converters.Add(new ExpandoObjectConverter());

                    dic[prop] = Newtonsoft.Json.Linq.JContainer.FromObject(config).ToObject<ExpandoObject>(ser);



                });
            }
            if (actionContext.Response != null && actionContext.Response.Content is ObjectContent && ((ObjectContent)actionContext.Response.Content).Value is ViewResultBase)
            {
                ((dynamic)context).res.model = ((ViewResultBase)((ObjectContent)actionContext.Response.Content).Value).ViewData.Model;
            }

            return context;
        }

    }

    //[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, Inherited = true, AllowMultiple = true)]
    //public class CodeBlockActionFilter2 : FilterAttribute, IActionFilter
    //{
    //    public string SlotId { set { this.AfterSlotId = value; } get { return this.AfterSlotId; } }
    //    public string BeforeSlotId { get; set; }

    //    public string AfterSlotId { get; set; }




    //    class MySetMemberBinder : System.Dynamic.SetMemberBinder
    //    {
    //        public MySetMemberBinder(string name)
    //            : base(name, false)
    //        {

    //        }
    //        public override DynamicMetaObject FallbackSetMember(DynamicMetaObject target, DynamicMetaObject value, DynamicMetaObject errorSuggestion)
    //        {
    //            throw new NotImplementedException();
    //        }
    //    }

    //    public virtual void OnBlockComplete(System.Web.Http.Controllers.HttpActionContext actionContext, object blockContext, object result, IRuntimeCodeBlock block)
    //    {


    //    }

    //    //return true to thro on task.
    //    public virtual bool OnBlockError(System.Web.Http.Controllers.HttpActionContext actionContext, object blockContext, Exception error, IRuntimeCodeBlock block)
    //    {
    //        return true;
    //    }

    //    public async Task<HttpResponseMessage> ExecuteActionFilterAsync(System.Web.Http.Controllers.HttpActionContext actionContext, CancellationToken cancellationToken, Func<Task<HttpResponseMessage>> continuation)
    //    {
    //        var actoinName = actionContext.ActionDescriptor.ActionName;
    //        var cbProvider = actionContext.Request.Resolve<IRuntimeCodeBlockProvider>();
    //        var blocks = (await cbProvider.GetCodeBlocks(ContextLevelType.Site, BeforeSlotId ?? "before." + actoinName)).ToArray();

    //        var context = (dynamic)new ExpandoObject();
    //        context.res = new ExpandoObject();

    //        context.res.model = (object)null;
    //        context.ResponseMessage = (HttpResponseMessage) null;
    //        context.util= new ExpandoObject();
    //        context.util.appendModel = new System.Action<object, string, object>((mdl, prop, config) =>
    //        {
    //            var dic = mdl as IDictionary<string, object>;
    //            if (config == null || prop == null || dic == null)
    //            {
    //                return;
    //            }

    //            var ser = new JsonSerializer();
    //            ser.Converters.Add(new ExpandoObjectConverter());

    //            dic[prop] = Newtonsoft.Json.Linq.JContainer.FromObject(config).ToObject<ExpandoObject>(ser);



    //        });


    //        if (blocks != null && blocks.Length > 0)
    //        {
    //            await RunBlocks(actionContext, blocks, context);
    //        }

    //        actionContext.Response  = await continuation();

    //        blocks = (await cbProvider.GetCodeBlocks(ContextLevelType.Site, AfterSlotId ?? "after." + actoinName)).ToArray();

    //        if (blocks != null && blocks.Length > 0)
    //        {
    //            if (actionContext.Response != null && actionContext.Response.Content is ObjectContent && ((ObjectContent)actionContext.Response.Content).Value is ViewResultBase)
    //            {
    //                context.res.model = ((ViewResultBase) ((ObjectContent) actionContext.Response.Content).Value).ViewData.Model;
    //            }
    //            await RunBlocks(actionContext, blocks, context);
    //        }
    //        return actionContext.Response;
    //    }

    //    private  async Task RunBlocks(HttpActionContext actionContext, IRuntimeCodeBlock[] blocks, object context)
    //    {
    //        foreach (var block in blocks)
    //        {
    //            var taskSrc = new TaskCompletionSource<HttpResponseMessage>();


    //            var outerAction = new Func<IRuntimeCodeBlock, ActionWithNullableParamters<object, object>, Task<HttpResponseMessage>>((bl, cb) =>
    //            {


    //                Task<HttpResponseMessage> ret = bl.Execute<object>(context, cb).ContinueWith(res =>
    //                {
    //                    if (res.IsFaulted)
    //                    {
    //                        cb(res.Exception);
    //                    }
    //                    else if (!(res.Result is Microsoft.ClearScript.Undefined))
    //                    {
    //                        cb(null, res.Result);
    //                    }
    //                    return taskSrc.Task.Result;
    //                });
    //                return ret;
    //            });
    //            var callback = new ActionWithNullableParamters<object, object>((object error, object result) =>
    //            {
    //                Exception ex = null;
    //                if (error != null)
    //                {
    //                    //todo.. convert to real exception
    //                    ex = new Exception(error.ToString());
    //                    if (OnBlockError(actionContext,context, ex, block))
    //                    {
    //                        taskSrc.TrySetException(ex);
    //                    }
    //                    else
    //                    {
    //                        taskSrc.TrySetResult(actionContext.Response);
    //                    }
    //                    ;
    //                }
    //                else
    //                {
    //                    OnBlockComplete(actionContext, context, result, block);

    //                    taskSrc.TrySetResult(actionContext.Response);

    //                }
    //            });

    //            using ((IDisposable) block)
    //            {
    //                await outerAction(block, callback);
    //            }


    //        }

    //    }
    //}


}

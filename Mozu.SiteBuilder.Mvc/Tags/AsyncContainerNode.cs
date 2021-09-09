// -----------------------------------------------------------------------
// <copyright file="ComplexEmptyTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FSharpx.Collections;
using Microsoft.FSharp.Collections;
using Microsoft.FSharp.Control;
using Microsoft.FSharp.Core;
using Mozu.SiteBuilder.Mvc.ObjectPools;
using NDjango;
using NDjango.Interfaces;
using NDjango.Misc;
using NDjango.FiltersCS.Compatibility;
using System.Threading;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    public abstract class AsyncContainerNode : ITag
    {
        public virtual bool is_header_tag { get; set; }
        public FSharpList<INodeImpl> InnerNodes { get; private set; }

        public abstract string EndTag { get; }

        public Tuple<INodeImpl, IParsingContext, FSharpx.Collections.LazyList<Lexer.Token>>
          Perform(
          Lexer.BlockToken blockToken,
          IParsingContext parsingContext,
          FSharpx.Collections.LazyList<Lexer.Token> tokenList)
        {
            Tuple<FSharpList<INodeImpl>, FSharpx.Collections.LazyList<Lexer.Token>> parsedData = ((IParser)parsingContext.Provider).Parse(new FSharpOption<Lexer.BlockToken>(blockToken), tokenList, parsingContext.WithClosures(new FSharpList<string>(EndTag, FSharpList<string>.Empty)));
            InnerNodes = parsedData.Item1;

            var nodeImpl = new TagNodeImpl(parsingContext, blockToken, parsedData.Item1, this);
            var resp = new Tuple<INodeImpl, IParsingContext, FSharpx.Collections.LazyList<Lexer.Token>>(nodeImpl, parsingContext, parsedData.Item2);
            return resp;
        }

        public virtual string ProcessContent(string content)
        {
            return content;
        }
        public class TagNodeImpl : ParserNodes.TagNode, IHyprNode, INodeImplAsync
        {

            private readonly Lexer.BlockToken _blockToken;
            private readonly IParsingContext _parsingContext;
            private readonly FSharpList<INodeImpl> _childNodes;

            public TagNodeImpl(IParsingContext parsingContext, Lexer.BlockToken blockToken, ITag tag)
                : base(parsingContext, blockToken, tag)
            {
                _blockToken = blockToken;
                _parsingContext = parsingContext;
                _childNodes = FSharpList<INodeImpl>.Empty;
            }

            public TagNodeImpl(IParsingContext parsingContext, Lexer.BlockToken blockToken, FSharpList<INodeImpl> nodes, ITag tag)
                : base(parsingContext, blockToken, tag)
            {
                _parsingContext = parsingContext;
                _blockToken = blockToken;
                _childNodes = nodes;
            }



            public FSharpAsync<FSharpList<WalkResult>> asyncWalk(ITemplateManager manager, Walker walker)
            {
                return FSharpAsync.AwaitTask(AsyncWalkInternal(manager, walker));
            }

            public async Task<FSharpList<WalkResult>> AsyncWalkInternal(ITemplateManager manager, Walker walker)
            {
                var innerWalker = new Walker(null, _childNodes, string.Empty, 0, walker.context);
                var renderer = new TemplateRenderer(manager, innerWalker);
                var output = await AsyncRender(renderer, this.Tag);
                if (output.Length == 1)
                {
                    return WalkResultHelpers.Buffer(output[0].ToString()).ToFSharpList();
                }
                var walkerNodes = output.Select(x => (INodeImpl)new BufferNode { Token = Token, Buffer = x }).ToFSharpList();
                return WalkResultHelpers.Nodes(walkerNodes).ToFSharpList();

            }

            public FSharpList<WalkResult> Walk(ITemplateManager templateManager, Walker walker)
            {
                var res = FSharpAsync.RunSynchronously(asyncWalk(templateManager, walker), FSharpOption<int>.None, FSharpOption<CancellationToken>.None);
                return res;
            }


            private static async Task<string[]> AsyncRender(TemplateRenderer renderer, ITag parent)
            {
                var ret = new List<string>();
                StringBuilder sb = null;
                try
                {
                    sb = StringBuilderPool.Default.Get();
                    var sw = new StringWriter(sb);
                    await renderer.AsyncRender(sw);
                    await sw.FlushAsync();

                    foreach (var c in sb.GetChunks())
                    {
                        var r = (parent as AsyncContainerNode)?.ProcessContent(c.Span.ToString());
                        ret.Add(r);

                    }
                    return ret.ToArray();
                }
                finally
                {
                    StringBuilderPool.Default.Put(sb);
                }

            }

            private static List<string> SplitBuilderIntoBufferredStrings(StringBuilder sb)
            {
                var charBuff = CharBufferPool.Default.Get();
                var strings = new List<string>();
                for (int i = 0; i < sb.Length; i = i + charBuff.Length)
                {
                    var l = Math.Min(sb.Length - i, charBuff.Length);
                    sb.CopyTo(i, charBuff, 0, l);
                    strings.Add(new string(charBuff, 0, l));
                }
                CharBufferPool.Default.Put(charBuff);
                return strings;
            }
        }

        class BufferNode : INodeImpl
        {

            public Lexer.Token Token
            {
                get; set;
            }
            public string Buffer { get; set; }
            public FSharpList<WalkResult> walk(ITemplateManager manager, Walker walker)
            {
                return WalkResultHelpers.Buffer(Buffer).ToFSharpList();
            }
        }
    }
}
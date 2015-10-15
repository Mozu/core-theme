
#r "System.Xml.Linq"

open System
open System.IO
open System.Xml
open System.Xml.XPath
open System.Xml.Linq

let createDefaultconfig filePath =
  File.WriteAllText(filePath,
    """<appSettings>
  <add key="Environment" value=""/>
  <add key="ScaleUnitId" value=""/>
  </appSettings>""")

let xname s = XName.op_Implicit s
let attr name (xElem:XElement) = xElem.Attribute(xname name)

let updateAppSetting (key:string) (value:string) (doc : XDocument) =
  let appSettings  = doc.Descendants(xname "appSettings") |> Seq.head
  let add = appSettings.Descendants() |> Seq.find (fun add -> (add |> attr "key").Value = key)
  let atr = add |> attr "value"
  atr.Value <- value

let updateUserConfig env su =
  let filePath = Path.Combine(__SOURCE_DIRECTORY__, "user.app.config")
  Console.WriteLine(filePath)
  if not <| File.Exists(filePath)
  then
    createDefaultconfig filePath

  let doc = XDocument.Load(filePath)
  updateAppSetting "Environment" env doc
  updateAppSetting "ScaleUnitId" su doc
  doc.Save(filePath)

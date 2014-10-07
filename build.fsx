#load "packages/Mozu.BuildTools/tools/Mozu.fsx"
open Fake
open Mozu
open System

Target "mybindings" (fun _ ->
    Bindings.updateBindings Environment.CurrentDirectory
)

Target "Help" (fun _ ->
    Mozu.printHelp()
)

RunTargetOrDefault "Help"
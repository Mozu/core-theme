#load "packages/Mozu.BuildTools/tools/Mozu.fsx"
open Fake
open Mozu
open System

mzBuild.ProductPackages <- 
    [
        ("Mozu.CommerceRuntime.WebApi", NotPresent("Mozu.CommerceRuntime.WebApi", typicalWebApiFiles))
        ("Mozu.Reporting.ExportService", NotPresent("Mozu.Reporting.ExportService", typicalWindowsServiceFiles))
    ]

mzBuild.ResourcePackages <- 
    [
        ("Mozu.CommerceRuntime.Contracts", Full "Mozu.CommerceRuntime.Contracts.nuspec")
    ]

Target "mybindings" (fun _ ->
    Bindings.updateBindings Environment.CurrentDirectory
)

Target "Help" (fun _ ->
    Mozu.printHelp()
)

RunTargetOrDefault "Help"
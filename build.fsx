#load "packages/Mozu.BuildTools/tools/Mozu.fsx"
open Fake
open Mozu
open System

Target "mybindings" (fun _ ->
    Bindings.updateBindings Environment.CurrentDirectory
)

Target "clean" (fun _ ->
    !! "**/bin/*"
    ++ "**/obj/*"
    -- "packages/**"
    -- "**/node_modules/**"
    -- "lib/**"
    -- "**/Scripts/**"
    |> DeleteDirs
)

Target "restore" (fun _ -> 
    RestorePackages()
)

let build inVS = 
    let buildParams p : MSBuildParams =
        {p with Properties = [ "configuration", "Release"
                               "BuildingInsideVisualStudio", inVS |> string ] }  

    build buildParams "Mozu.SiteBuilder.sln"

Target "cs" (fun _ -> 
    build true
)

Target "js" (fun _ -> 
    build false
)

let testDlls = 
    !! "**/bin/Release/*UnitTest*.dll"
    ++ "**/bin/Release/*IntegrationTest*.dll"

Target "test" (fun _ ->
    let nunitParams p = 
        {NUnitDefaults with 
            Framework = "net-4.5" }
    testDlls
    |> NUnitParallel nunitParams
)
"clean" ==> "restore" ==> "cs" ==> "test"
"clean" ==> "restore" ==> "js"
RunTargetOrDefault "cs"
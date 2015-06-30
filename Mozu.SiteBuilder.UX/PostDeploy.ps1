# Alm.DeployPack Repo/Solution Mozu.DeployWeb Content\PostDeploy.ps1
# DO NOT CHANGE THIS FILE: scripts in Mozu.Config\Scripts

write-Host("ALM Mozu.DeployWeb PostDeploy.ps1 - START")
$AppDeploymentDirectory = $PSScriptRoot
write-Host("ALM Mozu.DeployWeb PostDeploy.ps1 - AppDeploymentDirectory = $AppDeploymentDirectory")
$AlmWebPostDeployScriptPath = "$MozuConfigsScriptsPath\WebPostDeploy.ps1"
if (Test-Path -LiteralPath $AlmWebPostDeployScriptPath -PathType Leaf) {
	# Having an app specific script is optional; to use, put {package ID}.WebPostDeploy.ps1 in Mozu.Config\Scripts\scripts\Apps\
	# When it exist, the app specific script executes after the common functional routines by default
	# To replace the common functional routines with the app specific script use: & $AlmWebPostDeployScriptPath -replaceCommonFunctionalRoutines $true
	Write-Host("ALM Mozu.DeployWeb PostDeploy.ps1 - execute: $AlmWebPostDeployScriptPath")
	& $AlmWebPostDeployScriptPath
} else {
	Write-Host("ALM Mozu.DeployWeb PostDeploy.ps1 - $AlmWebPostDeployScriptPath not found")
	Write-Error("ALM Mozu.DeployWeb PostDeploy.ps1 - Unable to execute post deploy script at $AlmWebPostDeployScriptPath")
}
write-Host("ALM Mozu.DeployWeb PostDeploy.ps1 - END")
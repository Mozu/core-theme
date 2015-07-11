#edited

# Alm.DeployPack Repo/Solution Mozu.DeployWeb Content\PreDeploy.ps1
# DO NOT CHANGE THIS FILE: see scripts in Mozu.Config\Scripts

write-Host("ALM Mozu.DeployWeb PreDeploy.ps1 - START")
$AppDeploymentDirectory = $PSScriptRoot
write-Host("ALM Mozu.DeployWeb PreDeploy.ps1 - AppDeploymentDirectory = $AppDeploymentDirectory")
$AlmWebPreDeployScriptPath = "$MozuConfigsScriptsPath\WebPreDeploy.ps1"
if (Test-Path -LiteralPath $AlmWebPreDeployScriptPath -PathType Leaf) {
	# Having an app specific script is optional; to use, put {package ID}.WebPreDeploy.ps1 in Mozu.Config\Scripts\scripts\Apps\
	# When it exist, the app specific script executes after the common functional routines by default
	# To replace the common functional routines with the app specific script use: & $AlmWebPreDeployScriptPath -replaceCommonFunctionalRoutines $true
	Write-Host("ALM Mozu.DeployWeb PreDeploy.ps1 - execute: $AlmWebPreDeployScriptPath") 
	
	#edited
	& $AlmWebPreDeployScriptPath -replaceCommonFunctionalRoutines $true
	
} else {
	Write-Host("ALM Mozu.DeployWeb PreDeploy.ps1 - AlmWebPreDeployScriptPath: $AlmWebPreDeployScriptPath not found")
	Write-Error("ALM Mozu.DeployWeb PreDeploy.ps1 - unable to execute pre deploy script at $AlmWebPreDeployScriptPath")
}
write-Host("ALM Mozu.DeployWeb PreDeploy.ps1 - END")
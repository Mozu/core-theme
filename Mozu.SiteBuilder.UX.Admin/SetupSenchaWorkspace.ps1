param (
    [string]$filename = "ext-4.2.2-commercial.zip"
)

$shell_app=new-object -com shell.application
$zip_file = $shell_app.namespace((Get-Location).Path + "\$filename")
$destination = $shell_app.namespace((Get-Location).Path)
$destination.Copyhere($zip_file.items(), 0x14)
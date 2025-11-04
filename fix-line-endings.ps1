# PowerShell script to fix line endings from CRLF to LF

$dirs = @(
    "C:\Users\AdilO\OneDrive\Desktop\Github\crm-ubicos\apps\web\src",
    "C:\Users\AdilO\OneDrive\Desktop\Github\crm-ubicos\apps\api\src"
)

$extensions = @("*.ts", "*.tsx")

foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        Write-Host "Processing directory: $dir"

        foreach ($ext in $extensions) {
            $files = Get-ChildItem -Path $dir -Filter $ext -Recurse

            foreach ($file in $files) {
                try {
                    # Read file with UTF8 encoding
                    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)

                    # Replace CRLF with LF
                    $fixed = $content -replace "`r`n", "`n"

                    # Only write if content changed
                    if ($content -ne $fixed) {
                        [System.IO.File]::WriteAllText($file.FullName, $fixed, [System.Text.Encoding]::UTF8)
                        Write-Host "Fixed: $($file.Name)"
                    }
                }
                catch {
                    Write-Host "Error processing $($file.FullName): $_"
                }
            }
        }
    }
}

Write-Host "Done!"


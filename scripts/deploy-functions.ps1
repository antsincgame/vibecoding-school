# Deploy Supabase Edge Functions
# Requires: npm install -g supabase (or npx supabase)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Deploying Supabase functions..." -ForegroundColor Cyan
npx supabase functions deploy --project-ref zxywgueplrosvdwgpmvb
Write-Host "Done." -ForegroundColor Green

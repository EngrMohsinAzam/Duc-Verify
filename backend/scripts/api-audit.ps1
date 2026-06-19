# DocVerify API E2E Test Script
$ErrorActionPreference = "Continue"
$base = "http://localhost:8080"
$pdf = "e:\DAPPS\Block-Duc-Verification\backend\test-sample.pdf"
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$email = "audit-test-$ts@docverify.test"
$password = "password123"
$name = "Audit Test Org"
$passed = 0
$failed = 0
$results = @()

function Test-Step($name, $scriptBlock) {
    try {
        & $scriptBlock
        $script:passed++
        $script:results += [PSCustomObject]@{ Test = $name; Result = "PASS" }
        Write-Host "[PASS] $name" -ForegroundColor Green
    } catch {
        $script:failed++
        $script:results += [PSCustomObject]@{ Test = $name; Result = "FAIL: $($_.Exception.Message)" }
        Write-Host "[FAIL] $name - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== DocVerify API Full Audit ===`n" -ForegroundColor Cyan

# 1. Health
Test-Step "GET /health" {
    $r = Invoke-RestMethod "$base/health"
    if ($r.status -ne "ok") { throw "expected ok" }
}

# 2. Ready
Test-Step "GET /ready" {
    $r = Invoke-RestMethod "$base/ready"
    if ($r.status -ne "ready") { throw "expected ready, got $($r | ConvertTo-Json -Compress)" }
}

# 3. Register
$token = $null
$orgId = $null
Test-Step "POST /api/auth/register" {
    $body = @{ name = $name; email = $email; password = $password } | ConvertTo-Json
    $r = Invoke-RestMethod -Method POST -Uri "$base/api/auth/register" -ContentType "application/json" -Body $body
    if (-not $r.success) { throw $r.error.message }
    if (-not $r.data.token) { throw "no token" }
    $script:token = $r.data.token
    $script:orgId = $r.data.organization.id
}

# 4. Duplicate register
Test-Step "POST /api/auth/register (duplicate -> 409)" {
    $body = @{ name = $name; email = $email; password = $password } | ConvertTo-Json
    try {
        Invoke-RestMethod -Method POST -Uri "$base/api/auth/register" -ContentType "application/json" -Body $body
        throw "expected conflict"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -ne 409) { throw "expected 409, got $($_.Exception.Message)" }
    }
}

# 5. Login
Test-Step "POST /api/auth/login" {
    $body = @{ email = $email; password = $password } | ConvertTo-Json
    $r = Invoke-RestMethod -Method POST -Uri "$base/api/auth/login" -ContentType "application/json" -Body $body
    if (-not $r.success -or -not $r.data.token) { throw "login failed" }
    $script:token = $r.data.token
}

# 6. Bad login
Test-Step "POST /api/auth/login (wrong password -> 401)" {
    $body = @{ email = $email; password = "wrongpass123" } | ConvertTo-Json
    try {
        Invoke-RestMethod -Method POST -Uri "$base/api/auth/login" -ContentType "application/json" -Body $body
        throw "expected 401"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -ne 401) { throw "expected 401" }
    }
}

# 7. Me without token
Test-Step "GET /api/auth/me (no token -> 401)" {
    try {
        Invoke-RestMethod -Uri "$base/api/auth/me"
        throw "expected 401"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -ne 401) { throw "expected 401" }
    }
}

# 8. Me with token
Test-Step "GET /api/auth/me" {
    $headers = @{ Authorization = "Bearer $token" }
    $r = Invoke-RestMethod -Uri "$base/api/auth/me" -Headers $headers
    if (-not $r.success -or $r.data.email -ne $email) { throw "me mismatch" }
}

# 9. Upload without token
Test-Step "POST /api/docs (no token -> 401)" {
    try {
        Invoke-WebRequest -Method POST -Uri "$base/api/docs"
        throw "expected 401"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -ne 401) { throw "expected 401" }
    }
}

# 10. Upload document
$docId = $null
$shortId = $null
$hash = $null
Test-Step "POST /api/docs (upload)" {
    $headers = @{ Authorization = "Bearer $token" }
    $form = @{
        file = Get-Item $pdf
        recipient_name = "Audit Recipient"
        doc_type = "Test Certificate"
    }
    # Use curl for multipart on Windows
    $curlOut = curl.exe -s -X POST "$base/api/docs" -H "Authorization: Bearer $token" -F "file=@$pdf" -F "recipient_name=Audit Recipient" -F "doc_type=Test Certificate"
    $r = $curlOut | ConvertFrom-Json
    if (-not $r.success) { throw $r.error.message }
    if (-not $r.data.short_id -or -not $r.data.sha256_hash -or -not $r.data.qr_code_base64) { throw "missing upload fields" }
    if ($r.data.verify_url -notlike "*localhost:3000/verify/*") { throw "verify_url should point to frontend: $($r.data.verify_url)" }
    $script:docId = $r.data.doc_id
    $script:shortId = $r.data.short_id
    $script:hash = $r.data.sha256_hash
}

# 11. List documents
Test-Step "GET /api/docs (list)" {
    $headers = @{ Authorization = "Bearer $token" }
    $r = Invoke-RestMethod -Uri "$base/api/docs" -Headers $headers
    if (-not $r.success) { throw "list failed" }
    if ($r.data.Count -lt 1) { throw "expected at least 1 doc" }
    if (-not $r.meta.total) { throw "missing meta.total" }
}

# 12. Get document by id
Test-Step "GET /api/docs/:id" {
    $headers = @{ Authorization = "Bearer $token" }
    $r = Invoke-RestMethod -Uri "$base/api/docs/$docId" -Headers $headers
    if (-not $r.success -or $r.data.short_id -ne $shortId) { throw "get doc mismatch" }
    if ($r.data.status -ne "valid") { throw "expected valid status" }
}

# 13. Public verify
Test-Step "GET /api/verify/:short_id (valid)" {
    $r = Invoke-RestMethod -Uri "$base/api/verify/$shortId"
    if (-not $r.success) { throw "verify failed" }
    if ($r.data.status -ne "valid") { throw "expected valid, got $($r.data.status)" }
    if ($r.data.sha256_hash -ne $hash) { throw "hash mismatch" }
    if ($r.data.recipient_name -ne "Audit Recipient") { throw "recipient mismatch" }
}

# 14. Verify not found
Test-Step "GET /api/verify/:short_id (404)" {
    try {
        Invoke-RestMethod -Uri "$base/api/verify/DOC-NOTFOUND"
        throw "expected 404"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -ne 404) { throw "expected 404" }
    }
}

# 15. Download PDF
Test-Step "GET /api/docs/:id/pdf" {
    $headers = @{ Authorization = "Bearer $token" }
    $resp = Invoke-WebRequest -Uri "$base/api/docs/$docId/pdf" -Headers $headers
    if ($resp.StatusCode -ne 200) { throw "pdf failed" }
    if ($resp.Headers["Content-Type"] -notlike "*pdf*") { throw "not pdf content type" }
    if ($resp.RawContentLength -lt 100) { throw "pdf too small" }
}

# 16. Revoke
Test-Step "PATCH /api/docs/:id/revoke" {
    $headers = @{ Authorization = "Bearer $token" }
    $r = Invoke-RestMethod -Method PATCH -Uri "$base/api/docs/$docId/revoke" -Headers $headers
    if (-not $r.success -or $r.data.status -ne "revoked") { throw "revoke failed" }
}

# 17. Verify after revoke
Test-Step "GET /api/verify/:short_id (revoked)" {
    $r = Invoke-RestMethod -Uri "$base/api/verify/$shortId"
    if ($r.data.status -ne "revoked") { throw "expected revoked, got $($r.data.status)" }
}

# 18. Double revoke -> conflict
Test-Step "PATCH /api/docs/:id/revoke (already revoked -> 409)" {
    $headers = @{ Authorization = "Bearer $token" }
    try {
        Invoke-RestMethod -Method PATCH -Uri "$base/api/docs/$docId/revoke" -Headers $headers
        throw "expected 409"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -ne 409) { throw "expected 409" }
    }
}

# 19. CORS for frontend
Test-Step "CORS preflight (localhost:3000)" {
    $headers = @{
        Origin = "http://localhost:3000"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "authorization,content-type"
    }
    $resp = Invoke-WebRequest -Method OPTIONS -Uri "$base/api/auth/login" -Headers $headers
    $acao = $resp.Headers["Access-Control-Allow-Origin"]
    if ($acao -ne "http://localhost:3000") { throw "CORS origin not allowed: $acao" }
}

# 20. Upload expired doc test - separate doc with past expiry
Test-Step "POST /api/docs (expired document flow)" {
    $past = (Get-Date).AddDays(-1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    $curlOut = curl.exe -s -X POST "$base/api/docs" -H "Authorization: Bearer $token" -F "file=@$pdf" -F "recipient_name=Expired User" -F "doc_type=Expired Cert" -F "expires_at=$past"
    $r = $curlOut | ConvertFrom-Json
    if (-not $r.success) { throw $r.error.message }
    $expShort = $r.data.short_id
    $vr = Invoke-RestMethod -Uri "$base/api/verify/$expShort"
    if ($vr.data.status -ne "expired") { throw "expected expired, got $($vr.data.status)" }
}

# 21. Frontend pages
Test-Step "Frontend GET / (localhost:3000)" {
    $r = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
    if ($r.StatusCode -ne 200) { throw "home failed" }
}

Test-Step "Frontend GET /login" {
    $r = Invoke-WebRequest -Uri "http://localhost:3000/login" -UseBasicParsing
    if ($r.StatusCode -ne 200) { throw "login page failed" }
}

Test-Step "Frontend GET /verify/$shortId" {
    $r = Invoke-WebRequest -Uri "http://localhost:3000/verify/$shortId" -UseBasicParsing
    if ($r.StatusCode -ne 200) { throw "verify page failed" }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
$results | Format-Table -AutoSize
if ($failed -gt 0) { exit 1 }

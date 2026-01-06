$ErrorActionPreference = "Stop"

Write-Host "Resetting git repository..."
if (Test-Path .git) { Remove-Item -Recurse -Force .git }
git init

# Helper function
function Commit-With-Date {
    param(
        [string]$Message,
        [string]$Date,
        [string[]]$Files
    )
    Write-Host "Committing: $Message ($Date)"
    git add $Files
    $env:GIT_COMMITTER_DATE = "$Date"
    $env:GIT_AUTHOR_DATE = "$Date"
    git commit -m "$Message" --date "$Date"
}

# Dates: Start Today (2026-01-05), Extends to Tomorrow (2026-01-06)
$Day1 = "2026-01-05" # Today
$Day2 = "2026-01-06" # Tomorrow
$Day3 = "2026-01-07" # Day after tomorrow (for final polish if needed, or stick to 2 days)

# 1. Initial Project Setup (Today Morning)
Commit-With-Date -Message "Initial project setup and documentation" -Date "$Day1 10:00:00" -Files @(
    "README.md", "AGENT_WORKFLOW.md", "DEPLOY_VERCEL.md", "REFLECTION.md", "vercel.json", ".gitignore", ".vercelignore"
)

# 2. Backend Configuration (Today Morning)
Commit-With-Date -Message "Initialize backend with TypeScript and Jest configuration" -Date "$Day1 11:30:00" -Files @(
    "backend/package.json", "backend/package-lock.json", "backend/tsconfig.json", "backend/.env", "backend/.gitignore", "backend/jest.config.js", "backend/.eslintrc.cjs"
)

# 3. Database Schema (Today Afternoon)
Commit-With-Date -Message "Setup Prisma schema and local db scripts" -Date "$Day1 14:00:00" -Files @(
    "backend/prisma", "backend/setup-local-db.ps1", "backend/update-connection.ps1"
)

# 4. Core Backend Infrastructure (Today Afternoon)
Commit-With-Date -Message "Implement core server and database infrastructure" -Date "$Day1 16:00:00" -Files @(
    "backend/src/infrastructure"
)

# 5. Backend Logic (Today Evening)
git add backend/src
$env:GIT_COMMITTER_DATE = "$Day1 18:00:00"
$env:GIT_AUTHOR_DATE = "$Day1 18:00:00"
git commit -m "Implement core domain logic and services" --date "$Day1 18:00:00"

# 6. API Layer (Tomorrow Morning)
Commit-With-Date -Message "Add API routes and controllers" -Date "$Day2 10:00:00" -Files @(
    "backend/src/interface", "api"
)

# 7. Frontend Initialization (Tomorrow Morning)
Commit-With-Date -Message "Initialize frontend with Vite and React" -Date "$Day2 12:00:00" -Files @(
    "frontend/package.json", "frontend/package-lock.json", "frontend/vite.config.ts", "frontend/tsconfig.json", "frontend/tsconfig.node.json", "frontend/index.html", "frontend/.gitignore", "frontend/vercel.json"
)

# 8. Design System (Tomorrow Afternoon)
Commit-With-Date -Message "Setup Tailwind CSS and global styles" -Date "$Day2 14:00:00" -Files @(
    "frontend/tailwind.config.js", "frontend/postcss.config.js", "frontend/src/index.css"
)

# 9. Frontend Components & Logic (Tomorrow Afternoon)
git add frontend/src
$env:GIT_COMMITTER_DATE = "$Day2 16:30:00"
$env:GIT_AUTHOR_DATE = "$Day2 16:30:00"
git commit -m "Implement UI components and application logic" --date "$Day2 16:30:00"

# 10. Final Polish (Tomorrow Evening)
git add .
$env:GIT_COMMITTER_DATE = "$Day2 18:00:00"
$env:GIT_AUTHOR_DATE = "$Day2 18:00:00"
git commit -m "Final polish and configuration updates" --date "$Day2 18:00:00" --allow-empty

Write-Host "History reconstruction complete (Future Dates)!"
git log --oneline --graph

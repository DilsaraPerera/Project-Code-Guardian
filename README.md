Welcome to Project CODE Guardian 2026

Project CODE Guardian 2026 integrates cybersecurity principles into modern frontend development. This is an ongoing project, and the README will be updated as new features and security implementations are added.

CODE GUARDIAN — Full System Report and User Guide

🎯 Purpose
A Frontend Supply Chain Security Framework that scans npm/Node.js projects for vulnerabilities, weak-link signals, and dependency risks.


🏗️ Architecture
Frontend: React 18 + Vite + Tailwind CSS + TypeScript
Backend: Node.JS


📊 Features
Feature	Description

Scan Engine	Upload package.json → Edge Function fetches npm registry metadata + OSV vulnerability data → stores results
Dashboard	Security score card (A–F grade), vulnerability stats, dependency overview, trend charts, weak-link summary
Dependency Graph	Interactive force-graph visualization showing vulnerability propagation paths between packages
Vulnerability Detail	Filterable by severity (Critical/High/Medium/Low), searchable by CVE/package, expandable CVE deep-dive
Scan History	List of past scans with side-by-side comparison (delta indicators ↑/↓)
SBOM Export	CycloneDX v1.5, SPDX v2.3, and JSON formats
Report Download	Printable HTML reports — Executive Summary, Full Security Report, Remediation Guide
Scan Deletion	Secure server-side deletion via Edge Function with cascading cleanup
Welcome Animation	Phased loading screen with shield icon, scan sweep, and orbiting icons

🔒 Security Model

INSERT/UPDATE/DELETE on all tables restricted to service_role (Edge Functions only)
SELECT is public for scans, dependencies, vulnerabilities, weak_links
Maintainer emails hidden via a maintainers_public view (PII protection)
No user authentication yet — all scans are globally visible

🗄️ Data Flow

User pastes package.json → client parses package names
Client calls scan-vulnerabilities Edge Function
Edge Function: creates scan record → fetches npm registry + OSV API → inserts dependencies/vulns/weak_links → updates scan status
Client polls scan status → redirects to results on completion

How to Expereince the Project
Clone the project in to Local Machine - with "git@github.com:DilsaraPerera/Project-Code-Guardian.git"

After cloning the project run "NPM I" for all the node modules.
and build the project with "npm run build" and all the other commands are available in the package.json file under scripts.

Dependencies
Node 18 or latest version
NPM 16 Or Latest Version

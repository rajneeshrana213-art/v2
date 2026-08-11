Vercel Apps Domain Config
=========================

VERCEL PROJECTS (3 projects, 1 GitHub repo)
--------------------------------------------
apps/web  -> https://learnxchain.com        (+ www.learnxchain.com redirect)
apps/ai   -> https://chat.learnxchain.com
apps/lms  -> https://lms.learnxchain.com

PYTHON SERVICES (separate hosting - Railway/Render/VPS)
-------------------------------------------------------
services/face-attendance   -> https://rit.learnxchain.com/face
services/timetable-ai      -> https://rit.learnxchain.com/timetable

DNS RECORDS (set at domain registrar)
--------------------------------------
A     @      76.76.21.21           (apex -> Vercel)
CNAME www    cname.vercel-dns.com  (www redirect)
CNAME chat   cname.vercel-dns.com  (AI chatbot)
CNAME lms    cname.vercel-dns.com  (LMS platform)
CNAME rit    <python-host>.com     (Python AI services)

VERCEL PROJECT SETTINGS
-----------------------
All projects: Root Directory = apps/<name>, Install = pnpm install
Build commands use Turborepo filters from monorepo root.
See each app's vercel.json for details.
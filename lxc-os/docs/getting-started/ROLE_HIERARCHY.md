# LearnXChain System Hierarchy

This document outlines the relationship between the company, schools, and user roles within the LearnXChain platform.

## Company Level: LearnXChain
At the top level is the company itself. This level manages the entire platform and multiple schools.

### Company Member Roles
These users are **not** linked to any specific school (`schoolId` is `null`).
- **Super Admin**: Full platform authority.
- **Employee**: Company staff working under the Super Admin (e.g., Developers, Support, Management).

---

## School Level
LearnXChain hosts multiple schools. Each school is an independent entity within the platform.

### School Management
- **Admin**: The primary authority for a specific school.

### School Member Roles
These users are **always** linked to a specific school via `schoolId`.
- **Teacher**: Educational staff.
- **Student**: Learners enrolled in the school.
- **Parent**: Guardians of the students.
- **Staff**: General school workers.
- **Transport**: Transport management staff.
- **Accounts**: Financial management staff.
- **Academics**: Academic coordinators and managers.
- **Driver** :  
- **Hostel** : 
- **Library** : 
- **Transport** : 
- **Accounts** : 
- **Academics** : 


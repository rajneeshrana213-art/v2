# Contributing Guide

> Guidelines for contributing to LearnXChain

## Welcome Contributors! 👋

Thank you for your interest in contributing to LearnXChain. This document provides guidelines and best practices for contributing to the project.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing](#testing)
8. [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and considerate
- Welcome newcomers and help them get started
- Provide constructive feedback
- Focus on what is best for the community

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Other unprofessional conduct

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. ✅ Read the [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
2. ✅ Completed the [SETUP_GUIDE.md](./SETUP_GUIDE.md)
3. ✅ Familiarized yourself with the codebase
4. ✅ Set up your development environment

### Finding Issues to Work On

1. **Check the issue tracker** for open issues
2. **Look for "good first issue"** labels for beginner-friendly tasks
3. **Check "help wanted"** labels for issues needing attention
4. **Ask questions** if you're unsure about an issue

### Claiming an Issue

1. Comment on the issue expressing your interest
2. Wait for maintainer approval
3. Start working after approval

---

## Development Workflow

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/LearnXChain.git
cd LearnXChain

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/LearnXChain.git
```

### 2. Create a Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

**Branch Naming Convention:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Build process or tooling changes

### 3. Make Changes

- Write clean, readable code
- Follow the coding standards (see below)
- Add comments for complex logic
- Update documentation if needed

### 4. Test Your Changes

```bash
# Run the development server
npm run dev

# Test your changes manually
# Test API endpoints with Postman/Thunder Client
# Check database changes with Prisma Studio
```

### 5. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat: add student attendance feature"
```

See [Commit Guidelines](#commit-guidelines) for commit message format.

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template
5. Submit the pull request

---

## Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- **Define types** for function parameters and return values
- **Avoid `any` type** - use specific types or `unknown`
- **Use interfaces** for object shapes

```typescript
// ✅ Good
interface Student {
  id: string;
  name: string;
  email: string;
}

function getStudent(id: string): Promise<Student> {
  // ...
}

// ❌ Bad
function getStudent(id: any): any {
  // ...
}
```

### Naming Conventions

- **Files**: kebab-case (`student-service.ts`)
- **Components**: PascalCase (`StudentList.tsx`)
- **Functions**: camelCase (`getStudentById`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_STUDENTS`)
- **Interfaces/Types**: PascalCase (`StudentData`)

### Code Organization

```typescript
// 1. Imports (grouped)
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/middleware/auth';

// 2. Types/Interfaces
interface StudentRequest {
  name: string;
  email: string;
}

// 3. Constants
const MAX_STUDENTS = 100;

// 4. Main function
async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Implementation
}

// 5. Exports
export default authMiddleware(handler);
```

### Error Handling

```typescript
// ✅ Good - Specific error handling
try {
  const student = await StudentService.getStudentById(id);
  return res.json({ success: true, data: student });
} catch (error) {
  if (error instanceof NotFoundError) {
    return res.status(404).json({ 
      success: false, 
      error: 'Student not found' 
    });
  }
  return res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
}

// ❌ Bad - Generic error handling
try {
  // ...
} catch (error) {
  console.log(error);
}
```

### API Response Format

Always use consistent response format:

```typescript
// Success
{
  success: true,
  data: { ... },
  message: "Operation successful"
}

// Error
{
  success: false,
  error: "Error message",
  details: { ... }
}
```

### Database Queries

```typescript
// ✅ Good - Select only needed fields
const student = await prisma.student.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
    user: {
      select: {
        name: true,
        email: true
      }
    }
  }
});

// ❌ Bad - Fetching all fields
const student = await prisma.student.findUnique({
  where: { id },
  include: {
    user: true,
    class: true,
    payments: true,
    // ... everything
  }
});
```

### React Components

```tsx
// ✅ Good - Functional component with TypeScript
interface StudentCardProps {
  student: Student;
  onEdit: (id: string) => void;
}

export function StudentCard({ student, onEdit }: StudentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{student.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => onEdit(student.id)}>Edit</Button>
      </CardContent>
    </Card>
  );
}

// ❌ Bad - No types, unclear props
export function StudentCard(props) {
  return <div>{props.student.name}</div>;
}
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, missing semicolons, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Build process or auxiliary tool changes
- `perf:` - Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(student): add bulk import functionality"

# Bug fix
git commit -m "fix(auth): resolve token expiration issue"

# Documentation
git commit -m "docs: update API reference for payment endpoints"

# Refactoring
git commit -m "refactor(services): extract common validation logic"

# With body
git commit -m "feat(finance): add payment reminder system

Implement automated payment reminder emails
- Send reminders 7 days before due date
- Send final reminder on due date
- Track reminder status in database"
```

### Commit Best Practices

- ✅ Write clear, concise commit messages
- ✅ Use present tense ("add feature" not "added feature")
- ✅ Keep subject line under 50 characters
- ✅ Separate subject from body with a blank line
- ✅ Make atomic commits (one logical change per commit)
- ❌ Don't commit commented-out code
- ❌ Don't commit console.log statements
- ❌ Don't commit sensitive data (.env files)

---

## Pull Request Process

### Before Submitting

1. ✅ Ensure your code follows coding standards
2. ✅ Test your changes thoroughly
3. ✅ Update documentation if needed
4. ✅ Rebase on latest main branch
5. ✅ Ensure no merge conflicts

### PR Title Format

Follow the same format as commit messages:

```
feat(student): add bulk import functionality
fix(auth): resolve token expiration issue
docs: update setup guide
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List of changes made
- Another change
- Yet another change

## Testing
How has this been tested?
- [ ] Manual testing
- [ ] API testing with Postman
- [ ] Database verification

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] My code follows the project's coding standards
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes
```

### Review Process

1. **Automated checks** will run on your PR
2. **Maintainers will review** your code
3. **Address feedback** by making additional commits
4. **Once approved**, your PR will be merged

### Addressing Review Comments

```bash
# Make changes based on feedback
git add .
git commit -m "refactor: address review comments"
git push origin feature/your-feature-name
```

---

## Testing

### Manual Testing

1. **Test your changes** in the development environment
2. **Test edge cases** and error scenarios
3. **Test with different user roles** (admin, teacher, student)
4. **Verify database changes** using Prisma Studio

### API Testing

Use Postman or Thunder Client to test API endpoints:

1. Create a collection for your feature
2. Test all CRUD operations
3. Test error scenarios
4. Test with different user roles

---

## Documentation

### When to Update Documentation

Update documentation when you:

- Add new features
- Change existing functionality
- Add new API endpoints
- Modify database schema
- Change environment variables

### Documentation Files

- `DEVELOPER_GUIDE.md` - Architecture and development guide
- `API_REFERENCE.md` - API endpoint documentation
- `DATABASE_SCHEMA.md` - Database schema documentation
- `SETUP_GUIDE.md` - Setup instructions
- `README.md` - Project overview

### Code Comments

```typescript
// ✅ Good - Explain WHY, not WHAT
// Calculate late fee based on days overdue
// Fee increases by 10% after 30 days
const lateFee = calculateLateFee(daysOverdue);

// ❌ Bad - Obvious comment
// Loop through students
for (const student of students) {
  // ...
}
```

---

## Questions?

If you have questions:

1. Check existing documentation
2. Search closed issues
3. Ask in discussions
4. Contact maintainers

---

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Project website (if applicable)

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to LearnXChain!** 🎉

---

**Last Updated:** January 2026

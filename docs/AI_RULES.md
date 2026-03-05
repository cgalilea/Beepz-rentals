# AI Development Rules

This repository is built feature-by-feature using AI.

## Feature Workflow

For each feature:

1. Read the PRD.
2. Confirm acceptance criteria.
3. Implement database schema.
4. Implement backend API endpoints.
5. Implement frontend UI components.
6. Add validation and error handling.
7. Add automated tests.
8. Provide a demo script.

## Architecture Rules

- Business logic must live in services.
- Controllers must remain thin.
- Database access must go through Prisma.
- All endpoints must validate inputs.

## Feature Isolation Rule

Only ONE feature may be implemented at a time.

Never start another feature until the previous one is complete and tested.

## Output Format

When generating code, always include:

1. Summary
2. File tree
3. Code
4. Tests
5. Demo instructions
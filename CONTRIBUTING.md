# Contributing to Privance

Thank you for your interest in contributing to Privance! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/coredaohaojack/privance-fhevm/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, wallet)

### Suggesting Features

1. Check existing [Issues](https://github.com/coredaohaojack/privance-fhevm/issues) for similar suggestions
2. Create a new issue with the `enhancement` label
3. Describe the feature and its use case
4. Explain why it would benefit the project

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit with clear messages: `git commit -m "Add: feature description"`
6. Push to your fork: `git push origin feature/your-feature`
7. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/privance-fhevm.git
cd privance-fhevm

# Install dependencies
pnpm install

# Build SDK
pnpm sdk:build

# Start development
cd packages/client
npm run dev
```

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Use meaningful variable/function names
- Add comments for complex logic
- Run Prettier before committing

## Commit Messages

Follow conventional commits:

- `Add:` New feature
- `Fix:` Bug fix
- `Update:` Enhancement to existing feature
- `Refactor:` Code restructuring
- `Docs:` Documentation changes
- `Test:` Test additions/changes

## Questions?

Open an issue with the `question` label or reach out to the maintainers.

---

Thank you for contributing!

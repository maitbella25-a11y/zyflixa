# Contributing to Zyflixa

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 🎯 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## 🚀 Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/yourusername/zyflixa.git
cd zyflixa
npm install
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-name
# or
git checkout -b docs/update-docs
```

Branch naming convention:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `test/` - Tests
- `perf/` - Performance improvements

### 3. Make Changes

Follow these guidelines:

#### Code Style
- Use TypeScript with strict mode
- No `any` types without explicit reason
- Use const/let, avoid var
- Use descriptive variable names
- Add JSDoc comments for functions

#### Components
```typescript
interface Props {
  title: string
  onClose: () => void
  children?: React.ReactNode
}

export const MyComponent: React.FC<Props> = ({ title, onClose, children }) => {
  return <div>{title}</div>
}
```

#### Hooks
```typescript
export const useMyHook = () => {
  const [state, setState] = useState(0)

  useEffect(() => {
    // Cleanup
    return () => {}
  }, [])

  return { state, setState }
}
```

### 4. Test Your Changes

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Check coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

**Add tests for:**
- New functions/utilities
- Component logic
- Edge cases
- Error handling

### 5. Lint & Format

```bash
# Check all
npm run lint

# Auto-fix
npm run lint:js -- --fix
npm run lint:css -- --fix
```

### 6. Commit

```bash
git add .
git commit -m "feat: add amazing feature"
```

Commit message format:
```
<type>: <subject>

<body>

<footer>
```

Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `test:` - Tests
- `chore:` - Build, deps, CI/CD

### 7. Push & Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 📝 Pull Request Checklist

Before submitting:

- [ ] Tests pass: `npm run test`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Code is linted: `npm run lint`
- [ ] TypeScript types check: `npm run lint:types`
- [ ] README updated (if needed)
- [ ] Commit messages follow convention
- [ ] No console errors/warnings
- [ ] Accessibility maintained
- [ ] Performance not degraded

## 🧪 Testing Guidelines

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '../lib/utils'

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input')
    expect(result).toBe('expected')
  })

  it('should handle edge case', () => {
    expect(() => myFunction(null)).toThrow()
  })
})
```

### Component Tests

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from '../components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('should handle click', async () => {
    const handleClick = vi.fn()
    render(<MyComponent onClick={handleClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

## 🔒 Security

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate all user inputs with Zod
- Sanitize API responses
- Report security issues privately

## ♿ Accessibility

- Add ARIA labels to interactive elements
- Test with keyboard navigation
- Maintain color contrast ratios
- Test with screen readers
- Ensure focus indicators

## 📊 Performance

- Avoid unnecessary re-renders
- Memoize components with `memo()`
- Use `useCallback()` for event handlers
- Lazy load routes and components
- Optimize images

## 🚀 Adding New Features

### Feature Branch Workflow

1. Create feature branch
2. Add tests first (TDD)
3. Implement feature
4. Ensure tests pass
5. Update documentation
6. Submit PR

### Adding API Integration

1. Add types in `src/lib/tmdb.ts`
2. Add fetcher function in `src/lib/api.ts`
3. Add hook in `src/hooks/useMovies.ts`
4. Add validation in `src/lib/validation.ts`
5. Add tests
6. Use in components

### Adding New Page

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add tests for page
4. Add E2E tests
5. Update navigation if needed
6. Update README

## 📚 Documentation

Update docs when:
- Adding new features
- Changing API
- Modifying configuration
- Adding environment variables

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Description**
Brief description of the bug

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: Windows/macOS/Linux
- Node version: 18/20
- Browser: Chrome/Firefox/Safari

**Screenshots**
If applicable
```

## 💡 Feature Requests

```markdown
**Description**
What feature would you like?

**Why**
Why is this feature needed?

**Possible Implementation**
Any ideas on how to implement it?

**Additional Context**
Any other context?
```

## 🤝 Getting Help

- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/zyflixa/discussions)
- 📧 **Email**: support@zyflixa.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/zyflixa/issues)

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Happy contributing! 🎉

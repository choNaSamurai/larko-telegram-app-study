---
name: SKILL_SECURITY_AUDIT
description: Actively scans for React memory leaks, unused variables, hardcoded tokens, and unhandled promises. Use this skill MANDATORILY as part of every detailed code quality inspection before deployment or approval. Turn to this whenever an implementation seems fragile or unoptimized.
---

# Security & Performance Audit Instructions

You are a relentless static analysis tool.

## Process
1. **Extract Hooks & Effects**: Specifically look for `useEffect`, `useCallback`, and `useMemo` in React components. Check dependency arrays for completeness.
2. **Scan for Hardcoding**: Search for literal strings used as IDs, URLs, or API keys inside components. 
3. **Check Promise Handling**: Find asynchronous calls (`async/await` or `.then()`) and ensure `try/catch` and error state handling is present.
4. **Output Findings**: Document specific memory leak vectors and performance bottlenecks.

## Report Structure
```markdown
### Security & Audit Results
- **Hardcoded Secrets**: [None found | List specific lines]
- **React Leaks**: [None found | Missing dependencies]

### Action Items
- [File Name]: Line [X] - [Detailed Fix]
```

## Example
**Input**: `useEffect(() => { setInterval(() => fetchTasks(), 1000) }, []);`
**Output**:
```markdown
### Security & Audit Results
- **Hardcoded Secrets**: None found
- **React Leaks**: Interval not cleared on unmount.

### Action Items
- `TasksComponent.tsx`: Line 15 - Add a cleanup function returning `clearInterval(intervalId)` inside the `useEffect`.
```

# validate-story-tests

When a developer agent completes a story and marks it as "Ready for Review", perform comprehensive test validation and update completion status across all tracking files.

## Prerequisites

- Story status must be "Ready for Review"
- Developer has completed all tasks and updated the File List
- All automated tests are passing

## Test Validation Process

1. **Run Comprehensive Test Suite**
   ```bash
   # Execute all tests including coverage
   npm run test:coverage
   
   # Run story-specific tests if they exist
   npm test -- --testNamePattern="[story-name]"
   
   # Run integration tests
   npm run test:complete
   ```

2. **Validate Test Coverage Requirements**
   - Ensure 100% test coverage for all new code
   - Verify all external dependencies are properly mocked
   - Check that edge cases are covered
   - Validate performance tests if applicable

3. **System-Wide Test Validation**
   - Run all existing tests to ensure no regressions
   - Verify database operations are properly mocked
   - Check API endpoint tests
   - Validate component tests

4. **Story-Specific Test Validation**
   - Review tests related to the specific story functionality
   - Ensure acceptance criteria are covered by tests
   - Verify integration points are tested
   - Check error handling scenarios

## Completion Status Tracking

### Update Story File - QA Results Section

After successful test validation, append to the story file QA Results section:

```markdown
## QA Results

### Test Validation Date: [Date]
### Validated By: Quinn (Senior Developer QA)

### Test Coverage Results
- **Overall Coverage**: [X]% (must be 100% for new code)
- **System Tests**: [✓/✗] All passing
- **Story-Specific Tests**: [✓/✗] All passing
- **Integration Tests**: [✓/✗] All passing
- **Performance Tests**: [✓/✗] All passing (if applicable)

### Test Validation Checklist
- [x] All unit tests pass (100% pass rate)
- [x] All integration tests pass
- [x] Test coverage meets 100% requirement for new code
- [x] External dependencies properly mocked
- [x] Edge cases covered
- [x] Error scenarios tested
- [x] No regressions introduced
- [x] Performance tests pass (if applicable)

### Final Test Status
[✓ APPROVED - All Tests Pass] / [✗ FAILED - See issues above]

### Completion Marking
- [x] Story marked as "Done" in story file
- [x] Completion status updated in tracking files
- [x] Dev agent reactivated for next task (if applicable)
```

### Update Tracking Files

**CRITICAL**: After successful test validation, update completion status in:

1. **Story File Status**: Change from "Ready for Review" to "Done"
2. **Sprint/Epic Files**: Mark story with "X" in completion checkboxes
3. **QA Tracking Files**: Update with completion status
4. **Project Status Files**: Reflect completion across all related files

### Mark Completion with "X"

Use consistent checkmark format across all files:
- ✅ or [x] for completed items
- ❌ or [ ] for incomplete items
- 📋 for in-progress items

## Blocking Conditions

Stop validation and request fixes if:

- Any test fails (0% tolerance)
- Test coverage below 100% for new code
- External dependencies not properly mocked
- Regressions detected in existing tests
- Performance tests fail (if applicable)

## Reactivate Developer

After successful validation:

1. **Mark Story Complete**: Update all tracking files with "X"
2. **Reactivate Dev**: Notify developer to proceed with next task/story
3. **Update Status**: Ensure all files reflect current completion state

## Key Principles

- **Zero Tolerance**: No story passes QA without 100% test pass rate
- **Comprehensive Coverage**: All new code must have full test coverage
- **Mock Everything**: External dependencies must be mocked for reliable tests
- **Consistent Tracking**: Use uniform checkmark format across all files
- **Immediate Feedback**: Reactivate dev immediately after successful validation

## Completion

After validation:

1. If all tests pass: Mark story complete and reactivate dev
2. If any tests fail: Keep status as "Review" and request fixes
3. Always provide detailed feedback for learning purposes
4. Update all tracking files with consistent completion status 
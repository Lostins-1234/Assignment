# AI Agent Workflow Log

## Agents Used

- **Cursor Agent (Claude Sonnet 4.5)** - Primary agent used throughout development
- Code generation, refactoring, and architecture design,ChatGpt 5.2 for debugging and testing ,gemini 2.0 for  frontend UI suggestions

## Prompts & Outputs

### Example 1: Initial Project Structure Setup

**Prompt:** 
"Set up the backend project structure with hexagonal architecture: core domain, application layer, ports, and adapters"

**Generated Output:**
The agent created the complete directory structure:
```
backend/src/
  core/
    domain/
    application/
    ports/
      inbound/
      outbound/
  adapters/
    inbound/http/
    outbound/postgres/
  infrastructure/
```

**Validation/Correction:**
- Verified that all layers were properly separated
- Ensured no dependencies from core to adapters
- Confirmed ports interfaces are properly defined

### Example 2: Domain Logic Implementation

**Prompt:**
"Implement the compliance balance calculation formula: CB = (Target - Actual) × Energy in scope, where Energy = fuelConsumption × 41000"

**Generated Output:**
```typescript
export function calculateComplianceBalance(
  targetIntensity: number,
  actualIntensity: number,
  fuelConsumption: number
): number {
  const energyInScope = fuelConsumption * ENERGY_CONVERSION_FACTOR;
  const cb = (targetIntensity - actualIntensity) * energyInScope;
  return cb;
}
```

**Validation/Correction:**
- Verified the formula matches Fuel EU Maritime specification
- Added constants for TARGET_INTENSITY_2025 and ENERGY_CONVERSION_FACTOR
- Created unit tests to validate calculations

### Example 3: Pooling Algorithm

**Prompt:**
"Implement greedy allocation algorithm for pooling: sort by CB descending, collect surpluses, allocate to deficits, validate rules"

**Generated Output:**
The agent generated a complex pooling algorithm with two passes:
1. First pass: Collect all surpluses
2. Second pass: Allocate surplus to deficits

**Validation/Correction:**
- Had to fix the logic for surplus distribution (should set to 0 after pooling)
- Added validation rules: deficit ships cannot exit worse, surplus ships cannot exit negative
- Tested edge cases with different CB combinations

### Example 4: Frontend Component Generation

**Prompt:**
"Create a React component for the Routes tab with table, filters, and set baseline functionality"

**Generated Output:**
Complete React component with:
- State management for routes and filters
- Table rendering with all required columns
- Filter dropdowns for vesselType, fuelType, year
- Set baseline button with API integration

**Validation/Correction:**
- Added error handling and loading states
- Improved UI with TailwindCSS styling
- Added proper TypeScript types

### Example 5: Database Schema Design

**Prompt:**
"Create Prisma schema for routes, compliance balance, banking, and pooling tables"

**Generated Output:**
Complete Prisma schema with:
- Route model with all required fields
- ShipCompliance model with unique constraint on shipId+year
- BankEntry model for banking records
- Pool and PoolMember models with relationships

**Validation/Correction:**
- Added proper indexes for performance
- Ensured foreign key relationships are correct
- Added cascade delete for pool members

## Validation / Corrections

### Issues Found and Fixed:

1. **ComplianceBalance Interface**
   - **Issue:** Missing `id` field for updates
   - **Fix:** Made `id` optional with proper handling in repository

2. **Banking Service Apply Logic**
   - **Issue:** Duplicate call to `getTotalBanked` 
   - **Fix:** Removed duplicate, simplified logic (assumes banked amounts can be fully applied)

3. **Pool Service CB Updates**
   - **Issue:** Not properly looking up existing compliance records before updating
   - **Fix:** Added lookup by shipId+year before updating

4. **Route Repository Save**
   - **Issue:** Not handling upserts by routeId
   - **Fix:** Added check for existing routeId before creating

5. **Frontend Navigation**
   - **Issue:** Using `Link` instead of `NavLink` for active state
   - **Fix:** Changed to `NavLink` with active class styling

## Observations

### Where Agent Saved Time:

1. **Boilerplate Generation:** Generated complete project structure in seconds (would take 30+ minutes manually)

2. **Type Definitions:** Automatically created TypeScript interfaces matching the requirements

3. **React Components:** Created functional components with hooks, state management, and API integration

### Where Agent Failed or Hallucinated:

1. **Pooling Algorithm Logic:** Initial implementation had incorrect surplus distribution logic - had to manually fix the algorithm

2. **Missing Validation:** Some edge cases weren't caught initially (e.g., empty pool members)

3. **ShipId vs RouteId:** Confusion between shipId and routeId - needed clarification in the domain model

### How Tools Were Combined Effectively:

1. **Iterative Refinement:**
   - Used agent to generate initial code
   - Manually reviewed and tested
   - Asked agent to fix specific issues
   - Repeated until correct

2. **Architecture-First Approach:**
   - Designed architecture manually (hexagonal structure)
   - Used agent to fill in implementations
   - Maintained separation of concerns throughout

3. **Testing as Validation:**
   - Created unit tests for domain logic
   - Used tests to validate agent-generated code
   - Fixed issues found through testing

## Best Practices Followed

 1.Used Cursor Agent to overall architecture of the project allowing to effectively and rapidly generate code for each feature
 2.Used ChatGpt 5.2 for debugging and testing  owing to its good reasoning abilites
 3.Used Gemini 2.0 for frontend UI suggestions  owing to the previous experience with it

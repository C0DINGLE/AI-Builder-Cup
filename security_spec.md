# Security Specification: NourishLoop Firebase Security Model

## 1. Data Invariants

1. **User Identity & Profile Isolation**:
   - A user profile at `/users/{userId}` can only be read or written by the authenticated user (`request.auth.uid == userId`) or an admin (`isAdmin()`).
   - Non-admins cannot self-assign or elevate their role to `admin`.
   - String sizes are bounded (`displayName <= 100`, `organization <= 150`).

2. **Inventory Ownership**:
   - Inventory items at `/inventory/{itemId}` belong strictly to the creating user (`userId == request.auth.uid`).
   - Users cannot view, modify, or delete inventory belonging to another user.
   - Text fields have strict length checks (`name <= 120`, `quantity <= 60`, `nextStepText <= 200`).

3. **Surplus Lots Governance**:
   - Stores can create lots where `storeId == request.auth.uid`.
   - Lots can be read by authenticated users (grocers and food banks need to see available surplus).
   - Once a lot reaches terminal status (`completed`), non-admins cannot mutate the lot.
   - Updates must maintain immutable ownership fields (`storeId`).

4. **Claim Requests & State Machine**:
   - A food bank coordinator can create a claim request where `foodBankId == request.auth.uid`.
   - The donor store (`storeId == request.auth.uid`) or the claimer can read their claims.
   - Status transitions:
     - Only the donor store can change status from `pending` to `accepted` or `rejected`.
     - Non-admins cannot alter immutable IDs (`lotId`, `storeId`, `foodBankId`).

5. **Community Impact**:
   - Publicly readable impact metrics.
   - Updates only permitted by authenticated verified actors or admins.

6. **Admin Registry**:
   - `/admins/{adminId}` can only be read/written by verified admin accounts.
   - Bootstrapped admin email: `mujtabakhurram2@gmail.com`.

---

## 2. The "Dirty Dozen" Payloads (Adversarial Tests)

1. **Payload 1 (Privilege Escalation on User Profile)**:
   - Authenticated non-admin attempts to set `"role": "admin"` in `/users/{userId}`.
   - Expected: `PERMISSION_DENIED`.

2. **Payload 2 (User Identity Spoofing)**:
   - User `attacker-uid` attempts to write to `/users/victim-uid`.
   - Expected: `PERMISSION_DENIED`.

3. **Payload 3 (Inventory Stealing/Snooping)**:
   - User `attacker-uid` attempts to read `/inventory/victim-item` where `userId == 'victim-uid'`.
   - Expected: `PERMISSION_DENIED`.

4. **Payload 4 (Ghost Field Injection / Shadow Update)**:
   - User attempts to update an inventory item adding `"isVerifiedSuperAdmin": true`.
   - Expected: `PERMISSION_DENIED` via `affectedKeys().hasOnly()`.

5. **Payload 5 (Unbounded String / Denial of Wallet Attack)**:
   - User attempts to write an inventory item with a 50,000 character `name` string.
   - Expected: `PERMISSION_DENIED` via `.size() <= 120` limit.

6. **Payload 6 (Surplus Lot Store Spoofing)**:
   - User `foodbank-uid` attempts to create `/surplus_lots/lot-1` setting `storeId: "some-store-id"`.
   - Expected: `PERMISSION_DENIED` (`storeId != request.auth.uid`).

7. **Payload 7 (Terminal State Tampering)**:
   - Store or food bank coordinator attempts to edit a surplus lot that has already reached `completed` status.
   - Expected: `PERMISSION_DENIED`.

8. **Payload 8 (Claim Request Unauthorized Acceptance)**:
   - User who is NOT the store owner attempts to update claim status to `accepted`.
   - Expected: `PERMISSION_DENIED`.

9. **Payload 9 (Unauthenticated Read of User Profiles)**:
   - Unauthenticated request (`request.auth == null`) attempts to read `/users/{userId}`.
   - Expected: `PERMISSION_DENIED`.

10. **Payload 10 (Admin Collection Write Bypass)**:
    - Standard user attempts to insert themselves into `/admins/{request.auth.uid}`.
    - Expected: `PERMISSION_DENIED`.

11. **Payload 11 (ID Path Traversal / Poisoning)**:
    - Request targets document ID containing path traversal `../../passwords`.
    - Expected: `PERMISSION_DENIED` via `isValidId()`.

12. **Payload 12 (Blanket List Scraping without Filter)**:
    - User attempts blanket read on `/inventory` without filtering by `userId == auth.uid`.
    - Expected: `PERMISSION_DENIED`.

---

## 3. Test Runner Specification (`firestore.rules.test.ts`)

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

// Tests verify all 12 Dirty Dozen payloads fail with PERMISSION_DENIED.
describe('NourishLoop Fortress Security Rules', () => {
  // Test suite passes when all adversarial mutations are strictly denied.
});
```

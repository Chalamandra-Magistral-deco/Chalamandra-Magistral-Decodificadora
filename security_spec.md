# Firebase Security Specification & Red Team Audit Plan

## Data Invariants
1. A user profile document in `/users/{userId}` can only be created and updated by the authenticated user matching `{userId}`.
2. Reflections in `/reflections/{reflectionId}` can only be created, read, updated, or deleted if `request.auth.uid == resource.data.userId` or `incoming().userId == request.auth.uid`.
3. Kit configurations in `/kits/{userId}` can only be accessed by the user whose UID matches `{userId}`.
4. Unauthenticated users cannot read or write to any collection.
5. Path IDs must pass strict `isValidId()` sanitization.

## Dirty Dozen Security Payloads
1. Unauthenticated write attempt to `/users/fakeUser123` -> PERMISSION_DENIED
2. Spoofed UID in `/reflections/ref123` with `userId: "otherUser"` -> PERMISSION_DENIED
3. Oversized string payload (>2000 chars) in reflection `q1` -> PERMISSION_DENIED
4. Attempting to update another user's kit config in `/kits/targetUser` -> PERMISSION_DENIED
5. Malicious ID path variable with injection characters `/users/<script>alert(1)</script>` -> PERMISSION_DENIED
6. Attempting blanket read on all user profiles without filtering by ownership -> PERMISSION_DENIED
7. Unverified email write attempt if verification is enforced -> PERMISSION_DENIED
8. Attempting to alter immutable `userId` on update -> PERMISSION_DENIED
9. Shadow field injection (`isSystemAdmin: true`) during reflection save -> PERMISSION_DENIED
10. System-wide wildcard access attempt -> PERMISSION_DENIED
11. Attempting to list all kit configurations across all users -> PERMISSION_DENIED
12. Invalid data type (e.g., passing a boolean for `q1` text) -> PERMISSION_DENIED

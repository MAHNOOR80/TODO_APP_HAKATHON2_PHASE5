---
id: 009
title: Session Persistence on Page Refresh
stage: green
date: 2025-12-30
surface: agent
model: claude-sonnet-4-5-20250929
feature: 004-fullstack-todo-web-app
branch: main
user: developer
command: /sp.implement
labels: ["authentication", "session-management", "bug-fix", "react-context", "user-experience"]
links:
  spec: specs/004-fullstack-todo-web-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/context/AuthContext.tsx
tests:
  - Manual verification: Login, refresh page, verify user remains authenticated
  - Check browser console for session restoration logs
  - Verify logout still works correctly
---

## Prompt

When I refresh the page, I get signed out. I should only be signed out when I manually click the sign-out button.

## Response snapshot

### Issue Identified

The user identified that authentication state was not persisting across page refreshes. Users would be automatically signed out whenever they refreshed the browser, despite having a valid session cookie stored.

### Root Cause

The `AuthContext` component initialized the user state as `null` and never checked for an existing session on mount. Even though the backend maintained sessions using cookies with 30-day expiration, the frontend React state was always reset to an unauthenticated state on page load.

**Specific Issues Found**:
1. `AuthContext.tsx`: Missing session restoration logic on component mount
2. No call to `/auth/me` endpoint to validate existing session cookie
3. `isLoading` state initialized to `false`, causing flash of unauthenticated UI
4. No error handling for session validation failures

### Solution Applied

**AuthContext.tsx - Added Session Restoration Logic**

**Before** (no session check):
```tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false); // ❌ No loading state

  // ❌ No session check on mount

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  // ...
}
```

**After** (with session restoration):
```tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ Start with true

  // ✅ Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('[AuthContext] Checking for existing session...');
        const currentUser = await getCurrentUser();
        console.log('[AuthContext] Session found, user:', currentUser.email);
        setUser(currentUser);
      } catch (error) {
        console.log('[AuthContext] No valid session found');
        // No valid session, user remains null
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = (userData: User) => {
    console.log('[AuthContext] User logged in:', userData.email);
    setUser(userData);
  };

  const logout = () => {
    console.log('[AuthContext] User logged out');
    setUser(null);
  };

  // ...
}
```

**Changes**:
- ✅ Added `useEffect` hook that runs on component mount (empty dependency array)
- ✅ Calls `getCurrentUser()` from auth API service to validate session
- ✅ On success: Sets user state with returned user data
- ✅ On failure: Leaves user as `null` (no valid session)
- ✅ Changed `isLoading` initial state from `false` to `true` to show loading during check
- ✅ Sets `isLoading` to `false` in `finally` block after session check completes
- ✅ Added console logging for debugging session flow

### Authentication Flow

**Backend Session Management**:
- Sessions stored in-memory Map with 30-day expiration
- Session cookie name: `todo_session`
- Cookie settings: `httpOnly: true`, `secure: false` (dev), `sameSite: 'lax'`
- `/auth/me` endpoint validates session cookie and returns user data

**Frontend Session Restoration Flow**:
1. App loads, `AuthProvider` mounts
2. `isLoading` is `true`, preventing flash of login screen
3. `checkSession()` calls `/auth/me` endpoint
4. If valid session: Backend returns user data, frontend updates state
5. If invalid/expired: Backend returns 401, frontend keeps user as `null`
6. `isLoading` set to `false`, app renders appropriate UI

**User Experience**:
- Login → Session created → Page refresh → User remains logged in ✅
- Manual logout → Session destroyed → User signed out ✅
- Session expires (30 days) → User signed out on next page load ✅

### Technical Details

**Session Cookie Flow**:
```
[Browser] --refresh--> [React App]
                         ↓
                    [AuthContext mount]
                         ↓
                    [useEffect runs]
                         ↓
                    [GET /auth/me] --cookie: todo_session-->
                         ↓
                    [Backend validates session]
                         ↓
       [Returns user data] <--200 OK--
                         ↓
                    [setUser(currentUser)]
                         ↓
                    [User authenticated ✅]
```

**Error Handling**:
- Network errors: User stays logged out, no error shown (graceful degradation)
- Invalid session: User logged out silently
- Console logs provide debugging information

### Benefits

- ✅ **Session Persistence**: Users stay logged in across page refreshes
- ✅ **Better UX**: No unexpected logouts during normal browsing
- ✅ **Proper Loading State**: `isLoading` prevents flash of unauthenticated content
- ✅ **Graceful Degradation**: Network errors don't break the app
- ✅ **Debugging Support**: Console logs help diagnose auth issues
- ✅ **Consistent Behavior**: Matches user expectations for web applications

## Outcome

- ✅ Impact: Fixed critical authentication UX issue where users were unexpectedly signed out on page refresh. Implemented session restoration logic that validates existing sessions on app mount.
- 🧪 Tests: Manual verification required - login, refresh page, verify authentication persists; test logout functionality still works
- 📁 Files: Modified 1 file (AuthContext.tsx)
- 🔁 Next prompts: Test all authentication flows (login, logout, refresh, expired session), verify protected routes work correctly
- 🧠 Reflection: Session persistence is a fundamental UX requirement for authenticated applications. The frontend must actively check for existing sessions on mount rather than assuming no authentication. The `isLoading` state is critical to prevent flash of unauthenticated content while session validation occurs.

## Evaluation notes (flywheel)

- Failure modes observed: Initial implementation forgot to check for existing sessions on app mount, leading to unexpected logouts
- Graders run and results (PASS/FAIL): Manual testing required - user needs to verify login persists across refresh
- Prompt variant (if applicable): User reported symptom directly: "When I refresh the page, I get signed out"
- Next experiment (smallest change to try): Add visual loading indicator during session check, implement automatic token refresh before expiration for seamless long-running sessions

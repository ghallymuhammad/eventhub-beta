# Burger Menu Testing Guide

## Quick Test Steps

### 1. Test Guest Experience
1. Go to `http://localhost:3002`
2. You should see the original header with "Sign in" and "Get started" buttons
3. This confirms guest users see the normal header

### 2. Test Mock Authentication
1. Click "Sign in" or go to `http://localhost:3002/signin`
2. Select either "User" or "Organizer" role
3. Fill in any email and password (e.g., `test@example.com` / `password123`)
4. Click "Sign in as User/Organizer"
5. You should be redirected and see the burger menu header instead

### 3. Expected Burger Menu Features
When authenticated, you should see:
- **Logo** on the left
- **User info in center** with:
  - User avatar (colored circle with first letter of name)
  - User's name display
  - Role indicator ("Event Attendee" or "Event Organizer")
- **Burger menu icon** (3 lines) on the right

### 4. Test Burger Menu Navigation
1. Click the burger menu icon (≡)
2. You should see a slide-out menu with:
   - **For Users**: Browse Events, My Tickets, My Transactions, Profile Settings
   - **For Organizers**: Browse Events, Create Event, My Events, Dashboard, Profile Settings
3. Click "Sign Out" to test logout functionality

### 5. Test Role Differences
1. Sign out and sign in as different roles to see different menu options
2. User role shows "Event Attendee"
3. Organizer role shows "Event Organizer" and has different menu items

## Troubleshooting

If burger menu doesn't appear:
1. Check browser console for JavaScript errors
2. Verify you actually signed in (check sessionStorage in DevTools)
3. Check if `sessionStorage.getItem('mockUser')` has data
4. Try refreshing the page after signing in

## Mock Data Structure
The mock user data stored in sessionStorage looks like:
```json
{
  "email": "test@example.com",
  "role": "USER", // or "ORGANIZER"
  "name": "Ahmad Rahman", // or "Music Events Indonesia"
  "id": "1"
}
```

## Browser DevTools Check
1. Open DevTools (F12)
2. Go to Application/Storage tab
3. Check Session Storage → localhost:3002
4. Look for `mockUser` entry
5. If present, the burger menu should appear

This testing setup allows you to verify the burger menu functionality without needing a full database setup.

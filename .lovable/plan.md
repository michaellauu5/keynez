

# Global Navigation and Components Implementation

## Overview
Implement a complete global navigation system including an enhanced header with functioning language translation, a footer component, and a login modal with social authentication options using Supabase Auth.

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/contexts/LanguageContext.tsx` | Create | Global language state and translation functions |
| `src/translations/index.ts` | Create | Translation strings for EN, Traditional Chinese, Simplified Chinese |
| `src/components/layout/Header.tsx` | Create | New global header with language translation |
| `src/components/layout/Footer.tsx` | Create | Site-wide footer component |
| `src/components/layout/Layout.tsx` | Create | Layout wrapper with Header + Footer |
| `src/components/auth/LoginModal.tsx` | Create | Login/signup modal with social auth |
| `src/components/auth/AuthContext.tsx` | Create | Authentication state management |
| `src/hooks/useTranslation.ts` | Create | Hook for accessing translations |
| `src/pages/Index.tsx` | Modify | Use new Layout component |
| `src/pages/BuyPage.tsx` | Modify | Use new Layout component |
| `src/pages/RentPage.tsx` | Modify | Use new Layout component |
| `src/pages/ResearchCanvas.tsx` | Modify | Use new Layout component |
| `src/App.tsx` | Modify | Wrap with LanguageProvider and AuthProvider |
| `src/components/landing/Header.tsx` | Delete | Replaced by new global Header |

---

## Architecture

```text
App.tsx
  ├── LanguageProvider (language state + translations)
  │   └── AuthProvider (auth state + user session)
  │       └── Routes
  │           └── Layout (Header + Footer wrapper)
  │               ├── Header
  │               │   ├── Logo (left)
  │               │   ├── Navigation (center): Home, Buy, Rent, Sell, Research Canvas
  │               │   ├── Language Dropdown (right)
  │               │   ├── User Button / Avatar (right)
  │               │   └── Mobile Hamburger Menu
  │               ├── Page Content
  │               └── Footer
  │                   ├── Company Info
  │                   ├── Quick Links
  │                   ├── Social Icons
  │                   ├── Newsletter Signup
  │                   └── Copyright
  └── LoginModal (global, triggered from Header)
```

---

## Component Details

### 1. Language Context & Translations

**`src/contexts/LanguageContext.tsx`**

Global context managing:
- Current language state: `'en' | 'zh-HK' | 'zh-CN'`
- Translation function: `t(key: string) => string`
- Language setter: `setLanguage(lang)`
- Persists selection to localStorage

**`src/translations/index.ts`**

Translation keys organized by section:

```typescript
const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.buy": "Buy",
    "nav.rent": "Rent",
    "nav.sell": "Sell",
    "nav.research": "Research Canvas",
    
    // Auth
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.remember": "Remember me",
    "auth.forgot": "Forgot password?",
    "auth.google": "Continue with Google",
    "auth.facebook": "Continue with Facebook",
    "auth.or": "or",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    
    // Footer
    "footer.about": "About",
    "footer.contact": "Contact",
    "footer.terms": "Terms of Service",
    "footer.privacy": "Privacy Policy",
    "footer.newsletter": "Subscribe to our newsletter",
    "footer.subscribe": "Subscribe",
    "footer.copyright": "All rights reserved",
    "footer.description": "Keynest AI is Hong Kong's premier AI-powered property search platform...",
    
    // ... other sections
  },
  "zh-HK": {
    "nav.home": "首頁",
    "nav.buy": "買樓",
    "nav.rent": "租樓",
    "nav.sell": "賣樓",
    "nav.research": "研究畫板",
    // ... Traditional Chinese translations
  },
  "zh-CN": {
    "nav.home": "首页",
    "nav.buy": "买房",
    "nav.rent": "租房",
    "nav.sell": "卖房",
    "nav.research": "研究画板",
    // ... Simplified Chinese translations
  }
};
```

### 2. Global Header Component

**`src/components/layout/Header.tsx`**

Enhanced header with all features:

**Structure:**
```text
+--------------------------------------------------------------+
| [Logo]    Home  Buy  Rent  Sell  Canvas    [Lang v] [Avatar] |
+--------------------------------------------------------------+
```

**Features:**
- Sticky positioning with blur backdrop
- Logo links to home
- Active route highlighting (using `useLocation`)
- Language dropdown with flag icons
- User button showing:
  - "Login" text when logged out (opens LoginModal)
  - User avatar when logged in (dropdown with profile, settings, logout)
- Mobile hamburger menu using Sheet component
- Translations applied to all text using `useTranslation` hook

**Mobile View:**
```text
+----------------------------------+
| [Logo]              [Menu Icon]  |
+----------------------------------+
```

### 3. Footer Component

**`src/components/layout/Footer.tsx`**

Full-width footer with warm beige styling:

**Layout:**
```text
+----------------------------------------------------------------+
|  KEYNEST AI              QUICK LINKS       CONNECT WITH US     |
|  [Logo]                  - About           [FB] [IG] [TW] [LI] |
|  AI-powered property     - Contact                              |
|  search for Hong Kong    - Terms           NEWSLETTER           |
|                          - Privacy         [email input] [Sub]  |
+----------------------------------------------------------------+
|              (c) 2024 Keynest AI. All rights reserved.          |
+----------------------------------------------------------------+
```

**Sections:**
1. **Company Info**: Logo, tagline, brief description
2. **Quick Links**: About, Contact, Terms, Privacy (translated)
3. **Social Media Icons**: Facebook, Instagram, Twitter, LinkedIn
4. **Newsletter Signup**: Email input + subscribe button
5. **Copyright**: Dynamic year + company name

**Newsletter Form:**
- Email validation (using zod)
- Toast notification on submit
- Stores to localStorage (or later to Supabase)

### 4. Layout Wrapper

**`src/components/layout/Layout.tsx`**

```typescript
interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean; // Optional, defaults to true
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
```

### 5. Auth Context

**`src/components/auth/AuthContext.tsx`**

Using Supabase Auth:
- Session state management
- `onAuthStateChange` listener
- Sign in/up/out methods
- Google OAuth method
- Facebook OAuth method
- User profile state

```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

### 6. Login Modal

**`src/components/auth/LoginModal.tsx`**

Clean modal design matching Keynest AI branding:

**Features:**
- Dialog component with Keynest logo at top
- Tabs for switching between Login and Sign Up
- Email/Password form with validation:
  - Email: valid format required
  - Password: minimum 8 characters
- "Remember me" checkbox
- "Forgot password" link (triggers password reset email)
- Social login buttons:
  - Google (with Google icon)
  - Facebook (with Facebook icon)
- Form validation using react-hook-form + zod
- Loading states during authentication
- Error message display
- Success toast notifications

**Visual Design:**
```text
+------------------------------------+
|              [X Close]             |
|                                    |
|         [Keynest AI Logo]          |
|                                    |
|      [ Login ]  [ Sign Up ]        |
|                                    |
|  Email                             |
|  [________________________]        |
|                                    |
|  Password                          |
|  [________________________] [Show] |
|                                    |
|  [x] Remember me    Forgot?        |
|                                    |
|  [====== Login Button ======]      |
|                                    |
|  ─────────── or ───────────        |
|                                    |
|  [G] Continue with Google          |
|  [f] Continue with Facebook        |
|                                    |
|  Don't have an account? Sign up    |
+------------------------------------+
```

---

## Page Updates

### All Pages
Update to use the new Layout wrapper:

```typescript
// Before
import { Header } from "@/components/landing/Header";

export default function SomePage() {
  return (
    <>
      <Header />
      <main>...</main>
    </>
  );
}

// After
import { Layout } from "@/components/layout/Layout";

export default function SomePage() {
  return (
    <Layout>
      ...page content...
    </Layout>
  );
}
```

### Research Canvas
- Use Layout with `showFooter={false}` (full-screen canvas)

---

## App.tsx Wrapper Structure

```typescript
<QueryClientProvider>
  <LanguageProvider>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>...</Routes>
          <LoginModal /> {/* Global modal */}
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </LanguageProvider>
</QueryClientProvider>
```

---

## Implementation Order

1. **Create Translation System**
   - `src/translations/index.ts` with all strings
   - `src/contexts/LanguageContext.tsx`
   - `src/hooks/useTranslation.ts`

2. **Create Auth System**
   - `src/components/auth/AuthContext.tsx`
   - `src/components/auth/LoginModal.tsx`

3. **Create Layout Components**
   - `src/components/layout/Header.tsx`
   - `src/components/layout/Footer.tsx`
   - `src/components/layout/Layout.tsx`

4. **Update App.tsx**
   - Add providers
   - Add global LoginModal

5. **Update All Pages**
   - Index, BuyPage, RentPage, ResearchCanvas
   - Remove old Header imports
   - Use new Layout wrapper

6. **Clean Up**
   - Delete old `src/components/landing/Header.tsx`
   - Update any remaining imports

---

## Technical Notes

### Authentication with Supabase
- Email/password authentication uses `supabase.auth.signInWithPassword` and `supabase.auth.signUp`
- Google OAuth uses managed credentials (already configured in Lovable Cloud)
- Facebook OAuth will require user to configure Facebook App credentials through Lovable Cloud settings
- Password reset uses `supabase.auth.resetPasswordForEmail`
- Email confirmation is recommended (can be configured in Cloud settings)

### Language Persistence
- Language preference stored in localStorage as `keynest-language`
- Loaded on app initialization
- Applied across all translated components

### Newsletter Subscription
- Initially stores to localStorage
- Can be migrated to a Supabase table later for email campaigns

### Mobile Responsiveness
- Header: Hamburger menu on mobile (< 768px)
- Footer: Stacked layout on mobile
- Login Modal: Full-width on mobile, centered on desktop

---

## Styling Details

### Footer Colors
- Background: `bg-primary` (warm brown)
- Text: `text-primary-foreground` (cream)
- Links: Hover with `text-accent` (yellow)
- Input: `bg-background/10` with light border

### Social Icons
- Use Lucide React icons: Facebook, Instagram, Twitter, Linkedin
- Circular buttons with hover effect
- Size: 40x40px

### Header Active State
- Active nav link: `text-foreground font-semibold`
- Inactive: `text-muted-foreground`
- Yellow underline indicator for active route


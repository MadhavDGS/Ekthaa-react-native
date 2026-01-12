# SVG Icon Usage Map

Quick reference for developers to know which SVG icons are used in each screen.

## 📱 Screen-by-Screen Icon Map

### 🏠 HomeScreen (Dashboard)
**File**: `src/screens/Dashboard/HomeScreen.tsx`

| Location | Icon | Purpose | Color |
|----------|------|---------|-------|
| Add Shop Photo | `briefcase` | Business/company representation | Green #16a34a |
| Run Offers | `reward` | Rewards/benefits | Orange #f59e0b |
| Create Invoice | `record` | Document records | Blue #3b82f6 |
| Khata | `safe` | Financial security | Orange #f97316 |
| Inventory | `handbag` | Products/stock | Green #16a34a |

---

### 💰 KhataScreen (Financial Dashboard)
**File**: `src/screens/Dashboard/KhataScreen.tsx`

#### Today's Activity Section
| Card | Icon | Purpose | Color |
|------|------|---------|-------|
| Transactions Count | `transactionRecord` | Transaction tracking | Primary #5A9A8E |
| Credits (Money In) | `deposit` | Deposits/incoming | Red #dc2626 |
| Payments (Money Out) | `savings` | Savings/outgoing | Green #22c55e |

#### Quick Stats Section
| Card | Icon | Purpose | Color |
|------|------|---------|-------|
| Customers | `customerService` | Customer management | Primary #5A9A8E |
| Transactions | `record` | Transaction records | Purple #8b5cf6 |

---

### 📊 AnalyticsScreen (Business Reports)
**File**: `src/screens/Business/AnalyticsScreen.tsx`

#### Key Metrics Grid
| Metric | Icon | Purpose | Color |
|--------|------|---------|-------|
| Total Customers | `customerService` | Customer base | Primary #5A9A8E |
| Transactions | `transactionRecord` | Transaction volume | Green (creditGreen) |
| Products | `handbag` | Inventory count | Orange |
| Low Stock | `riskAssessment` | Stock warnings | Red (creditRed) |

---

## 🎨 Icon Color Palette

### Primary Business Colors
- **Primary Green**: `#5A9A8E` - Main brand color
- **Success Green**: `#22c55e` - Positive actions, payments
- **Warning Orange**: `#f59e0b`, `#f97316` - Attention needed
- **Error Red**: `#dc2626` - Alerts, credits owed
- **Info Blue**: `#3b82f6` - Informational actions
- **Purple**: `#8b5cf6` - Special features

### Usage Guidelines
- Use **Primary Green** for core business functions
- Use **Red** for money owed TO the business (they owe you)
- Use **Green** for money paid BY the business (you paid them)
- Use **Orange** for warnings and special offers
- Use **Blue** for informational/secondary actions

---

## 🔍 Icon Selection Guide

### When to Use Each Icon

#### Financial Operations
- `deposit` → Money coming IN (credits, receivables)
- `savings` → Money going OUT (payments, expenses)
- `transactionRecord` → General transactions, activity logs
- `safe` → Secure financial data, khata book
- `loan` → Lending, credit facilities
- `creditReport` → Financial reports, statements

#### Business Management
- `briefcase` → Business profile, shop details
- `company` → Company information
- `cooperate` → Partnerships, collaborations
- `handbag` → Products, inventory, stock

#### Customer & Sales
- `customerService` → Customer management, support
- `salesman` → Sales representatives, agents
- `reward` → Offers, promotions, loyalty
- `benefit` → Customer benefits, advantages

#### Analytics & Insights
- `dataTrends` → Charts, data visualization
- `marketAnalysis` → Business insights
- `performanceIncrease` → Growth, improvement
- `declinePerformance` → Decline, reduction
- `stockMovement` → Inventory tracking
- `riskAssessment` → Warnings, alerts
- `target` → Goals, objectives

#### UI & Actions
- `record` → Documents, invoices, records
- `notes` → Notes, comments
- `setting` → Settings, configuration
- `help` → Help, support
- `checkIn` → Check-in, attendance
- `messageCenter` → Messages, notifications

---

## 📋 Quick Copy-Paste Templates

### Basic Icon Usage
```tsx
<SvgIcon name="deposit" size={24} color="#5A9A8E" />
```

### Icon with Theme Color
```tsx
<SvgIcon name="customerService" size={24} color={Colors.primary} />
```

### Icon in Card
```tsx
<View style={[styles.iconContainer, { backgroundColor: Colors.primary + '15' }]}>
  <SvgIcon name="transactionRecord" size={24} color={Colors.primary} />
</View>
```

### Icon with Custom Background
```tsx
<View style={[styles.iconCircle, { backgroundColor: '#dc2626' }]}>
  <SvgIcon name="deposit" size={16} color="#fff" />
</View>
```

---

## 🚀 Upcoming Screens

### Planned Icon Integrations

#### ProfileScreen
- `setting` → Settings option
- `help` → Help center
- `verified` → Account verification badge
- `passwordManagement` → Security settings

#### MoreScreen (Menu)
- `customerService` → Customers
- `transactionRecord` → Transactions  
- `dataTrends` → Analytics
- `setting` → Settings
- `help` → Help & Support

#### ProductsScreen
- `handbag` → Product categories
- `stockMovement` → Stock status
- `target` → Featured products
- `performanceIncrease` → Best sellers

#### CustomerDetailsScreen
- `customerService` → Customer info header
- `transactionRecord` → Transaction history
- `notes` → Customer notes
- `verified` → Verified customer badge

#### InvoiceScreen
- `record` → Invoice list
- `financialSecurity` → Paid invoices
- `riskAssessment` → Pending invoices

---

## 🎯 Icon Sizing Standards

### Size Guidelines
- **16px** - Small icons in badges, chips, mini stats
- **24px** - Standard icons in cards, buttons, lists
- **32px** - Large icons in featured actions, headers
- **48px** - Hero icons, empty states

### Example by Context
```tsx
// Badge/Chip
<SvgIcon name="verified" size={16} color={Colors.primary} />

// Card/Button
<SvgIcon name="deposit" size={24} color={Colors.primary} />

// Quick Action
<SvgIcon name="briefcase" size={32} color="#16a34a" />

// Empty State
<SvgIcon name="customerService" size={48} color={Colors.textTertiary} />
```

---

## 🔄 Icon Replacement History

### Icons Replaced with SVG

| Screen | Old (Ionicons) | New (SVG) | Reason |
|--------|---------------|-----------|---------|
| KhataScreen | swap-horizontal | transactionRecord | More specific |
| KhataScreen | arrow-down | deposit | Better context |
| KhataScreen | arrow-up | savings | Better context |
| KhataScreen | people | customerService | Professional |
| KhataScreen | receipt | record | Consistent |
| HomeScreen | camera | briefcase | Business focus |
| HomeScreen | megaphone | reward | Feature-specific |
| HomeScreen | document-text | record | Unified |
| HomeScreen | wallet | safe | Security emphasis |
| HomeScreen | cube | handbag | Better visual |
| AnalyticsScreen | people | customerService | Professional |
| AnalyticsScreen | receipt | transactionRecord | Accurate |
| AnalyticsScreen | cube | handbag | Consistent |
| AnalyticsScreen | alert-circle | riskAssessment | Contextual |

---

## 💡 Tips & Best Practices

### Do's ✅
- Use semantic icon names that match the function
- Maintain consistent sizing within similar contexts
- Match icon colors to theme colors
- Use financial icons for money-related features
- Use business icons for company/shop features
- Test on both light and dark themes

### Don'ts ❌
- Don't use random icons without context
- Don't mix icon sizes in the same grid
- Don't use colors that clash with theme
- Don't force SVG where Ionicons work better
- Don't over-use the same icon in different contexts

### Icon Selection Checklist
1. Is there a specific SVG icon for this? → Use SVG
2. Is it a financial operation? → Use financial category
3. Is it customer-related? → Use customer/sales category
4. Is it analytics/reporting? → Use analytics category
5. Is it a generic UI element? → Consider Ionicons

---

*Last Updated: January 2026*
*Total Icons Integrated: 15 across 3 screens*
*Available Icons: 41 in library*

# Submit Bug/Task/Feature Feature

## Overview
This feature allows users to submit bugs, tasks, and features through a comprehensive popup form. The implementation follows the project's existing architecture and design patterns.

## Features

### 1. Type Selection
- **Bug**: For reporting issues and problems
- **Task**: For general tasks and work items
- **Feature**: For new feature requests
- Visual indicators with icons and colors for each type

### 2. Form Fields

#### Left Side - Type Selection
- Three toggle buttons for Bug, Task, and Feature
- Each button has an icon and color-coded styling
- Active state shows blue background and border

#### Right Side - Due Date
- Calendar input with date picker
- Minimum date set to today
- Required field with validation

#### Title and Description
- **Title**: Text input for brief description
- **Description**: Resizable textarea for detailed information
- Both fields are required with validation

#### Module, Priority, and Assigned To (3-column layout)
- **Module**: Dynamic input with add/remove functionality
  - Users can type and add custom modules
  - Modules display as removable tags
  - At least one module required
- **Priority**: Dropdown with Critical, High, Medium, Low
- **Assigned To**: Dropdown with available users and roles

#### Raised By and Monitored By (2-column layout)
- **Raised By**: Dropdown to select who raised the item
- **Monitored By**: Dropdown to select who monitors the item
- Both fields are required with validation

### 3. Validation
- All required fields are validated
- Error messages display below each field
- Form submission is prevented until all validations pass
- Real-time error clearing when user starts typing

### 4. Integration

#### API Integration
- `src/api/items.api.ts`: Handles all CRUD operations
- `createItem()`: Creates new bugs, tasks, or features
- `getItems()`: Retrieves items with optional project filtering
- `updateItem()`: Updates existing items
- `deleteItem()`: Deletes items
- `getItemsByType()`: Filters items by type

#### State Management
- `src/store/itemsAtom.ts`: Jotai-based state management
- `useItemsAtom()`: Hook for managing items state
- Local state updates for immediate UI feedback

#### UI Components
- `src/components/Dashboard/SubmitItemPopup.tsx`: Main popup component
- `src/components/Common/Notification.tsx`: Success/error notifications
- Integrated with existing dashboard layout

### 5. Navigation Integration
- New "Submit Bug" tab in dashboard navigation
- Icons for all navigation tabs (Dashboard, Submit Bug, Kanban Board)
- Consistent styling with existing design

### 6. User Experience
- **Modal Popup**: Overlay with backdrop blur
- **Responsive Design**: Works on all screen sizes
- **Keyboard Support**: Enter key to add modules
- **Loading States**: Visual feedback during submission
- **Notifications**: Success/error messages with auto-dismiss
- **Form Reset**: Clears form after successful submission

## Technical Implementation

### File Structure
```
src/
├── components/
│   ├── Dashboard/
│   │   └── SubmitItemPopup.tsx
│   └── Common/
│       └── Notification.tsx
├── api/
│   └── items.api.ts
├── store/
│   └── itemsAtom.ts
└── app/
    └── dashboard/
        └── page.tsx (updated)
```

### Data Flow
1. User clicks "Submit New Item" button
2. Popup opens with form
3. User fills out form with validation
4. On submit, API call is made
5. Success/error notification is shown
6. Form resets and popup closes
7. Item is added to local state

### TypeScript Interfaces
```typescript
interface SubmitItemData {
  type: "bug" | "task" | "feature";
  title: string;
  description: string;
  modules: string[];
  priority: "critical" | "high" | "medium" | "low";
  assignedTo: string;
  raisedBy: string;
  monitoredBy: string;
  dueDate: string;
}

interface ItemData extends SubmitItemData {
  projectId?: string;
  companyId?: string;
  status?: "todo" | "in-progress" | "review" | "done";
  createdAt?: Date;
  updatedAt?: Date;
}
```

## Usage

### Accessing the Feature
1. Navigate to the dashboard
2. Click on the "Submit Bug" tab
3. Click "Submit New Item" button
4. Fill out the form
5. Click "Submit [Type]" button

### Form Guidelines
- **Type**: Choose between Bug, Task, or Feature
- **Due Date**: Set a deadline (required)
- **Title**: Brief, descriptive title (required)
- **Description**: Detailed explanation (required)
- **Module**: Add relevant modules (at least one required)
- **Priority**: Set urgency level
- **Assigned To**: Select responsible person (required)
- **Raised By**: Select who reported it (required)
- **Monitored By**: Select who oversees it (required)

## Future Enhancements
- AI-powered categorization and prioritization
- File attachments for screenshots/logs
- Template system for common bug types
- Integration with external issue trackers
- Advanced filtering and search
- Bulk operations for multiple items
- Email notifications for assigned items 
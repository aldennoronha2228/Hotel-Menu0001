# QR Code Restaurant Ordering System - Technical Documentation

## Project Overview
A comprehensive, full-stack web application designed to digitize restaurant operations. This system enables customers to order directly from their tables via QR codes and provides restaurant owners with a real-time dashboard to manage orders, track table availability via an interactive floor plan, and update menu items dynamically.

## Technical Architecture

### 1. Technology Stack
*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router Architecture)
*   **Language**: TypeScript (Strongly typed for robustness)
*   **Frontend Library**: React 19 (Server & Client Components)
*   **Styling**: Custom CSS & Utility Classes (Responsive, Mobile-First Design)
*   **Database**: Supabase (PostgreSQL)
*   **Authentication**: Clerk (Identity Management) + Custom Role-Based Access Control (RBAC)
*   **Deployment**: Vercel (Edge Network)

### 2. Core Features & User Flow

#### A. Customer Experience (No App Required)
1.  **QR Entry**: Customers scan a unique QR code on their table (e.g., `.../menu/rest001?table=5`).
2.  **Dynamic Menu**: The app fetches `menu_items` from Supabase, filtering by `available=true` status.
3.  **Cart Management**: Local state management allows users to modify quantities and calculating totals client-side.
4.  **Order Submission**:
    *   Customer confirms order.
    *   `POST /api/orders` request is sent with `tableNumber`, `items`, and `total`.
    *   System validates the payload and creates a record in the `orders` table with status `'new'`.

#### B. Admin / Kitchen Dashboard (Real-Time)
1.  **Authentication**: Secure login via Clerk. The system verifies the user's email against a whitelist (`OWNER_EMAIL`) to grant Admin privileges.
2.  **Live Order Feed**:
    *   The dashboard polls `/api/orders` (optimized interval) to fetch active orders.
    *   **Status Workflow**: `New` ➝ `Preparing` ➝ `Done` (Served) ➝ `Paid`.
3.  **Interactive Floor Plan**:
    *   visual map of the restaurant layout.
    *   **Logic**: Tables change color (Red/Yellow/White) based on real-time order status.
    *   **Drag & Drop**: Admins can customize the floor plan layout (saved to `localStorage`).
4.  **Menu Management**:
    *   Admin interface to Add/Edit/Delete food items.
    *   Updates reflect instantly for all customers.

### 3. Database Schema (PostgreSQL)

The application uses a relational schema optimized for integrity and speed.

*   **`menu_items`**
    *   `id` (UUID): Primary Key
    *   `name`, `price`, `description`: Item details
    *   `category_id`: Foreign Key
    *   `available`: Boolean (Toggle for out-of-stock items)
*   **`orders`**
    *   `id` (UUID): Primary Key
    *   `table_number`: Integer (Indexed for fast lookups)
    *   `status`: ENUM (`new`, `preparing`, `done`, `paid`, `cancelled`)
    *   `created_at`: Timestamp (Used for sorting)
*   **`order_items`**
    *   Junction table linking `orders` and `menu_items` to store snapshots of items ordered.

### 4. Key Technical Implementation Details

*   **API Route Security**:
    *   Custom middleware ensures that sensitive routes (DELETE/UPDATE menu) are only accessible by the specified Owner Email.
    *   RLS (Row Level Security) policies on Supabase prevent unauthorized database tampering.
*   **State Synchronization**:
    *   **Controlled Components**: The Floor Plan uses a controlled component pattern to sync visual layout state with the detailed configuration (e.g., number of tables).
    *   **Race Condition Handling**: Implemented logic to prevent state lag when updating configuration settings.
*   **Error Handling**:
    *   Graceful degradation: If the database is unreachable, the UI shows friendly toast notifications.
    *   Form validation: Prevents submission of empty orders or negative quantities.

### 5. Deployment Parameters
*   **Environment Variables**:
    *   `NEXT_PUBLIC_SUPABASE_URL`: DB Connection
    *   `SUPABASE_SERVICE_ROLE_KEY`: Admin privileges for server-side operations
    *   `OWNER_EMAIL`: Authorization whitelist (supports multiple owners)
    *   `CLERK_SECRET_KEY`: Auth handshake

---
*This project demonstrates proficiency in building scalable Full-Stack applications, managing complex state in React, designing relational databases, and implementing secure authentication workflows.*

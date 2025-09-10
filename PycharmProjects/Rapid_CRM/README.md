# Rapid CRM

A modern, best-in-class **Transportation & Logistics CRM** system built with React, TypeScript, and Tailwind CSS. Rapid CRM provides a comprehensive platform specifically designed for transportation companies, carriers, brokers, and freight forwarders to manage their business operations, compliance, and customer relationships.

## 🚀 Features

### Core CRM Modules
- **Dashboard** - Centralized overview with transportation-specific metrics
- **Contacts** - Person management with ownership details and preferred contact methods
- **Companies** - Comprehensive organization profiles with transportation business details
- **Deals** - Sales pipeline management for transportation services
- **Invoices** - Invoice creation, management, and payment tracking
- **Tasks** - Task management with priorities and due dates
- **Integrations** - Extensible integration system with accounting and business tools
- **Users** - User management with role-based permissions
- **Reports** - Advanced analytics and reporting capabilities

### Transportation-Specific Features
- **USDOT Number Management** - Track and manage USDOT numbers
- **Fleet Information** - Vehicle types, drivers, and fleet management
- **Cargo & Safety** - Hazmat compliance and cargo type tracking
- **Regulatory Compliance** - DOT compliance tracking and management
- **Business Classification** - Carrier, Broker, and Freight Forwarder support
- **State Operations** - Multi-state operation tracking
- **Physical & Mailing Addresses** - Separate address management
- **Business Structure** - Legal entity types and EIN management

### Advanced Features
- **Global Search** - Search across all data types with keyboard shortcuts
- **Role-Based Security** - Granular permissions and admin recovery system
- **Modern UI/UX** - Responsive design with dark/light mode
- **Real-time Updates** - Live data synchronization
- **Mobile Responsive** - Optimized for all device sizes

### Technical Features
- ⚡ **Fast Performance** - Built with Vite for lightning-fast development and builds
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 🌙 **Dark Mode** - Built-in theme switching with smooth transitions
- 📱 **Mobile Responsive** - Optimized for all device sizes
- 🔄 **Real-time Updates** - Powered by React Query for efficient data management
- 🧩 **Modular Architecture** - Lazy-loaded modules for optimal performance
- 🔧 **TypeScript** - Full type safety and better developer experience

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4.x
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Icons**: Heroicons
- **Notifications**: React Hot Toast
- **Database**: SQLite (rapid_crm.db)
- **Security**: Role-based permissions with admin recovery
- **Search**: Global search with keyboard shortcuts

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/StamperDavid/rapid_crm.git
   cd rapid_crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the application.

## 🧭 Navigation & Routes

The CRM uses a modern, direct navigation structure similar to HubSpot and Salesforce:

### Main Navigation Routes
- `/` - Dashboard (overview and metrics)
- `/contacts` - Contact management
- `/companies` - Company management  
- `/deals` - Sales pipeline and deal tracking
- `/invoices` - Invoice management and payment tracking
- `/tasks` - Task management with priorities
- `/integrations` - Business tool integrations
- `/users` - User management (admin only)
- `/reports` - Analytics and reporting

### Key Features
- **Global Search**: Press `/` to search across all data types
- **Role-Based Access**: Different permissions for admin, manager, and user roles
- **Admin Recovery**: Emergency access system for account recovery

## 📜 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm test` - Run tests (currently not implemented)

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main application layout
│   ├── LoadingSpinner.tsx
│   ├── Logo.tsx
│   ├── SchemaEditor.tsx
│   └── SchemaViewer.tsx
├── contexts/           # React contexts
│   └── ThemeContext.tsx
├── modules/            # Feature modules
│   ├── Analytics/
│   ├── Compliance/
│   ├── CRM/
│   │   └── pages/     # CRM-specific pages
│   ├── Dashboard/
│   └── SystemMonitoring/
├── pages/              # Top-level pages
│   ├── DataManagement.tsx
│   └── SchemaManagement.tsx
├── App.tsx            # Main application component
├── index.tsx          # Application entry point
└── index.css          # Global styles
```

## 🎨 Theming

The application supports both light and dark themes with a toggle button in the bottom-right corner. The theme preference is managed through React Context and persists across sessions.

## 📊 Database

The application uses SQLite for data persistence. The database file (`rapid_crm.db`) is located in the `instance/` directory.

## 🔧 Configuration

### Vite Configuration
- Development server runs on port 3000
- Auto-opens browser on startup
- Hot module replacement enabled

### TypeScript Configuration
- Strict mode enabled
- ES2020 target
- React JSX transform
- Path resolution configured for clean imports

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Preview the build**
   ```bash
   npm run preview
   ```

3. **Deploy the `dist/` folder** to your preferred hosting platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Rapid CRM** - Streamlining customer relationships with modern technology.

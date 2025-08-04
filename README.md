# Finance Tracker Frontend

A modern, responsive personal finance management application built with Next.js 14, TypeScript, and Tailwind CSS. Track your expenses, manage budgets, set financial goals, and generate insightful reports with a beautiful, user-friendly interface.

## 🚀 Features

- **💳 Transaction Management** - Add, edit, and categorize your income and expenses
- **📊 Budget Planning** - Create and monitor budgets for different categories
- **🎯 Financial Goals** - Set and track progress towards your financial objectives
- **📈 Reports & Analytics** - Visualize your financial data with interactive charts
- **🌙 Dark Mode Support** - Toggle between light and dark themes
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **🔐 User Authentication** - Secure login and registration system
- **⚡ Fast Performance** - Built with Next.js 14 for optimal speed

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

## 📦 Installation

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm package manager

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ranugasenadeera/financeTracker-frontend.git
   cd financeTracker-frontend
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install

   # Using yarn
   yarn install

   # Using pnpm (recommended)
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update the `.env.local` file with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=your_backend_api_url
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   # Using npm
   npm run dev

   # Using yarn
   yarn dev

   # Using pnpm
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🗂️ Project Structure

```
financeTracker-frontend/
├── app/                    # Next.js 14 App Router
│   ├── budgets/           # Budget management pages
│   ├── dashboard/         # Main dashboard
│   ├── goals/             # Financial goals pages
│   ├── reports/           # Analytics and reports
│   ├── transactions/      # Transaction management
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home/landing page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── navbar.tsx        # Navigation component
│   └── theme-provider.tsx # Theme management
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
├── styles/               # Additional stylesheets
└── types/                # TypeScript type definitions
```

## 🚦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components built on top of [Radix UI](https://www.radix-ui.com/). All components are:

- ✅ Fully accessible
- ✅ Customizable with Tailwind CSS
- ✅ Dark mode compatible
- ✅ Type-safe with TypeScript

### Key Components Used

- **Forms**: Input, Label, Button, Select, Checkbox
- **Layout**: Card, Tabs, Separator, Sheet, Sidebar
- **Feedback**: Alert, Toast, Dialog, Progress
- **Data Display**: Table, Badge, Avatar, Calendar
- **Navigation**: Navigation Menu, Dropdown Menu, Breadcrumb

## 📊 Features Overview

### Dashboard
- Financial overview with key metrics
- Recent transactions
- Budget progress indicators
- Quick action buttons

### Transactions
- Add, edit, and delete transactions
- Category-based organization
- Search and filter functionality
- Bulk operations support

### Budgets
- Create monthly/yearly budgets
- Track spending vs. budget limits
- Visual progress indicators
- Category-wise budget breakdown

### Goals
- Set financial targets
- Track progress over time
- Milestone celebrations
- Goal categories (savings, debt reduction, etc.)

### Reports
- Interactive charts and graphs
- Spending patterns analysis
- Income vs. expense trends
- Exportable reports

## 🌐 API Integration

This frontend is designed to work with a RESTful API backend. Configure your API endpoints in the environment variables:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

Expected API endpoints:
- `GET /transactions` - Fetch transactions
- `POST /transactions` - Create transaction
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction
- `GET /budgets` - Fetch budgets
- `POST /budgets` - Create budget
- Similar patterns for goals and reports

## 🔧 Configuration

### Tailwind CSS
The project uses a custom Tailwind configuration with:
- Custom color scheme
- Extended spacing scale
- Custom animations
- Dark mode support

### TypeScript
Strict TypeScript configuration for better code quality and developer experience.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

If you have any questions or need help with setup, please:

1. Check the [documentation](https://github.com/ranugasenadeera/financeTracker-frontend/wiki)
2. Search existing [issues](https://github.com/ranugasenadeera/financeTracker-frontend/issues)
3. Create a new issue if needed

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide](https://lucide.dev/) for the icon set

---

**Made with ❤️ by [Ranuga Senadeera](https://github.com/ranugasenadeera)**

import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PropertyListingPage from './pages/PropertyListingPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import PostPropertyPage from './pages/PostPropertyPage';
import EditPropertyPage from './pages/EditPropertyPage';
import WishlistPage from './pages/WishlistPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminListingsPage from './pages/AdminListingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminApprovalsPage from './pages/AdminApprovalsPage';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <Toaster richColors position="top-right" />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const propertiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/properties',
  component: PropertyListingPage,
});

const propertyDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/properties/$id',
  component: PropertyDetailPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: UserDashboard,
});

const postPropertyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/post-property',
  component: PostPropertyPage,
});

const editPropertyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/edit-property/$id',
  component: EditPropertyPage,
});

const wishlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wishlist',
  component: WishlistPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboard,
});

const adminListingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/listings',
  component: AdminListingsPage,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  component: AdminUsersPage,
});

const adminApprovalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/approvals',
  component: AdminApprovalsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  propertiesRoute,
  propertyDetailRoute,
  loginRoute,
  dashboardRoute,
  postPropertyRoute,
  editPropertyRoute,
  wishlistRoute,
  adminRoute,
  adminListingsRoute,
  adminUsersRoute,
  adminApprovalsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

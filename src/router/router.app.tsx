import { createBrowserRouter, Navigate } from 'react-router'

import { PublicLayout } from '@/landing/layouts/PublicLayout'
import { HomePage } from '@/landing/pages/HomePage'
import { EventsPage } from '@/events/pages/EventsPage'
import { HistoryPage } from '@/institutional/pages/HistoryPage'
import { InstitutionalPage } from '@/institutional/pages/InstitutionalPage'
import { GalleryPage } from '@/gallery/pages/GalleryPage'
import { ContactPage } from '@/contact/pages/ContactPage'
import { ValidateCredentialPage } from '@/members/pages/ValidateCredentialPage'
import { MemberLayout } from '@/members/layouts/MemberLayout'
import { AccountPage } from '@/members/pages/AccountPage'
import { CredentialPage } from '@/members/pages/CredentialPage'
import { ProfilePage } from '@/members/pages/ProfilePage'
import { MyPaymentsPage } from '@/payments/pages/MyPaymentsPage'
import { AuthLayout } from '@/auth/layouts/AuthLayout'
import { LoginPage } from '@/auth/pages/login/LoginPage'
import { RegisterPage } from '@/auth/pages/register/RegisterPage'
import { ForgotPasswordPage } from '@/auth/pages/recovery/ForgotPasswordPage'
import { ResetPasswordPage } from '@/auth/pages/reset-password/ResetPasswordPage'
import { VerifyEmailPage } from '@/auth/pages/verify/VerifyEmailPage'
import { ConfirmEmailChangePage } from '@/auth/pages/verify/ConfirmEmailChangePage'
import { AuthCallbackPage } from '@/auth/pages/callback/AuthCallbackPage'
import { NotFoundPage } from '@/shared/pages/NotFoundPage'
import { AdminLayout } from '@/admin/layouts/AdminLayout'
import { AdminIndex } from '@/admin/pages/AdminIndex'
import { MembersListPage } from '@/admin/pages/MembersListPage'
import { MemberDetailPage } from '@/admin/pages/MemberDetailPage'
import { PaymentsPage } from '@/admin/pages/PaymentsPage'
import { StaffPage } from '@/admin/pages/StaffPage'
import { AuditPage } from '@/admin/pages/AuditPage'
import { AdminEventsPage } from '@/admin/pages/AdminEventsPage'
import { AdminGalleryPage } from '@/admin/pages/AdminGalleryPage'
import { AdminInstitutionalPage } from '@/admin/pages/AdminInstitutionalPage'
import { Roles, STAFF_ROLES } from '@/constants/roles'

import { AuthenticatedRoutes, NotAuthenticatedRoutes, RoleRoutes } from './routes/ProtectedRoutes'

// TODO(optimización): importar las páginas del portal de socio y del admin con
// React.lazy + <Suspense> para que quien solo visita el sitio institucional no se
// baje el código de los paneles.
export const appRouter = createBrowserRouter([
    // ----------------------------------------------------------------- Público
    {
        path: '/',
        element: <PublicLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'eventos', element: <EventsPage /> },
            { path: 'historia', element: <HistoryPage /> },
            { path: 'institucional', element: <InstitutionalPage /> },
            { path: 'galeria', element: <GalleryPage /> },
            { path: 'contacto', element: <ContactPage /> },
            // Pantalla de puerta: la abre quien escanea el QR de una credencial.
            { path: 'validar/:token', element: <ValidateCredentialPage /> },
        ],
    },

    // -------------------------------------------------------------------- Auth
    // Solo para quien no tiene sesión: si ya entró, lo mandamos a su home.
    {
        element: (
            <NotAuthenticatedRoutes>
                <AuthLayout />
            </NotAuthenticatedRoutes>
        ),
        children: [
            { path: '/ingresar', element: <LoginPage /> },
            { path: '/asociarse', element: <RegisterPage /> },
            { path: '/recuperar-clave', element: <ForgotPasswordPage /> },
        ],
    },

    // Aterrizajes de los links que se mandan por mail. Van SIN el guard de
    // "no autenticado" a propósito: si alguien con sesión abierta hace clic en el
    // link, el guard lo redirigiría y el token quedaría sin consumir. Los paths los
    // fija mail.service.ts en el backend — no se pueden renombrar de un solo lado.
    {
        element: <AuthLayout />,
        children: [
            { path: '/verificar-email', element: <VerifyEmailPage /> },
            { path: '/reset-password', element: <ResetPasswordPage /> },
            { path: '/confirmar-email', element: <ConfirmEmailChangePage /> },
        ],
    },

    // Vuelta del login con Google: la sesión ya viene creada por el backend.
    { path: '/auth/callback', element: <AuthCallbackPage /> },

    // ------------------------------------------------------------ Portal socio
    // Alcanza con tener sesión: cualquier usuario del portal tiene perfil de socio
    // (incluidos los admins, que también son socios del club).
    {
        path: '/mi-cuenta',
        element: (
            <AuthenticatedRoutes>
                <MemberLayout />
            </AuthenticatedRoutes>
        ),
        children: [
            { index: true, element: <AccountPage /> },
            { path: 'credencial', element: <CredentialPage /> },
            { path: 'pagos', element: <MyPaymentsPage /> },
            { path: 'perfil', element: <ProfilePage /> },
        ],
    },

    // ------------------------------------------------------------ Panel admin
    // El portón de entrada exige cualquier rol de staff; cada RoleRoutes de adentro
    // vuelve a filtrar por el rol puntual de la sección (tesorería solo pagos, etc.).
    {
        path: '/admin',
        element: (
            <RoleRoutes allowed={STAFF_ROLES}>
                <AdminLayout />
            </RoleRoutes>
        ),
        children: [
            {
                // Sin RoleRoutes: cualquier staff puede entrar y AdminIndex decide
                // (dashboard para admin/tesorería, o redirect a su primera sección).
                index: true,
                element: <AdminIndex />,
            },
            {
                path: 'socios',
                element: (
                    <RoleRoutes allowed={[Roles.ADMIN]}>
                        <MembersListPage />
                    </RoleRoutes>
                ),
            },
            {
                path: 'socios/:id',
                element: (
                    <RoleRoutes allowed={[Roles.ADMIN]}>
                        <MemberDetailPage />
                    </RoleRoutes>
                ),
            },
            {
                path: 'pagos',
                element: (
                    <RoleRoutes allowed={[Roles.ADMIN, Roles.ACCOUNTANT]}>
                        <PaymentsPage />
                    </RoleRoutes>
                ),
            },
            {
                path: 'eventos',
                element: (
                    <RoleRoutes allowed={[Roles.ADMIN, Roles.WEB_ADMIN]}>
                        <AdminEventsPage />
                    </RoleRoutes>
                ),
            },
            {
                path: 'galeria',
                element: (
                    <RoleRoutes allowed={[Roles.ADMIN, Roles.WEB_ADMIN]}>
                        <AdminGalleryPage />
                    </RoleRoutes>
                ),
            },
            {
                path: 'institucional',
                element: (
                    <RoleRoutes allowed={[Roles.ADMIN, Roles.WEB_ADMIN]}>
                        <AdminInstitutionalPage />
                    </RoleRoutes>
                ),
            },
            {
                path: 'staff',
                element: (
                    <RoleRoutes allowed={[Roles.ADMIN]}>
                        <StaffPage />
                    </RoleRoutes>
                ),
            },
            {
                path: 'auditoria',
                element: (
                    <RoleRoutes allowed={[Roles.ADMIN]}>
                        <AuditPage />
                    </RoleRoutes>
                ),
            },
        ],
    },

    { path: '/404', element: <NotFoundPage /> },
    { path: '*', element: <Navigate to="/404" replace /> },
])

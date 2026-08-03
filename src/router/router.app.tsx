import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router'

import { PageLoader } from '@/components/custom/PageLoader'

// Sitio público: es la puerta de entrada de cualquier visitante, va en el bundle
// inicial.
import { PublicLayout } from '@/landing/layouts/PublicLayout'
import { HomePage } from '@/landing/pages/HomePage'
import { EventsPage } from '@/events/pages/EventsPage'
import { HistoryPage } from '@/institutional/pages/HistoryPage'
import { InstitutionalPage } from '@/institutional/pages/InstitutionalPage'
import { GalleryPage } from '@/gallery/pages/GalleryPage'
import { NotFoundPage } from '@/shared/pages/NotFoundPage'
import { RouteErrorPage } from '@/shared/pages/RouteErrorPage'

// Los layouts privados son solo el marco (sidebar + topbar) y pesan poco: van
// eager a propósito. Si fueran lazy, entrar a una sección encadenaría dos
// descargas (marco y después página); así el marco aparece al instante y solo
// la página de adentro espera su código.
import { AuthLayout } from '@/auth/layouts/AuthLayout'
import { MemberLayout } from '@/members/layouts/MemberLayout'
import { AdminLayout } from '@/admin/layouts/AdminLayout'

import { DOOR_ROLES, Roles, STAFF_ROLES } from '@/constants/roles'
import { AuthenticatedRoutes, NotAuthenticatedRoutes, RoleRoutes } from './routes/ProtectedRoutes'

// A partir de acá todo se baja bajo demanda: quien solo mira el sitio
// institucional no descarga los paneles. El fallback mientras llega cada chunk
// lo pone el <Suspense> que cada layout tiene alrededor de su <Outlet />.

// Formulario de contacto: es la única página pública con react-hook-form + zod,
// así que separarla saca esas dos libs del bundle inicial.
const ContactPage = lazy(async () => ({
    default: (await import('@/contact/pages/ContactPage')).ContactPage,
}))

const LoginPage = lazy(async () => ({
    default: (await import('@/auth/pages/login/LoginPage')).LoginPage,
}))
const RegisterPage = lazy(async () => ({
    default: (await import('@/auth/pages/register/RegisterPage')).RegisterPage,
}))
const ForgotPasswordPage = lazy(async () => ({
    default: (await import('@/auth/pages/recovery/ForgotPasswordPage')).ForgotPasswordPage,
}))
const ResetPasswordPage = lazy(async () => ({
    default: (await import('@/auth/pages/reset-password/ResetPasswordPage')).ResetPasswordPage,
}))
const VerifyEmailPage = lazy(async () => ({
    default: (await import('@/auth/pages/verify/VerifyEmailPage')).VerifyEmailPage,
}))
const ConfirmEmailChangePage = lazy(async () => ({
    default: (await import('@/auth/pages/verify/ConfirmEmailChangePage')).ConfirmEmailChangePage,
}))
const AuthCallbackPage = lazy(async () => ({
    default: (await import('@/auth/pages/callback/AuthCallbackPage')).AuthCallbackPage,
}))

// Puerta. El escáner arrastra `qr-scanner`, que no tiene por qué viajar con el
// resto de la app: lo baja solo quien controla el acceso.
const DoorScannerPage = lazy(async () => ({
    default: (await import('@/members/pages/DoorScannerPage')).DoorScannerPage,
}))
const ValidateCredentialPage = lazy(async () => ({
    default: (await import('@/members/pages/ValidateCredentialPage')).ValidateCredentialPage,
}))

const AccountPage = lazy(async () => ({
    default: (await import('@/members/pages/AccountPage')).AccountPage,
}))
// CredentialPage arrastra `qrcode` para dibujar el código en pantalla.
const CredentialPage = lazy(async () => ({
    default: (await import('@/members/pages/CredentialPage')).CredentialPage,
}))
const ProfilePage = lazy(async () => ({
    default: (await import('@/members/pages/ProfilePage')).ProfilePage,
}))
const MyPaymentsPage = lazy(async () => ({
    default: (await import('@/payments/pages/MyPaymentsPage')).MyPaymentsPage,
}))

const AdminIndex = lazy(async () => ({
    default: (await import('@/admin/pages/AdminIndex')).AdminIndex,
}))
const MembersListPage = lazy(async () => ({
    default: (await import('@/admin/pages/MembersListPage')).MembersListPage,
}))
const MemberDetailPage = lazy(async () => ({
    default: (await import('@/admin/pages/MemberDetailPage')).MemberDetailPage,
}))
const PaymentsPage = lazy(async () => ({
    default: (await import('@/admin/pages/PaymentsPage')).PaymentsPage,
}))
const StaffPage = lazy(async () => ({
    default: (await import('@/admin/pages/StaffPage')).StaffPage,
}))
const AuditPage = lazy(async () => ({
    default: (await import('@/admin/pages/AuditPage')).AuditPage,
}))
const AdminEventsPage = lazy(async () => ({
    default: (await import('@/admin/pages/AdminEventsPage')).AdminEventsPage,
}))
const AdminGalleryPage = lazy(async () => ({
    default: (await import('@/admin/pages/AdminGalleryPage')).AdminGalleryPage,
}))
const AdminInstitutionalPage = lazy(async () => ({
    default: (await import('@/admin/pages/AdminInstitutionalPage')).AdminInstitutionalPage,
}))

export const appRouter = createBrowserRouter([
    // ----------------------------------------------------------------- Público
    {
        path: '/',
        element: <PublicLayout />,
        // Con code splitting aparece un modo de falla nuevo: el chunk de una
        // página no baja (típicamente por un deploy con la pestaña abierta).
        // Sin esto, react-router muestra su pantalla de error cruda.
        errorElement: <RouteErrorPage />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'eventos', element: <EventsPage /> },
            { path: 'historia', element: <HistoryPage /> },
            { path: 'institucional', element: <InstitutionalPage /> },
            { path: 'galeria', element: <GalleryPage /> },
            { path: 'contacto', element: <ContactPage /> },
        ],
    },

    // ------------------------------------------------------------ Puerta
    // Control de acceso. Dejó de ser público: antes alcanzaba con tener el link
    // para consultar en vivo la foto y el estado de cuota de un socio, para
    // siempre. Ahora exige sesión de staff — el rol `reception` existe para no
    // tener que darle una cuenta de tesorería a quien atiende la entrada.
    //
    // Sin layout: es una pantalla de una sola cosa, para usar parado en la
    // puerta. El guard resuelve el 401 (manda al login recordando a dónde iba)
    // y el 403 (a un socio lo devuelve a su home).
    {
        element: (
            <RoleRoutes allowed={DOOR_ROLES}>
                <Suspense fallback={<PageLoader />}>
                    <Outlet />
                </Suspense>
            </RoleRoutes>
        ),
        errorElement: <RouteErrorPage />,
        children: [
            { path: '/puerta', element: <DoorScannerPage /> },
            // A esta cae también quien escanea el QR con la cámara nativa del
            // celular: el código impreso contiene esta URL.
            { path: '/validar/:token', element: <ValidateCredentialPage /> },
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
        errorElement: <RouteErrorPage />,
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
        errorElement: <RouteErrorPage />,
        children: [
            { path: '/verificar-email', element: <VerifyEmailPage /> },
            { path: '/reset-password', element: <ResetPasswordPage /> },
            { path: '/confirmar-email', element: <ConfirmEmailChangePage /> },
        ],
    },

    // Vuelta del login con Google: la sesión ya viene creada por el backend.
    // No cuelga de ningún layout, así que lleva su propio <Suspense>. El fallback
    // es el mismo PageLoader que la página renderiza, o sea que la espera del
    // chunk y la de la verificación de sesión se ven igual: sin parpadeo.
    {
        path: '/auth/callback',
        element: (
            <Suspense fallback={<PageLoader />}>
                <AuthCallbackPage />
            </Suspense>
        ),
        errorElement: <RouteErrorPage />,
    },

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
        errorElement: <RouteErrorPage />,
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
        errorElement: <RouteErrorPage />,
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

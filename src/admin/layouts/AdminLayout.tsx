import { PanelShell } from '@/components/custom/PanelShell'
import { AdminSidebar } from '../components/AdminSidebar'

export const AdminLayout = () => {
    return <PanelShell sidebar={(props) => <AdminSidebar {...props} />} />
}

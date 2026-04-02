import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Employee } from '../types/crm';
import { apiFetch } from '../utils/api';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface EmployeeContextType {
    employees: Employee[];
    roles: { id: number, name: string }[];
    departments: { id: number, name: string }[];
    addEmployee: (emp: any) => Promise<void>;
    updateEmployee: (emp: any) => Promise<void>;
    deleteEmployee: (id: number) => Promise<void>;
    isLoading: boolean;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [roles, setRoles] = useState<{ id: number, name: string }[]>([]);
    const [departments, setDepartments] = useState<{ id: number, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await apiFetch('/users');
            if (res.success) {
                const mapped = res.data.map((u: any) => ({
                    id: u.id,
                    name: `${u.first_name} ${u.last_name}`,
                    email: u.email,
                    role: u.role,
                    role_id: u.role_id,
                    department: u.department,
                    department_id: u.department_id,
                    status: u.status,
                    base_salary: u.base_salary
                }));
                setEmployees(mapped);
            }

            const rolesRes = await apiFetch('/users/roles');
            if (rolesRes.success) setRoles(rolesRes.data);

            const deptsRes = await apiFetch('/users/departments');
            if (deptsRes.success) setDepartments(deptsRes.data);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            setEmployees([]);
            setIsLoading(false);
        }
    }, [user]);

    const addEmployee = async (emp: any) => {
        try {
            const res = await apiFetch('/users', {
                method: 'POST',
                body: JSON.stringify({
                    first_name: emp.firstName,
                    last_name: emp.lastName,
                    role_id: emp.roleId,
                    department_id: emp.departmentId,
                    password: emp.password || 'welcome123'
                })
            });

            if (res.success) {
                await fetchData();
                toast.success('Employee created with professional email');
            }
        } catch (error) {
            toast.error('Failed to create employee');
        }
    };

    const updateEmployee = async (emp: any) => {
        try {
            const hasNames = emp.firstName && emp.lastName;
            const names = !hasNames && emp.name ? emp.name.split(' ') : [];
            const res = await apiFetch(`/users/${emp.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    first_name: emp.firstName || names[0] || '',
                    last_name: emp.lastName || names.slice(1).join(' ') || '',
                    email: emp.email,
                    role_id: emp.role_id,
                    department_id: emp.department_id,
                    password: emp.password
                })
            });

            if (res.success) {
                await fetchData();
                toast.success('Employee updated');
            }
        } catch (error) {
            console.error('Update failure:', error);
            toast.error('Failed to update employee');
        }
    };

    const deleteEmployee = async (id: number) => {
        try {
            const res = await apiFetch(`/users/${id}`, { method: 'DELETE' });
            if (res.success) {
                await fetchData();
                toast.success('Employee removed');
            }
        } catch (error) {
            toast.error('Failed to delete employee');
        }
    };

    return (
        <EmployeeContext.Provider value={{ 
            employees, 
            roles, 
            departments, 
            addEmployee, 
            updateEmployee, 
            deleteEmployee, 
            isLoading 
        }}>
            {children}
        </EmployeeContext.Provider>
    );
}

export function useEmployees() {
    const ctx = useContext(EmployeeContext);
    if (!ctx) throw new Error('useEmployees must be used within EmployeeProvider');
    return ctx;
}

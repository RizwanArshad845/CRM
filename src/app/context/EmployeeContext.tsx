import { createContext, useContext, useState, ReactNode } from 'react';
import type { Employee } from '../types/crm';
import { INITIAL_EMPLOYEES } from '../data/mockData';

interface EmployeeContextType {
    employees: Employee[];
    addEmployee: (emp: Employee) => void;
    updateEmployee: (emp: Employee) => void;
    deleteEmployee: (id: number) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
    const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

    const addEmployee = (emp: Employee) => setEmployees(prev => [...prev, emp]);
    const updateEmployee = (emp: Employee) => setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
    const deleteEmployee = (id: number) => setEmployees(prev => prev.filter(e => e.id !== id));

    return (
        <EmployeeContext.Provider value={{ employees, addEmployee, updateEmployee, deleteEmployee }}>
            {children}
        </EmployeeContext.Provider>
    );
}

export function useEmployees() {
    const ctx = useContext(EmployeeContext);
    if (!ctx) throw new Error('useEmployees must be used within EmployeeProvider');
    return ctx;
}

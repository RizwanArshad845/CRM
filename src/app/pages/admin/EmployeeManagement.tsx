import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, UserPlus, Mail, Shield, DollarSign, Clock, Pencil, Trash2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { useEmployees } from '../../context/EmployeeContext';
import { cls } from '../../styles/classes';
import { toast } from 'sonner';

export function EmployeeManagement() {
  const { employees, isLoading, addEmployee, updateEmployee, deleteEmployee, roles, departments } = useEmployees();
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({ firstName: '', lastName: '', email: '', roleId: '', departmentId: '', password: '' });
  const [editingEmp, setEditingEmp] = useState<any>(null);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.firstName || !newEmp.lastName || !newEmp.roleId || !newEmp.departmentId) {
      toast.error('Please fill in all required fields');
      return;
    }
    addEmployee(newEmp);
    setIsAddDialogOpen(false);
    setNewEmp({ firstName: '', lastName: '', email: '', roleId: '', departmentId: '', password: '' });
  };

  const handleEditClick = (emp: any) => {
    const [firstName, ...lastNameParts] = emp.name.split(' ');
    setEditingEmp({
      id: emp.id,
      firstName,
      lastName: lastNameParts.join(' '),
      email: emp.email,
      roleId: emp.role_id?.toString() || '',
      departmentId: emp.department_id?.toString() || '',
      password: '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp.firstName || !editingEmp.lastName || !editingEmp.roleId || !editingEmp.departmentId) {
      toast.error('Please fill in all required fields');
      return;
    }
    updateEmployee({
      id: editingEmp.id,
      firstName: editingEmp.firstName,
      lastName: editingEmp.lastName,
      email: editingEmp.email,
      role_id: parseInt(editingEmp.roleId),
      department_id: parseInt(editingEmp.departmentId),
      password: editingEmp.password,
    });
    setIsEditDialogOpen(false);
    setEditingEmp(null);
  };

  const handleDeleteEmployee = (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      deleteEmployee(id);
    }
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = (emp: any) => {
    const newStatus = emp.status === 'active' ? 'inactive' : 'active';
    updateEmployee({ ...emp, status: newStatus });
    toast.success(`Employee ${newStatus === 'active' ? 'activated' : 'deactivated'}.`);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading employees...</div>;

  return (
    <div className={cls.page}>
      <Card>
        <CardHeader>
          <div className={cls.row}>
            <div>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>Manage your team, roles, and access controls</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                    Enter employee details. Professionals emails are generated automatically.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddEmployee} className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        id="firstName" 
                        value={newEmp.firstName} 
                        onChange={e => setNewEmp({...newEmp, firstName: e.target.value})} 
                        placeholder="John" 
                        autoComplete="off"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input 
                        id="lastName" 
                        value={newEmp.lastName} 
                        onChange={e => setNewEmp({...newEmp, lastName: e.target.value})} 
                        placeholder="Doe" 
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={newEmp.email} 
                      onChange={e => setNewEmp({...newEmp, email: e.target.value})} 
                      placeholder="Leave blank to generate automatically"
                      autoComplete="off"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select value={newEmp.roleId} onValueChange={v => setNewEmp({...newEmp, roleId: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(r => (
                          <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dept">Department *</Label>
                    <Select value={newEmp.departmentId} onValueChange={v => setNewEmp({...newEmp, departmentId: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(d => (
                          <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Initial Password (optional)</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={newEmp.password} 
                      onChange={e => setNewEmp({...newEmp, password: e.target.value})} 
                      placeholder="Default: welcome123" 
                      autoComplete="new-password"
                    />
                  </div>
                  <DialogFooter className="mt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Create Employee</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Employee</DialogTitle>
                  <DialogDescription>Update details for {editingEmp?.firstName} {editingEmp?.lastName}.</DialogDescription>
                </DialogHeader>
                {editingEmp && (
                  <form onSubmit={handleUpdateEmployee} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-firstName">First Name *</Label>
                        <Input 
                          id="edit-firstName" 
                          value={editingEmp.firstName} 
                          onChange={e => setEditingEmp({...editingEmp, firstName: e.target.value})} 
                          autoComplete="off"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-lastName">Last Name *</Label>
                        <Input 
                          id="edit-lastName" 
                          value={editingEmp.lastName} 
                          onChange={e => setEditingEmp({...editingEmp, lastName: e.target.value})} 
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input 
                        id="edit-email" 
                        type="email" 
                        value={editingEmp.email} 
                        onChange={e => setEditingEmp({...editingEmp, email: e.target.value})} 
                        autoComplete="off"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-role">Role *</Label>
                      <Select value={editingEmp.roleId} onValueChange={v => setEditingEmp({...editingEmp, roleId: v})}>
                        <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                        <SelectContent>
                          {roles.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-dept">Department *</Label>
                      <Select value={editingEmp.departmentId} onValueChange={v => setEditingEmp({...editingEmp, departmentId: v})}>
                        <SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger>
                        <SelectContent>
                          {departments.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-password">New Password (optional)</Label>
                      <Input 
                        id="edit-password" 
                        type="password" 
                        value={editingEmp.password} 
                        onChange={e => setEditingEmp({...editingEmp, password: e.target.value})} 
                        placeholder="Leave blank to keep current"
                        autoComplete="new-password"
                      />
                    </div>
                    <DialogFooter className="mt-4">
                      <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                      <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(emp => (
              <Card key={emp.id} className={`${cls.itemHover} transition-all border-l-4 ${emp.status === 'active' ? 'border-l-blue-500' : 'border-l-muted'}`}>
                <CardContent className="pt-6">
                  <div className={cls.row}>
                    <div className="flex-1">
                      <h4 className={cls.heading}>{emp.name}</h4>
                      <div className={`${cls.inline} ${cls.hint} text-xs mt-1`}>
                        <Mail className="h-3 w-3" />
                        <span>{emp.email}</span>
                      </div>
                    </div>
                    <Badge variant={emp.status === 'active' ? 'default' : 'secondary'}>
                      {emp.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className={cls.muted}>
                      <p className={cls.hintXs}>Role</p>
                      <div className={`${cls.inline} font-semibold text-xs mt-0.5`}>
                        <Shield className="h-3 w-3 text-blue-500" />
                        <span>{emp.role}</span>
                      </div>
                    </div>
                    <div className={cls.muted}>
                      <p className={cls.hintXs}>Dept</p>
                      <div className="font-semibold text-xs mt-0.5">{emp.department}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                    <div>
                      <p className={cls.hintXs}>Base Salary</p>
                      <div className={`${cls.inline} font-bold text-sm text-green-600`}>
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>₨ {emp.base_salary?.toLocaleString() ?? 0}</span>
                      </div>
                    </div>
                    <div>
                      <p className={cls.hintXs}>Status</p>
                      <div className={`${cls.inline} text-xs mt-1`}>
                        <Clock className="h-3 w-3" />
                        <span className="capitalize">{emp.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`${cls.actions} mt-4 pt-2 border-t justify-end`}>
                    <Button variant="ghost" size="sm" className="text-xs h-8 text-blue-600" onClick={() => handleEditClick(emp)}>
                      <Pencil className="h-3 w-3 mr-1" />Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-8 text-red-600" 
                      onClick={() => handleDeleteEmployee(emp.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />Delete
                    </Button>
                    <Button
                      variant={emp.status === 'active' ? 'outline' : 'default'}
                      size="sm"
                      className="text-xs h-8 ml-2"
                      onClick={() => handleToggleStatus(emp)}
                    >
                      {emp.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No employees found matching your search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

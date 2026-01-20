'use client';
import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, PlusCircle, Trash, Edit, Search, Eye, EyeOff, AlertTriangle, RotateCcw } from 'lucide-react';
import type { User, PagePermission } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AuthContext } from '@/context/auth-context';
import { Checkbox } from '@/components/ui/checkbox';

const availablePermissions: {id: PagePermission, label: string}[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'members', label: 'Members' },
    { id: 'events', label: 'Events' },
    { id: 'donations', label: 'Giving' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'reports', label: 'Reports' },
    { id: 'users', label: 'User Management' },
    { id: 'settings', label: 'Settings' },
];

const UserForm = ({ user, onSave, onCancel }: { user?: User | null, onSave: (user: User) => void, onCancel: () => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Omit<User, 'id'> & { password: string }>(
    user ? { name: user.name, username: user.username, email: user.email, role: user.role, password: '', permissions: user.permissions, createdAt: user.createdAt, lastLogin: user.lastLogin } : {
      name: '',
      username: '',
      email: '',
      role: 'Staff',
      password: '',
      permissions: {
        dashboard: false,
        members: false,
        events: false,
        donations: false,
        expenses: false,
        reports: false,
        users: false,
        settings: false,
      },
      createdAt: new Date().toISOString(),
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: User['role']) => {
    setFormData(prev => {
      // Set default permissions based on role
      const defaultPermissions = value === 'Admin' ? {
        dashboard: true,
        members: true,
        events: true,
        donations: true,
        expenses: true,
        reports: true,
        users: true,
        settings: true,
      } : { // Staff defaults
        dashboard: true,
        members: true,
        events: true,
        donations: true,
        expenses: true,
        reports: true,
        users: false, // Staff cannot manage users
        settings: false,
      };

      return {...prev, role: value, permissions: defaultPermissions};
    });
  };
  
  const handlePermissionChange = (permissionId: PagePermission, checked: boolean | 'indeterminate') => {
      setFormData(prev => ({
          ...prev,
          permissions: {
              ...prev.permissions,
              [permissionId]: !!checked,
          }
      }));
  };

  const handleSelectAllPermissions = (checked: boolean) => {
      setFormData(prev => ({
          ...prev,
          permissions: Object.fromEntries(
              availablePermissions.map(p => [p.id, checked])
          ) as Record<PagePermission, boolean>,
      }));
  };

  const allPermissionsSelected = availablePermissions.every(p => formData.permissions[p.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.role) {
      alert('Please fill all required fields.');
      return;
    }
    if (!user && !formData.password) {
        alert('Password is required for new users.');
        return;
    }

    const newUser: Omit<User, 'password'> & { password?: string } = {
      id: user?.id || `u${Date.now()}`,
      ...formData
    };

    // If editing and password not changed (empty), omit password to keep current
    if (user && formData.password === '') {
      delete newUser.password;
    }

    onSave(newUser as User);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Name</Label>
          <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">Username</Label>
          <Input id="username" name="username" value={formData.username || ''} onChange={handleChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="password" className="text-right">Password</Label>
          <div className="col-span-3 relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              onChange={handleChange}
              className="pr-10"
              placeholder={user ? "Leave blank to keep current password" : "Enter password"}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="role" className="text-right">Role</Label>
          <Select onValueChange={handleSelectChange} defaultValue={formData.role}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Permissions</Label>
            <div className="col-span-3 space-y-2">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="select-all-permissions"
                        checked={allPermissionsSelected}
                        onCheckedChange={handleSelectAllPermissions}
                    />
                    <Label htmlFor="select-all-permissions" className="font-medium">Select All</Label>
                </div>
                {availablePermissions.map(permission => (
                    <div key={permission.id} className="flex items-center gap-2 ml-4">
                        <Checkbox
                            id={`perm-${permission.id}`}
                            checked={formData.permissions?.[permission.id]}
                            onCheckedChange={(checked) => handlePermissionChange(permission.id, checked)}
                        />
                        <Label htmlFor={`perm-${permission.id}`} className="font-normal">{permission.label}</Label>
                    </div>
                ))}
            </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
};


export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const authContext = useContext(AuthContext);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);




  const hasPermission = authContext?.user?.permissions?.users;

  const handleAddNewUser = () => {
    setEditingUser(null);
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
      if (response.ok) {
        // Refetch users
        await fetchUsers();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const handleSaveUser = async (user: User) => {
    try {
      const method = editingUser ? 'PUT' : 'POST';
      const response = await fetch('/api/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (response.ok) {
        setIsUserDialogOpen(false);
        setEditingUser(null);
        // Refetch users
        await fetchUsers();
      } else {
        alert('Failed to save user');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSystemReset = async () => {
    if (!authContext?.user) {
      alert('You must be logged in to perform this action');
      return;
    }

    if (authContext.user.role !== 'Admin') {
      alert('Only administrators can reset the system');
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': authContext.user.id,
          'x-user-role': authContext.user.role,
        },
        body: JSON.stringify({ confirmReset: true })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`System reset completed successfully!\n\nReset performed by: ${authContext.user.name}\nTimestamp: ${new Date(data.timestamp).toLocaleString()}`);
        setIsResetDialogOpen(false);
        // Optionally redirect to dashboard or refresh the page
        router.push('/dashboard');
      } else {
        const error = await response.json();
        alert(`System reset failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error resetting system:', error);
      alert('An error occurred while resetting the system. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
              <div className="relative mt-4">
                <Skeleton className="h-10 w-full md:w-[200px] lg:w-[320px]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {hasPermission ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage system users and their roles.</CardDescription>
                </div>
                <Button onClick={handleAddNewUser}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New User
                </Button>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or username..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user.id)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {authContext?.user?.role === 'Admin' && (
            <Card className="border-destructive/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div>
                    <CardTitle className="text-destructive">System Administration</CardTitle>
                    <CardDescription>Dangerous operations that affect the entire system.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <h4 className="font-semibold text-destructive mb-2">System Reset</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      This will permanently delete all member records, events, donations, and expenses from the system.
                      User accounts and system settings will be preserved. This action cannot be undone.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => setIsResetDialogOpen(true)}
                        disabled={isResetting}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {isResetting ? 'Resetting...' : 'Reset System Data'}
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Only administrators can perform this action
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p>You do not have permission to access this page.</p>
        </div>
      )}

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update the user's details." : "Add a new user to the system."}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={editingUser}
            onSave={handleSaveUser}
            onCancel={() => setIsUserDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm System Reset
            </DialogTitle>
            <DialogDescription>
              This action will permanently delete all data from the system. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <h4 className="font-semibold text-destructive mb-2">Data that will be deleted:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• All member records</li>
                <li>• All events</li>
                <li>• All donations</li>
                <li>• All expenses</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                User accounts and system settings will be preserved.
              </p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Warning:</strong> Make sure you have backed up any important data before proceeding.
                This action is irreversible.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResetDialogOpen(false)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSystemReset}
              disabled={isResetting}
            >
              {isResetting ? 'Resetting...' : 'Yes, Reset System'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

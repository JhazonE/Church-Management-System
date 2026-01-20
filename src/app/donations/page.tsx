'use client';
import React, { useState, useEffect, useContext } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, PlusCircle, Edit, Trash, Search, ChevronDown, FileDown, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { Member } from '@/lib/types';
import type { Donation } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthContext } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

const categoryVariant: { [key: string]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
  Tithe: 'default',
  Offering: 'secondary',
  'Building Fund': 'outline',
  Missions: 'destructive',
};

const AddServiceTimeForm = ({ onSave, onCancel, initialValue = '', isEdit = false }: { onSave: (serviceTime: string) => void; onCancel: () => void; initialValue?: string; isEdit?: boolean; }) => {
  const [serviceTime, setServiceTime] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTime.trim()) {
      alert('Service time cannot be empty.');
      return;
    }
    onSave(serviceTime);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="service-time" className="text-right">
            Time
          </Label>
          <Input
            id="service-time"
            value={serviceTime}
            onChange={(e) => setServiceTime(e.target.value)}
            className="col-span-3"
            placeholder="e.g., 9:00 AM Sunday"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isEdit ? 'Update Time' : 'Save Time'}</Button>
      </DialogFooter>
    </form>
  );
};

const AddCategoryForm = ({ onSave, onCancel, initialValue = '', isEdit = false }: { onSave: (category: string) => void; onCancel: () => void; initialValue?: string; isEdit?: boolean; }) => {
  const [category, setCategory] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim()) {
      alert('Category name cannot be empty.');
      return;
    }
    onSave(category);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category-name" className="text-right">
            Name
          </Label>
          <Input
            id="category-name"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="col-span-3"
            placeholder="e.g., Special Project"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isEdit ? 'Update Category' : 'Save Category'}</Button>
      </DialogFooter>
    </form>
  );
};

const AddGivingTypeForm = ({ onSave, onCancel, initialValue = '', isEdit = false }: { onSave: (givingType: string) => void; onCancel: () => void; initialValue?: string; isEdit?: boolean; }) => {
  const [givingType, setGivingType] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!givingType.trim()) {
      alert('Giving type cannot be empty.');
      return;
    }
    onSave(givingType);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="giving-type" className="text-right">
            Type
          </Label>
          <Input
            id="giving-type"
            value={givingType}
            onChange={(e) => setGivingType(e.target.value)}
            className="col-span-3"
            placeholder="e.g., Digital Wallet"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isEdit ? 'Update Type' : 'Save Type'}</Button>
      </DialogFooter>
    </form>
  );
};

const DonationForm = ({ donation, onSave, onCancel, serviceTimes, categories, givingTypes, onManageServiceTimeClick, onManageCategoryClick, onManageGivingTypeClick, userId, members }: { donation?: Donation | null, onSave: (donation: Donation) => void, onCancel: () => void, serviceTimes: Array<{ id: string, time: string }>, categories: Array<{ id: string, name: string }>, givingTypes: Array<{ id: string; name: string }>, onManageServiceTimeClick: () => void, onManageCategoryClick: () => void, onManageGivingTypeClick: () => void, userId: string, members: Member[] }) => {
  const [memberId, setMemberId] = useState<string>(donation?.memberId || '');
  const [amount, setAmount] = useState<number | string>(donation?.amount || '');
  const [category, setCategory] = useState<Donation['category']>(donation?.category || 'Tithe');
  const [givingTypeId, setGivingTypeId] = useState<string>(donation?.givingTypeId || '');
  const [serviceTime, setServiceTime] = useState<string>(donation?.serviceTime || '');
  const [hasReference, setHasReference] = useState<boolean>(!!donation?.reference);
  const [reference, setReference] = useState<string>(donation?.reference || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const donor = members.find(m => m.id === memberId);
    if (!donor || !amount || !category) {
      alert('Please fill all fields');
      return;
    }
    const donationData: Donation = {
      id: donation?.id || `d${Date.now()}`,
      donorName: donor.name,
      memberId,
      amount: Number(amount),
      date: donation?.date || new Date().toISOString().split('T')[0],
      category,
      givingTypeId,
      serviceTime,
      recordedById: donation?.recordedById || userId,
      reference: hasReference ? reference : undefined,
    };
    onSave(donationData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="member" className="text-right">Donor</Label>
          <Select onValueChange={setMemberId} value={memberId}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a donor" />
            </SelectTrigger>
            <SelectContent>
              {members.map(member => (
                <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="text-right">Amount</Label>
          <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">Category</Label>
          <Select onValueChange={(value: Donation['category']) => setCategory(value)} value={category}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
              <div
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm font-medium text-primary outline-none hover:bg-accent hover:text-accent-foreground border-t"
                onClick={(e) => {
                  e.preventDefault();
                  onManageCategoryClick();
                }}
              >
                + Add Category
              </div>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="giving-type" className="text-right">Giving Type</Label>
          <Select onValueChange={setGivingTypeId} value={givingTypeId}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a giving type" />
            </SelectTrigger>
            <SelectContent>
              {givingTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
              ))}
              <div
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm font-medium text-primary outline-none hover:bg-accent hover:text-accent-foreground border-t"
                onClick={(e) => {
                  e.preventDefault();
                  onManageGivingTypeClick();
                }}
              >
                + Add Giving Type
              </div>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4 mt-2">
          <Label htmlFor="has-reference" className="text-right">Reference</Label>
          <div className="col-span-3 flex items-center space-x-2">
            <Switch
              id="has-reference"
              checked={hasReference}
              onCheckedChange={(checked) => {
                setHasReference(checked);
                if (!checked) {
                  setReference('');
                }
              }}
            />
            <span className="text-sm text-muted-foreground">Include reference</span>
          </div>
        </div>
        {hasReference && (
          <div className="grid grid-cols-4 items-center gap-4 mt-2">
            <Label htmlFor="reference" className="text-right">Reference</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="col-span-3"
              placeholder="Enter reference number or details"
            />
          </div>
        )}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="service-time" className="text-right">Service Time</Label>
          <Select onValueChange={setServiceTime} value={serviceTime}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a service time" />
            </SelectTrigger>
            <SelectContent>
              {serviceTimes.map(time => (
                <SelectItem key={time.id} value={time.time}>{time.time}</SelectItem>
              ))}
              <div
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm font-medium text-primary outline-none hover:bg-accent hover:text-accent-foreground border-t"
                onClick={(e) => {
                  e.preventDefault();
                  onManageServiceTimeClick();
                }}
              >
                + Add Service Time
              </div>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{donation ? 'Update Giving' : 'Record Giving'}</Button>
      </DialogFooter>
    </form>
  );
};


export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isServiceTimeDialogOpen, setIsServiceTimeDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isGivingTypeDialogOpen, setIsGivingTypeDialogOpen] = useState(false);

  const [isManageCategoriesDialogOpen, setIsManageCategoriesDialogOpen] = useState(false);
  const [isManageServiceTimesDialogOpen, setIsManageServiceTimesDialogOpen] = useState(false);
  const [isManageGivingTypesDialogOpen, setIsManageGivingTypesDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingServiceTime, setEditingServiceTime] = useState<string | null>(null);
  const [editingGivingType, setEditingGivingType] = useState<string | null>(null);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [categoriesSearchQuery, setCategoriesSearchQuery] = useState('');
  const [serviceTimesSearchQuery, setServiceTimesSearchQuery] = useState('');
  const [givingTypesSearchQuery, setGivingTypesSearchQuery] = useState('');

  const [serviceTimes, setServiceTimes] = useState<Array<{ id: string, time: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string, name: string }>>([]);
  const [givingTypes, setGivingTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();

  // Check permissions
  useEffect(() => {
    if (authContext?.user && !authContext.user.permissions?.donations) {
      router.push('/dashboard');
    }
  }, [authContext, router]);

  if (authContext?.user && !authContext.user.permissions?.donations) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  useEffect(() => {
    setIsClient(true);
    fetchDonations();
    fetchMembers();
    fetchCategories();
    fetchServiceTimes();
    fetchGivingTypes();
  }, []);

  const fetchDonations = async () => {
    try {
      if (window.electronAPI?.database) {
        const data = window.electronAPI.database.getAllDonations();
        setDonations(data);
      } else {
        // Fallback to API for web version
        const response = await fetch('/api/donations');
        if (response.ok) {
          const data = await response.json();
          setDonations(data);
        } else {
          console.error('Failed to fetch donations from API');
        }
      }
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      if (window.electronAPI?.database) {
        const data = window.electronAPI.database.getAllMembers();
        setMembers(data);
      } else {
        // Fallback to API for web version
        const response = await fetch('/api/members');
        if (response.ok) {
          const data = await response.json();
          setMembers(data);
        } else {
          console.error('Failed to fetch members from API');
        }
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      if (window.electronAPI?.database) {
        const data = window.electronAPI.database.getAllDonationCategories();
        setCategories(data);
      } else {
        // Fallback to API for web version
        const response = await fetch('/api/donation-categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error('Failed to fetch categories from API');
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchServiceTimes = async () => {
    try {
      if (window.electronAPI?.database) {
        const data = window.electronAPI.database.getAllServiceTimes();
        setServiceTimes(data);
      } else {
        // Fallback to API for web version
        const response = await fetch('/api/service-times');
        if (response.ok) {
          const data = await response.json();
          setServiceTimes(data);
        } else {
          console.error('Failed to fetch service times from API');
        }
      }
    } catch (error) {
      console.error('Failed to fetch service times:', error);
    }
  };

  const fetchGivingTypes = async () => {
    try {
      if (window.electronAPI?.database) {
        const data = window.electronAPI.database.getAllGivingTypes();
        setGivingTypes(data);
      } else {
        // Fallback to API for web version
        const response = await fetch('/api/giving-types');
        if (response.ok) {
          const data = await response.json();
          setGivingTypes(data);
        } else {
          console.error('Failed to fetch giving types from API');
        }
      }
    } catch (error) {
      console.error('Failed to fetch giving types:', error);
    }
  };

  const handleSaveDonation = async (donation: Donation) => {
    try {
      const isEditing = !!editingDonation;
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/donations?id=${donation.id}` : '/api/donations';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donation),
      });

      if (response.ok) {
        fetchDonations();
        setIsDialogOpen(false);
        setEditingDonation(null);
        toast({
          title: "Success",
          description: `Donation ${isEditing ? 'updated' : 'recorded'} successfully.`,
        });
      } else {
        alert(`Failed to ${isEditing ? 'update' : 'record'} donation`);
      }
    } catch (error) {
      console.error(`Error ${editingDonation ? 'updating' : 'recording'} donation:`, error);
      alert(`Error ${editingDonation ? 'updating' : 'recording'} donation`);
    }
  };

  const handleEditDonation = (donation: Donation) => {
    setEditingDonation(donation);
    setIsDialogOpen(true);
  };

  const handleDelete = async (donationId: string) => {
    try {
      const response = await fetch(`/api/donations?id=${donationId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchDonations();
      } else {
        alert('Failed to delete donation');
      }
    } catch (error) {
      console.error('Error deleting donation:', error);
      alert('Error deleting donation');
    }
  };

  const handleSaveServiceTime = async (serviceTime: string) => {
    try {
      if (editingServiceTime) {
        // Update existing service time
        const response = await fetch('/api/service-times', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: editingServiceTime, time: serviceTime }),
        });

        if (response.ok) {
          fetchServiceTimes();
          setEditingServiceTime(null);
          toast({
            title: "Success",
            description: "Service time updated successfully.",
          });
        } else {
          alert('Failed to update service time');
        }
      } else {
        // Add new service time
        const response = await fetch('/api/service-times', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ time: serviceTime }),
        });

        if (response.ok) {
          fetchServiceTimes();
          toast({
            title: "Success",
            description: "Service time added successfully.",
          });
        } else {
          alert('Failed to add service time');
        }
      }
      setIsServiceTimeDialogOpen(false);
    } catch (error) {
      console.error('Error saving service time:', error);
      alert('Error saving service time');
    }
  };

  const handleSaveCategory = async (category: string) => {
    try {
      if (editingCategory) {
        // Update existing category
        const response = await fetch('/api/donation-categories', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: editingCategory, name: category }),
        });

        if (response.ok) {
          fetchCategories();
          setEditingCategory(null);
          toast({
            title: "Success",
            description: "Category updated successfully.",
          });
        } else {
          alert('Failed to update category');
        }
      } else {
        // Add new category
        const response = await fetch('/api/donation-categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: category }),
        });

        if (response.ok) {
          fetchCategories();
          toast({
            title: "Success",
            description: "Category added successfully.",
          });
        } else {
          alert('Failed to add category');
        }
      }
      setIsCategoryDialogOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    }
  };

  const handleEditCategory = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    if (cat) {
      setEditingCategory(cat.id);
      setIsCategoryDialogOpen(true);
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    if (cat && confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      try {
        const response = await fetch(`/api/donation-categories?id=${cat.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchCategories();
        } else {
          alert('Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category');
      }
    }
  };

  const handleEditServiceTime = (serviceTimeName: string) => {
    const st = serviceTimes.find(s => s.time === serviceTimeName);
    if (st) {
      setEditingServiceTime(st.id);
      setIsServiceTimeDialogOpen(true);
    }
  };

  const handleDeleteServiceTime = async (serviceTimeName: string) => {
    const st = serviceTimes.find(s => s.time === serviceTimeName);
    if (st && confirm(`Are you sure you want to delete the service time "${serviceTimeName}"?`)) {
      try {
        const response = await fetch(`/api/service-times?id=${st.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchServiceTimes();
        } else {
          alert('Failed to delete service time');
        }
      } catch (error) {
        console.error('Error deleting service time:', error);
        alert('Error deleting service time');
      }
    }
  };

  const handleAddNewCategory = () => {
    setEditingCategory(null);
    setIsCategoryDialogOpen(true);
  };

  const handleAddNewServiceTime = () => {
    setEditingServiceTime(null);
    setIsServiceTimeDialogOpen(true);
  };

  const handleSaveGivingType = async (givingType: string) => {
    try {
      if (editingGivingType) {
        // Update existing giving type
        const response = await fetch('/api/giving-types', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: editingGivingType, name: givingType }),
        });

        if (response.ok) {
          fetchGivingTypes();
          setEditingGivingType(null);
          toast({
            title: "Success",
            description: "Giving type updated successfully.",
          });
        } else {
          alert('Failed to update giving type');
        }
      } else {
        // Add new giving type
        const response = await fetch('/api/giving-types', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: givingType }),
        });

        if (response.ok) {
          fetchGivingTypes();
          toast({
            title: "Success",
            description: "Giving type added successfully.",
          });
        } else {
          alert('Failed to add giving type');
        }
      }
      setIsGivingTypeDialogOpen(false);
    } catch (error) {
      console.error('Error saving giving type:', error);
      alert('Error saving giving type');
    }
  };

  const handleEditGivingType = (givingTypeId: string) => {
    const gt = givingTypes.find(g => g.id === givingTypeId);
    if (gt) {
      setEditingGivingType(givingTypeId);
      setIsGivingTypeDialogOpen(true);
    }
  };

  const handleDeleteGivingType = async (givingTypeId: string) => {
    const gt = givingTypes.find(g => g.id === givingTypeId);
    if (gt && confirm(`Are you sure you want to delete the giving type "${gt.name}"?`)) {
      try {
        const response = await fetch(`/api/giving-types?id=${givingTypeId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchGivingTypes();
        } else {
          alert('Failed to delete giving type');
        }
      } catch (error) {
        console.error('Error deleting giving type:', error);
        alert('Error deleting giving type');
      }
    }
  };

  const handleAddNewGivingType = () => {
    setEditingGivingType(null);
    setIsGivingTypeDialogOpen(true);
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.donorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDonations = filteredDonations.slice(startIndex, endIndex);

  const handlePrint = () => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        alert('Please allow popups for this site to print.');
        return;
      }

      // Generate print content
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Giving Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #000;
            }
            .header {
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .amount {
              text-align: right;
            }
            .date {
              text-align: center;
            }
            .print-date {
              text-align: right;
              font-size: 12px;
              margin-bottom: 20px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="print-date">Printed on: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</div>
          <div class="header">Giving</div>
          <table>
            <thead>
              <tr>
                <th>Donor</th>
                <th class="amount">Amount</th>
                <th>Category</th>
                <th>Service Time</th>
                <th class="date">Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredDonations.map(donation => `
                <tr>
                  <td>${donation.donorName}</td>
                  <td class="amount">₱${donation.amount.toFixed(2)}</td>
                  <td>${donation.category}</td>
                  <td>${donation.serviceTime || ''}</td>
                  <td class="date">${new Date(donation.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'UTC'
      })}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" style="text-align: right; font-weight: bold; padding: 8px;">TOTAL:</td>
                <td style="text-align: right; font-weight: bold; padding: 8px;">₱${filteredDonations.reduce((total, donation) => total + donation.amount, 0).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    } catch (error) {
      console.error('Print error:', error);
      alert('Failed to print. Please try again.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Donor', 'Amount', 'Category', 'Service Time', 'Date'];
    const rows = filteredDonations.map(donation => [
      `"${donation.donorName.replace(/"/g, '""')}"`,
      `PHP ${donation.amount.toFixed(2)}`,
      donation.category,
      donation.serviceTime || '',
      isClient ? new Date(donation.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }) : ''
    ]);

    // Add total row
    const totalAmount = filteredDonations.reduce((total, donation) => total + donation.amount, 0);
    rows.push(['TOTAL', `PHP ${totalAmount.toFixed(2)}`, '', '', '']);

    let csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "donations_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Donor", "Amount", "Category", "Service Time", "Date"];
    const tableRows: (string | number)[][] = [];

    filteredDonations.forEach(donation => {
      const donationData = [
        donation.donorName,
        `PHP ${donation.amount.toFixed(2)}`,
        donation.category,
        donation.serviceTime || '',
        isClient ? new Date(donation.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }) : ''
      ];
      tableRows.push(donationData);
    });

    // Add total row
    const totalAmount = filteredDonations.reduce((total, donation) => total + donation.amount, 0);
    tableRows.push(['TOTAL', `PHP ${totalAmount.toFixed(2)}`, '', '', '']);

    doc.text("Donations Report", 14, 15);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save('donations_report.pdf');
  };


  if (loading) {
    return (
      <AppLayout>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            <div className="relative mt-4">
              <Skeleton className="h-10 w-full md:w-[200px] lg:w-[320px]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Giving</CardTitle>
              <CardDescription>Track all financial contributions.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Export
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportCSV}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export to CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export to PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Record Giving
              </Button>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by donor name..."
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
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Giving Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Service Time</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDonations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell className="font-medium">{donation.donorName}</TableCell>
                  <TableCell>₱{donation.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={categoryVariant[donation.category] || 'default'}>
                      {donation.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{givingTypes.find(gt => gt.id === donation.givingTypeId)?.name || '-'}</TableCell>
                  <TableCell>{donation.reference || '-'}</TableCell>
                  <TableCell>{donation.serviceTime}</TableCell>
                  <TableCell>{isClient ? new Date(donation.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }) : ''}</TableCell>
                  <TableCell className="text-right">
                    {authContext?.user?.role === 'Admin' ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditDonation(donation)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(donation.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Total Amount Display */}
          <div className="mt-4 p-4 bg-muted/20 rounded-lg border">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">
                ₱{filteredDonations.reduce((total, donation) => total + donation.amount, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredDonations.length)} of {filteredDonations.length} donations
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingDonation(null);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingDonation ? 'Edit Giving' : 'Record a New Giving'}</DialogTitle>
            <DialogDescription>
              {editingDonation ? 'Update the giving details.' : 'Fill in the details to record a new contribution.'}
            </DialogDescription>
          </DialogHeader>
          <DonationForm
            donation={editingDonation}
            onSave={handleSaveDonation}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingDonation(null);
            }}
            serviceTimes={serviceTimes}
            categories={categories}
            givingTypes={givingTypes}
            onManageServiceTimeClick={() => setIsManageServiceTimesDialogOpen(true)}
            onManageCategoryClick={() => setIsManageCategoriesDialogOpen(true)}
            onManageGivingTypeClick={() => setIsManageGivingTypesDialogOpen(true)}
            userId={authContext?.user?.id || ''}
            members={members}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update the category name.' : 'Create a new category for giving.'}
            </DialogDescription>
          </DialogHeader>
          <AddCategoryForm
            onSave={handleSaveCategory}
            onCancel={() => {
              setIsCategoryDialogOpen(false);
              setEditingCategory(null);
            }}
            initialValue={editingCategory ? categories.find(c => c.id === editingCategory)?.name || '' : ''}
            isEdit={!!editingCategory}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isServiceTimeDialogOpen} onOpenChange={setIsServiceTimeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingServiceTime ? 'Edit Service Time' : 'Add New Service Time'}</DialogTitle>
            <DialogDescription>
              {editingServiceTime ? 'Update the service time.' : 'Create a new service time for donations.'}
            </DialogDescription>
          </DialogHeader>
          <AddServiceTimeForm
            onSave={handleSaveServiceTime}
            onCancel={() => {
              setIsServiceTimeDialogOpen(false);
              setEditingServiceTime(null);
            }}
            initialValue={editingServiceTime ? serviceTimes.find(s => s.id === editingServiceTime)?.time || '' : ''}
            isEdit={!!editingServiceTime}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isManageCategoriesDialogOpen} onOpenChange={setIsManageCategoriesDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              View, edit, or delete donation categories.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleAddNewCategory}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search categories..."
                className="w-full rounded-lg bg-background pl-8"
                value={categoriesSearchQuery}
                onChange={(e) => setCategoriesSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories
                .filter(category => category.name.toLowerCase().includes(categoriesSearchQuery.toLowerCase()))
                .map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{category.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category.name)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsManageCategoriesDialogOpen(false);
              setCategoriesSearchQuery('');
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isManageServiceTimesDialogOpen} onOpenChange={setIsManageServiceTimesDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Service Times</DialogTitle>
            <DialogDescription>
              View, edit, or delete service times.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleAddNewServiceTime}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Service Time
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search service times..."
                className="w-full rounded-lg bg-background pl-8"
                value={serviceTimesSearchQuery}
                onChange={(e) => setServiceTimesSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {serviceTimes
                .filter(serviceTime => serviceTime.time.toLowerCase().includes(serviceTimesSearchQuery.toLowerCase()))
                .map((serviceTime) => (
                  <div key={serviceTime.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{serviceTime.time}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditServiceTime(serviceTime.time)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteServiceTime(serviceTime.time)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsManageServiceTimesDialogOpen(false);
              setServiceTimesSearchQuery('');
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      <Dialog open={isManageGivingTypesDialogOpen} onOpenChange={setIsManageGivingTypesDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Giving Types</DialogTitle>
            <DialogDescription>
              View, edit, or delete giving types.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleAddNewGivingType}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Giving Type
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search giving types..."
                className="w-full rounded-lg bg-background pl-8"
                value={givingTypesSearchQuery}
                onChange={(e) => setGivingTypesSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {givingTypes
                .filter(givingType => givingType && givingType.name && givingType.name.toLowerCase().includes(givingTypesSearchQuery.toLowerCase()))
                .map((givingType) => (
                  <div key={givingType.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{givingType.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditGivingType(givingType.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteGivingType(givingType.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsManageGivingTypesDialogOpen(false);
              setGivingTypesSearchQuery('');
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGivingTypeDialogOpen} onOpenChange={setIsGivingTypeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingGivingType ? 'Edit Giving Type' : 'Add New Giving Type'}</DialogTitle>
            <DialogDescription>
              {editingGivingType ? 'Update the giving type name.' : 'Create a new giving type.'}
            </DialogDescription>
          </DialogHeader>
          <AddGivingTypeForm
            onSave={handleSaveGivingType}
            onCancel={() => {
              setIsGivingTypeDialogOpen(false);
              setEditingGivingType(null);
            }}
            initialValue={editingGivingType ? givingTypes.find(gt => gt.id === editingGivingType)?.name || '' : ''}
            isEdit={!!editingGivingType}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

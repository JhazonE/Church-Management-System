'use client';
import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { AuthContext } from '@/context/auth-context';
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, PlusCircle, Trash, Edit, Search, HandCoins, ChevronDown, FileDown, Printer } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Member, Donation } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const initialNetworks: Array<{ id: string, name: string }> = [];

const AddNetworkForm = ({ onSave, onCancel, initialValue = '', isEdit = false }: { onSave: (networkName: string) => void; onCancel: () => void; initialValue?: string; isEdit?: boolean; }) => {
  const [networkName, setNetworkName] = useState(initialValue);

  useEffect(() => {
    setNetworkName(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!networkName.trim()) {
      alert('Network name cannot be empty.');
      return;
    }
    onSave(networkName);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="network-name" className="text-right">
            Name
          </Label>
          <Input
            id="network-name"
            value={networkName}
            onChange={(e) => setNetworkName(e.target.value)}
            className="col-span-3"
            placeholder="e.g., Young Adults"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isEdit ? 'Update Network' : 'Save Network'}</Button>
      </DialogFooter>
    </form>
  );
};

const AddCategoryForm = ({ onSave, onCancel, initialValue = '', isEdit = false }: { onSave: (category: string) => void; onCancel: () => void; initialValue?: string; isEdit?: boolean; }) => {
  const [category, setCategory] = useState(initialValue);

  useEffect(() => {
    setCategory(initialValue);
  }, [initialValue]);

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


const AddServiceTimeForm = ({ onSave, onCancel, initialValue = '', isEdit = false }: { onSave: (serviceTime: string) => void; onCancel: () => void; initialValue?: string; isEdit?: boolean; }) => {
  const [serviceTime, setServiceTime] = useState(initialValue);

  useEffect(() => {
    setServiceTime(initialValue);
  }, [initialValue]);

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

const AddGivingTypeForm = ({ onSave, onCancel, initialValue = '', isEdit = false, isInline = false }: { onSave: (givingType: string) => void; onCancel: () => void; initialValue?: string; isEdit?: boolean; isInline?: boolean; }) => {
  const [givingType, setGivingType] = useState(initialValue);

  useEffect(() => {
    setGivingType(initialValue);
  }, [initialValue]);

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
      {!isInline && (
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? 'Update Type' : 'Save Type'}</Button>
        </DialogFooter>
      )}
      {isInline && (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? 'Update Type' : 'Save Type'}</Button>
        </div>
      )}
    </form>
  );
};

const DonationForm = ({ member, onSave, onCancel, serviceTimes, categories, givingTypes, onManageServiceTimeClick, onManageCategoryClick, onManageGivingTypeClick }: { member: Member, onSave: (donation: Donation) => void, onCancel: () => void, serviceTimes: Array<{ id: string, time: string }>, categories: Array<{ id: string, name: string }>, givingTypes: Array<{ id: string, name: string }>, onManageServiceTimeClick: () => void, onManageCategoryClick: () => void, onManageGivingTypeClick: () => void }) => {
  const [amount, setAmount] = useState<number | string>('');
  const [categoryId, setCategoryId] = useState<string>();
  const [serviceTimeId, setServiceTimeId] = useState<string>();
  const [givingTypeId, setGivingTypeId] = useState<string>();
  const [hasReference, setHasReference] = useState<boolean>(false);
  const [reference, setReference] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !amount || !categoryId) {
      alert('Please fill all fields');
      return;
    }
    const selectedCategory = categories.find(c => c.id === categoryId);
    const selectedServiceTime = serviceTimes.find(t => t.id === serviceTimeId);
    const newDonation: Donation = {
      id: `d${Date.now()}`,
      donorName: member.name,
      memberId: member.id,
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      category: selectedCategory?.name as Donation['category'],
      serviceTime: selectedServiceTime?.time,
      givingTypeId: givingTypeId,
      reference: hasReference ? reference : undefined,
    };
    onSave(newDonation);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="member" className="text-right">Donor</Label>
          <Input id="name" name="name" value={member.name || ''} readOnly className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="text-right">Amount</Label>
          <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">Category</Label>
          <Select onValueChange={setCategoryId}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
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
          <Select onValueChange={setGivingTypeId}>
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
          <Select onValueChange={setServiceTimeId}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a service time" />
            </SelectTrigger>
            <SelectContent>
              {serviceTimes.map(time => (
                <SelectItem key={time.id} value={time.id}>{time.time}</SelectItem>
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
        <Button type="submit">Record Giving</Button>
      </DialogFooter>
    </form>
  );
};


const MemberForm = ({ member, onSave, onCancel, networks, onManageNetworkClick }: { member?: Member | null, onSave: (member: Member) => void, onCancel: () => void, networks: Array<{ id: string, name: string }>, onManageNetworkClick: () => void }) => {
  const [formData, setFormData] = useState<Partial<Member>>(member || { name: '', email: '', phone: '', address: '', network: 'Main' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: Member['network']) => {
    setFormData(prev => ({ ...prev, network: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.network) {
      alert('Please fill in the name and network fields.');
      return;
    }
    const newMember: Member = {
      id: member?.id || `m${Date.now()}`,
      joinDate: member?.joinDate || new Date().toISOString().split('T')[0],
      avatarUrl: member?.avatarUrl || `https://picsum.photos/seed/${Date.now()}/200/200`,
      email: formData.email || '',
      phone: formData.phone || '',
      address: formData.address || '',
      ...formData
    } as Member;
    onSave(newMember);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Name</Label>
          <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right">Phone</Label>
          <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="address" className="text-right">Address</Label>
          <Input id="address" name="address" value={formData.address || ''} onChange={handleChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="network" className="text-right">Network</Label>
          <Select onValueChange={handleSelectChange} defaultValue={formData.network}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a network" />
            </SelectTrigger>
            <SelectContent>
              {networks.map(net => (
                <SelectItem key={net.id} value={net.name}>{net.name}</SelectItem>
              ))}
              <div
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm font-medium text-primary outline-none hover:bg-accent hover:text-accent-foreground border-t"
                onClick={(e) => {
                  e.preventDefault();
                  onManageNetworkClick();
                }}
              >
                + Add Network
              </div>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
};


export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [networks, setNetworks] = useState<Array<{ id: string, name: string }>>(initialNetworks);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [isNetworkDialogOpen, setIsNetworkDialogOpen] = useState(false);
  const [isManageNetworksDialogOpen, setIsManageNetworksDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingNetwork, setEditingNetwork] = useState<{ id: string, name: string } | null>(null);
  const [donatingMember, setDonatingMember] = useState<Member | null>(null);
  const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [networksSearchQuery, setNetworksSearchQuery] = useState('');

  const [donations, setDonations] = useState<Donation[]>([]);
  const [serviceTimes, setServiceTimes] = useState<Array<{ id: string, time: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string, name: string }>>([]);
  const [givingTypes, setGivingTypes] = useState<Array<{ id: string, name: string }>>([]);
  const [isServiceTimeDialogOpen, setIsServiceTimeDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isGivingTypeDialogOpen, setIsGivingTypeDialogOpen] = useState(false);

  const [isManageCategoriesDialogOpen, setIsManageCategoriesDialogOpen] = useState(false);
  const [isManageServiceTimesDialogOpen, setIsManageServiceTimesDialogOpen] = useState(false);
  const [isManageGivingTypesDialogOpen, setIsManageGivingTypesDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string, name: string } | null>(null);
  const [editingServiceTime, setEditingServiceTime] = useState<{ id: string, time: string } | null>(null);
  const [editingGivingType, setEditingGivingType] = useState<{ id: string, name: string } | null>(null);
  const [categoriesSearchQuery, setCategoriesSearchQuery] = useState('');
  const [serviceTimesSearchQuery, setServiceTimesSearchQuery] = useState('');
  const [givingTypesSearchQuery, setGivingTypesSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    fetchMembers();
    fetchNetworks();
    fetchDonations();
    fetchServiceTimes();
    fetchCategories();
    fetchGivingTypes();
  }, []);

  // Check permissions
  useEffect(() => {
    if (authContext?.user && !authContext.user.permissions?.members) {
      router.push('/dashboard');
    }
  }, [authContext, router]);

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members');
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async () => {
    // TODO: Create donations API
    try {
      const response = await fetch('/api/donations');
      if (response.ok) {
        const data = await response.json();
        setDonations(data);
      }
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    }
  };

  const fetchServiceTimes = async () => {
    try {
      const response = await fetch('/api/service-times');
      if (response.ok) {
        const data = await response.json();
        setServiceTimes(data);
      } else {
        console.error('Failed to fetch service times from API');
      }
    } catch (error) {
      console.error('Failed to fetch service times:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/donation-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories from API');
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchGivingTypes = async () => {
    try {
      const response = await fetch('/api/giving-types');
      if (response.ok) {
        const data = await response.json();
        setGivingTypes(data);
      } else {
        console.error('Failed to fetch giving types from API');
      }
    } catch (error) {
      console.error('Failed to fetch giving types:', error);
    }
  };

  const fetchNetworks = async () => {
    try {
      const response = await fetch('/api/networks');
      if (response.ok) {
        const data = await response.json();
        setNetworks(data);
      }
    } catch (error) {
      console.error('Failed to fetch networks:', error);
    }
  };

  const handleAddNewMember = () => {
    setEditingMember(null);
    setIsMemberDialogOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setIsMemberDialogOpen(true);
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/members?id=${memberId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchMembers();
      } else {
        alert('Failed to delete member');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Error deleting member');
    }
  };

  const handleAddDonation = (member: Member) => {
    setDonatingMember(member);
    setIsDonationDialogOpen(true);
  };

  const handleSaveMember = async (member: Member) => {
    try {
      const method = editingMember ? 'PUT' : 'POST';
      const response = await fetch('/api/members', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(member),
      });

      if (response.ok) {
        fetchMembers();
        setIsMemberDialogOpen(false);
        setEditingMember(null);
        toast({
          title: "Success",
          description: `Member ${editingMember ? 'updated' : 'added'} successfully.`,
        });
      } else {
        console.error('Failed to save member');
        alert('Failed to save member');
      }
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Error saving member');
    }
  };

  const handleSaveNetwork = async (networkName: string) => {
    try {
      if (editingNetwork) {
        // Update existing network
        const response = await fetch('/api/networks', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: editingNetwork.id, name: networkName }),
        });

        if (response.ok) {
          fetchNetworks();
          setEditingNetwork(null);
          toast({
            title: "Success",
            description: "Network updated successfully.",
          });
        } else {
          alert('Failed to update network');
        }
      } else {
        // Add new network
        const response = await fetch('/api/networks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: networkName }),
        });

        if (response.ok) {
          fetchNetworks();
          toast({
            title: "Success",
            description: "Network added successfully.",
          });
        } else {
          alert('Failed to add network');
        }
      }
      setIsNetworkDialogOpen(false);
    } catch (error) {
      console.error('Error saving network:', error);
      alert('Error saving network');
    }
  };

  const handleEditNetwork = (network: { id: string, name: string }) => {
    setEditingNetwork(network);
    setIsNetworkDialogOpen(true);
  };

  const handleDeleteNetwork = async (network: { id: string, name: string }) => {
    if (confirm(`Are you sure you want to delete the network "${network.name}"?`)) {
      try {
        const response = await fetch(`/api/networks?id=${network.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchNetworks();
        } else {
          alert('Failed to delete network');
        }
      } catch (error) {
        console.error('Error deleting network:', error);
        alert('Error deleting network');
      }
    }
  };

  const handleAddNewNetwork = () => {
    setEditingNetwork(null);
    setIsNetworkDialogOpen(true);
  };

  const handleSaveDonation = async (donation: Donation) => {
    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donation),
      });

      if (response.ok) {
        fetchDonations();
        setIsDonationDialogOpen(false);
        setDonatingMember(null);
        toast({
          title: "Success",
          description: "Donation recorded successfully.",
        });
      } else {
        alert('Failed to record donation');
      }
    } catch (error) {
      console.error('Error recording donation:', error);
      alert('Error recording donation');
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
          body: JSON.stringify({ id: editingCategory.id, name: category }),
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

  const handleEditCategory = (category: { id: string, name: string }) => {
    setEditingCategory(category);
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (category: { id: string, name: string }) => {
    if (confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      try {
        const response = await fetch(`/api/donation-categories?id=${category.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchCategories();
          toast({
            title: "Success",
            description: "Category deleted successfully.",
          });
        } else {
          alert('Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category');
      }
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
          body: JSON.stringify({ id: editingServiceTime.id, time: serviceTime }),
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

  const handleEditServiceTime = (serviceTime: { id: string, time: string }) => {
    setEditingServiceTime(serviceTime);
    setIsServiceTimeDialogOpen(true);
  };

  const handleDeleteServiceTime = async (serviceTime: { id: string, time: string }) => {
    if (confirm(`Are you sure you want to delete the service time "${serviceTime.time}"?`)) {
      try {
        const response = await fetch(`/api/service-times?id=${serviceTime.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchServiceTimes();
          toast({
            title: "Success",
            description: "Service time deleted successfully.",
          });
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
          body: JSON.stringify({ id: editingGivingType.id, name: givingType }),
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

  const handleEditGivingType = (givingType: { id: string, name: string }) => {
    setEditingGivingType(givingType);
    setIsGivingTypeDialogOpen(true);
  };

  const handleDeleteGivingType = async (givingType: { id: string, name: string }) => {
    if (confirm(`Are you sure you want to delete the giving type "${givingType.name}"?`)) {
      try {
        const response = await fetch(`/api/giving-types?id=${givingType.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchGivingTypes();
          toast({
            title: "Success",
            description: "Giving type deleted successfully.",
          });
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


  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
          <title>Members Report</title>
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
          <div class="header">Members</div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Network</th>
                <th class="date">Join Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredMembers.map(member => `
                <tr>
                  <td>${member.name}</td>
                  <td>${member.email}</td>
                  <td>${member.phone}</td>
                  <td>${member.address}</td>
                  <td>${member.network}</td>
                  <td class="date">${isClient ? new Date(member.joinDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'UTC'
      }) : ''}</td>
                </tr>
              `).join('')}
            </tbody>
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
    const headers = ['Name', 'Email', 'Phone', 'Address', 'Network', 'Join Date'];
    const rows = filteredMembers.map(member => [
      `"${member.name.replace(/"/g, '""')}"`,
      member.email,
      member.phone,
      `"${member.address.replace(/"/g, '""')}"`,
      member.network,
      isClient ? new Date(member.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }) : ''
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "members_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Name", "Email", "Phone", "Network", "Join Date"];
    const tableRows: string[][] = [];

    filteredMembers.forEach(member => {
      const memberData = [
        member.name,
        member.email,
        member.phone,
        member.network,
        isClient ? new Date(member.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }) : ''
      ];
      tableRows.push(memberData);
    });

    doc.text("Members List", 14, 15);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save('members_list.pdf');
  };

  if (authContext?.user && !authContext.user.permissions?.members) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-64" />
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
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-20" />
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
              <CardTitle>Members</CardTitle>
              <CardDescription>Manage church members and their information.</CardDescription>
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
              <Button onClick={handleAddNewMember}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Member
              </Button>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by member name..."
              className="w-full rounded-lg bg-background pl-8 pr-4 md:w-[200px] lg:w-[320px]"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{member.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{member.email}</div>
                    <div className="text-sm text-muted-foreground">{member.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{member.network}</Badge>
                  </TableCell>
                  <TableCell>{isClient ? new Date(member.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }) : ''}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditMember(member)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddDonation(member)}>
                          <HandCoins className="mr-2 h-4 w-4" />
                          Add Donation
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteMember(member.id)}>
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
        {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  // If we have more than 5 pages, we might need a smarter logic here, 
                  // but sticking to the original logic of showing first 5 for now as per original code context,
                  // or adjusting to show a window around current page if preferred.
                  // The original code just showed first 5 pages max: Array.from({ length: Math.min(totalPages, 5) }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        href="#" 
                        isActive={currentPage === pageNum}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
        )}
      </Card>

      <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Edit Member' : 'New Member'}</DialogTitle>
            <DialogDescription>
              {editingMember ? "Update the member's details." : "Add a new member to the directory."}
            </DialogDescription>
          </DialogHeader>
          <MemberForm
            member={editingMember}
            onSave={handleSaveMember}
            onCancel={() => setIsMemberDialogOpen(false)}
            networks={networks}
            onManageNetworkClick={() => setIsManageNetworksDialogOpen(true)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isNetworkDialogOpen} onOpenChange={setIsNetworkDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingNetwork ? 'Edit Network' : 'Add New Network'}</DialogTitle>
            <DialogDescription>
              {editingNetwork ? 'Update the network name.' : 'Create a new network group for your members.'}
            </DialogDescription>
          </DialogHeader>
          <AddNetworkForm
            key={editingNetwork?.id || 'new'}
            onSave={handleSaveNetwork}
            onCancel={() => {
              setIsNetworkDialogOpen(false);
              setEditingNetwork(null);
            }}
            initialValue={editingNetwork?.name || ''}
            isEdit={!!editingNetwork}
          />
        </DialogContent>
      </Dialog>

      {donatingMember && (
        <Dialog open={isDonationDialogOpen} onOpenChange={setIsDonationDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Record Giving</DialogTitle>
              <DialogDescription>
                Record a new contribution for {donatingMember.name}.
              </DialogDescription>
            </DialogHeader>
            <DonationForm
              member={donatingMember}
              onSave={handleSaveDonation}
              onCancel={() => setIsDonationDialogOpen(false)}
              serviceTimes={serviceTimes}
              categories={categories}
              givingTypes={givingTypes}
              onManageServiceTimeClick={() => setIsManageServiceTimesDialogOpen(true)}
              onManageCategoryClick={() => setIsManageCategoriesDialogOpen(true)}
              onManageGivingTypeClick={() => setIsManageGivingTypesDialogOpen(true)}
            />
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isServiceTimeDialogOpen} onOpenChange={setIsServiceTimeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingServiceTime ? 'Edit Service Time' : 'Add New Service Time'}</DialogTitle>
            <DialogDescription>
              {editingServiceTime ? 'Update the service time.' : 'Create a new service time for donations.'}
            </DialogDescription>
          </DialogHeader>
          <AddServiceTimeForm
            key={editingServiceTime?.id || 'new'}
            onSave={handleSaveServiceTime}
            onCancel={() => {
              setIsServiceTimeDialogOpen(false);
              setEditingServiceTime(null);
            }}
            initialValue={editingServiceTime?.time || ''}
            isEdit={!!editingServiceTime}
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
            key={editingCategory?.id || 'new'}
            onSave={handleSaveCategory}
            onCancel={() => {
              setIsCategoryDialogOpen(false);
              setEditingCategory(null);
            }}
            initialValue={editingCategory?.name || ''}
            isEdit={!!editingCategory}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isManageNetworksDialogOpen} onOpenChange={setIsManageNetworksDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Networks</DialogTitle>
            <DialogDescription>
              View, edit, or delete member networks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleAddNewNetwork}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Network
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search networks..."
                className="w-full rounded-lg bg-background pl-8"
                value={networksSearchQuery}
                onChange={(e) => setNetworksSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {networks
                .filter(network => network.name.toLowerCase().includes(networksSearchQuery.toLowerCase()))
                .map((network) => (
                  <div key={network.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{network.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditNetwork(network)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteNetwork(network)}
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
              setIsManageNetworksDialogOpen(false);
              setNetworksSearchQuery('');
            }}>
              Close
            </Button>
          </DialogFooter>
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
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category)}
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
                        onClick={() => handleEditServiceTime(serviceTime)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteServiceTime(serviceTime)}
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
                .filter(givingType => givingType.name.toLowerCase().includes(givingTypesSearchQuery.toLowerCase()))
                .map((givingType) => (
                  <div key={givingType.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{givingType.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditGivingType(givingType)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteGivingType(givingType)}
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
            initialValue={editingGivingType ? editingGivingType.name : ''}
            isEdit={!!editingGivingType}
          />
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}

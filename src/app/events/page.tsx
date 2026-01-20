'use client';
import React, { useState, useContext, useEffect } from 'react';
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
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Calendar as CalendarIcon, MapPin, Plus } from 'lucide-react';
import type { Event, Resource } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Define a UI-specific Event type where date is a Date object, not a string
interface UIEvent extends Omit<Event, 'date'> {
  date: Date;
}

const EventForm = ({
  onSave,
  onCancel,
  resources,
  onAddResource
}: {
  onSave: (event: UIEvent) => void,
  onCancel: () => void,
  resources: Resource[],
  onAddResource: () => void
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [resource, setResource] = useState<string>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !resource) {
      alert('Please fill all required fields');
      return;
    }
    const newEvent: UIEvent = {
      id: `e${Date.now()}`,
      title,
      description,
      date,
      resource: resource!,
      time: '',
      location: '',
      attendees: []
    };
    onSave(newEvent);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right">Date</Label>
          <Input id="date" type="date" onChange={(e) => setDate(new Date(e.target.value))} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="resource" className="text-right">Resource</Label>
          <div className="col-span-3 flex gap-2">
            <Select onValueChange={(value) => {
              if (value === 'add_new') {
                onAddResource();
              } else {
                setResource(value);
              }
            }} value={resource}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a resource" />
              </SelectTrigger>
              <SelectContent>
                {resources.map((res) => (
                  <SelectItem key={res.id} value={res.name}>{res.name}</SelectItem>
                ))}
                <SelectItem value="add_new" className="font-semibold text-primary">
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add New Resource
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="description" className="text-right pt-2">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Schedule Event</Button>
      </DialogFooter>
    </form>
  );
};


export default function EventsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<UIEvent[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [newResourceName, setNewResourceName] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const authContext = useContext(AuthContext);
  const router = useRouter();

  // Check permissions
  useEffect(() => {
    if (authContext?.user && !authContext.user.permissions?.events) {
      router.push('/dashboard');
    }
  }, [authContext, router]);

  const hasPermission = authContext?.user?.permissions?.events;

  useEffect(() => {
    fetchEvents();
    fetchResources();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        // Convert date strings to Date objects
        const eventsWithDates: UIEvent[] = data.map((event: any) => ({
          ...event,
          date: new Date(event.date),
          resource: event.resource || '',
          location: event.location || '',
          time: event.time || '',
          attendees: event.attendees || []
        }));
        setEvents(eventsWithDates);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources');
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    }
  };

  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const handleSaveEvent = async (event: UIEvent) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (response.ok) {
        fetchEvents();
        setIsDialogOpen(false);
        toast({
          title: "Event Scheduled",
          description: `${event.title} has been added to the calendar.`,
        });
      } else {
        alert('Failed to schedule event');
      }
    } catch (error) {
      console.error('Error scheduling event:', error);
      alert('Error scheduling event');
    }
  };

  const handleSaveResource = async () => {
    if (!newResourceName.trim()) return;

    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newResourceName }),
      });

      if (response.ok) {
        fetchResources();
        setIsResourceDialogOpen(false);
        setNewResourceName('');
        toast({
          title: "Resource Added",
          description: `${newResourceName} has been added.`,
        });
      } else {
        alert('Failed to add resource');
      }
    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Error adding resource');
    }
  };


  if (loading) {
    return (
      <AppLayout>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>View and manage all scheduled events.</CardDescription>
                  </div>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Schedule Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="flex items-start gap-4 p-4 shadow-sm">
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-96" />
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="p-0">
                <Skeleton className="h-80 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {hasPermission ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Upcoming Events
                      {upcomingEvents.length > 0 && (
                        <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs font-normal">
                          {upcomingEvents.length}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>View and manage all scheduled events.</CardDescription>
                  </div>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Schedule Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => {
                    const isToday = new Date().toDateString() === event.date.toDateString();
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const isTomorrow = tomorrow.toDateString() === event.date.toDateString();

                    return (
                      <Card key={event.id} className="flex items-start gap-4 p-4 shadow-sm">
                        <div className="flex flex-col items-center justify-center rounded-md bg-secondary p-3">
                          <div className="text-sm font-semibold">
                            {event.date.toLocaleString('en-US', { month: 'short' })}
                          </div>
                          <div className="text-2xl font-bold">
                            {event.date.getDate()}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {event.title}
                            {isToday && <Badge className="bg-green-500 hover:bg-green-600">Today</Badge>}
                            {isTomorrow && <Badge variant="outline" className="text-blue-500 border-blue-200">Tomorrow</Badge>}
                          </h3>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {event.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.resource}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground">No upcoming events.</p>
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="w-full"
                  classNames={{
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary/90",
                    day_today: "bg-accent text-accent-foreground",
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p>You do not have permission to access this page.</p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Schedule a New Event</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new event to the calendar.
            </DialogDescription>
          </DialogHeader>
          <EventForm
            onSave={handleSaveEvent}
            onCancel={() => setIsDialogOpen(false)}
            resources={resources}
            onAddResource={() => setIsResourceDialogOpen(true)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Resource</DialogTitle>
            <DialogDescription>
              Enter the name of the new resource/venue.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="resourceName" className="text-right">Name</Label>
              <Input
                id="resourceName"
                value={newResourceName}
                onChange={(e) => setNewResourceName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsResourceDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveResource}>Save Resource</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

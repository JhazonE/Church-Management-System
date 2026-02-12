import {
  getAllServiceTimes,
  createServiceTime,
  updateServiceTime,
  deleteServiceTime
} from '@/lib/database';

export class ServiceController {
  
  static async getAll() {
    try {
      return await getAllServiceTimes();
    } catch (error) {
      console.error('Error in ServiceController.getAll:', error);
      throw new Error('Failed to fetch service times');
    }
  }

  static async create(time: string) {
    if (!time || !time.trim()) {
      throw new Error('Service time is required');
    }

    try {
      const newServiceTime = {
        id: `st${Date.now()}`,
        time: time.trim()
      };

      await createServiceTime(newServiceTime);
      return newServiceTime;
    } catch (error) {
      console.error('Error in ServiceController.create:', error);
      throw new Error('Failed to create service time');
    }
  }

  static async update(id: string, time: string) {
    if (!id || !time || !time.trim()) {
      throw new Error('Service time ID and time are required');
    }

    try {
      const trimmedTime = time.trim();
      await updateServiceTime(id, trimmedTime);
      return { id, time: trimmedTime };
    } catch (error) {
      console.error('Error in ServiceController.update:', error);
      throw new Error('Failed to update service time');
    }
  }

  static async delete(id: string) {
    if (!id) {
      throw new Error('Service time ID is required');
    }

    try {
      await deleteServiceTime(id);
      return true;
    } catch (error) {
      console.error('Error in ServiceController.delete:', error);
      throw new Error('Failed to delete service time');
    }
  }
}

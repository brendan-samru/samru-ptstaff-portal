import { collection, addDoc, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AnalyticsEvent {
  userId: string;
  userRole: 'super_admin' | 'admin' | 'user';
  managerId?: string; // For tracking which manager's portal was accessed
  department?: string;
  eventType: 'view' | 'download' | 'click' | 'search';
  resourceId?: string;
  resourceType?: 'card' | 'document' | 'video' | 'pdf';
  resourceTitle?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalDownloads: number;
  totalClicks: number;
  uniqueUsers: number;
  topResources: Array<{
    id: string;
    title: string;
    views: number;
    downloads: number;
  }>;
  activityByDay: Array<{
    date: string;
    views: number;
    downloads: number;
  }>;
}

class AnalyticsService {
  private collectionName = 'analytics';

  /**
   * Track an analytics event
   */
  async trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    try {
      await addDoc(collection(db, this.collectionName), {
        ...event,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      // Don't throw - analytics failures shouldn't break the app
    }
  }

  /**
   * Track a page view
   */
  async trackView(
    userId: string,
    userRole: 'super_admin' | 'admin' | 'user',
    resourceId?: string,
    resourceTitle?: string,
    managerId?: string,
    department?: string
  ): Promise<void> {
    await this.trackEvent({
      userId,
      userRole,
      managerId,
      department,
      eventType: 'view',
      resourceId,
      resourceTitle,
      resourceType: 'card',
    });
  }

  /**
   * Track a document download
   */
  async trackDownload(
    userId: string,
    userRole: 'super_admin' | 'admin' | 'user',
    resourceId: string,
    resourceTitle: string,
    resourceType: 'document' | 'video' | 'pdf',
    managerId?: string,
    department?: string
  ): Promise<void> {
    await this.trackEvent({
      userId,
      userRole,
      managerId,
      department,
      eventType: 'download',
      resourceId,
      resourceTitle,
      resourceType,
    });
  }

  /**
   * Track a click event
   */
  async trackClick(
    userId: string,
    userRole: 'super_admin' | 'admin' | 'user',
    resourceId: string,
    resourceTitle: string,
    managerId?: string,
    department?: string
  ): Promise<void> {
    await this.trackEvent({
      userId,
      userRole,
      managerId,
      department,
      eventType: 'click',
      resourceId,
      resourceTitle,
    });
  }

  /**
   * Get analytics summary for a specific manager
   */
  async getManagerAnalytics(
    managerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AnalyticsSummary> {
    try {
      const analyticsRef = collection(db, this.collectionName);
      let q = query(
        analyticsRef,
        where('managerId', '==', managerId),
        orderBy('timestamp', 'desc')
      );

      if (startDate) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(startDate)));
      }
      if (endDate) {
        q = query(q, where('timestamp', '<=', Timestamp.fromDate(endDate)));
      }

      const snapshot = await getDocs(q);
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (AnalyticsEvent & { id: string })[];

      return this.calculateSummary(events);
    } catch (error) {
      console.error('Error fetching manager analytics:', error);
      return this.emptySummary();
    }
  }

  /**
   * Get analytics summary for all managers (Super Admin view)
   */
  async getAllManagersAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<Map<string, AnalyticsSummary>> {
    try {
      const analyticsRef = collection(db, this.collectionName);
      let q = query(
        analyticsRef,
        where('managerId', '!=', null),
        orderBy('managerId'),
        orderBy('timestamp', 'desc')
      );

      if (startDate) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(startDate)));
      }
      if (endDate) {
        q = query(q, where('timestamp', '<=', Timestamp.fromDate(endDate)));
      }

      const snapshot = await getDocs(q);
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (AnalyticsEvent & { id: string })[];

      // Group by managerId
      const groupedByManager = new Map<string, (AnalyticsEvent & { id: string })[]>();
      events.forEach(event => {
        if (event.managerId) {
          if (!groupedByManager.has(event.managerId)) {
            groupedByManager.set(event.managerId, []);
          }
          groupedByManager.get(event.managerId)!.push(event);
        }
      });

      // Calculate summary for each manager
      const summaries = new Map<string, AnalyticsSummary>();
      groupedByManager.forEach((events, managerId) => {
        summaries.set(managerId, this.calculateSummary(events));
      });

      return summaries;
    } catch (error) {
      console.error('Error fetching all managers analytics:', error);
      return new Map();
    }
  }

  /**
   * Calculate summary statistics from events
   */
  private calculateSummary(events: (AnalyticsEvent & { id: string })[]): AnalyticsSummary {
    const uniqueUsers = new Set(events.map(e => e.userId)).size;
    const totalViews = events.filter(e => e.eventType === 'view').length;
    const totalDownloads = events.filter(e => e.eventType === 'download').length;
    const totalClicks = events.filter(e => e.eventType === 'click').length;

    // Calculate top resources
    const resourceCounts = new Map<string, { title: string; views: number; downloads: number }>();
    events.forEach(event => {
      if (event.resourceId && event.resourceTitle) {
        if (!resourceCounts.has(event.resourceId)) {
          resourceCounts.set(event.resourceId, {
            title: event.resourceTitle,
            views: 0,
            downloads: 0
          });
        }
        const resource = resourceCounts.get(event.resourceId)!;
        if (event.eventType === 'view') resource.views++;
        if (event.eventType === 'download') resource.downloads++;
      }
    });

    const topResources = Array.from(resourceCounts.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (b.views + b.downloads) - (a.views + a.downloads))
      .slice(0, 10);

    // Calculate activity by day (last 30 days)
    const activityByDay = this.calculateDailyActivity(events);

    return {
      totalViews,
      totalDownloads,
      totalClicks,
      uniqueUsers,
      topResources,
      activityByDay
    };
  }

  /**
   * Calculate daily activity for the last 30 days
   */
  private calculateDailyActivity(events: (AnalyticsEvent & { id: string })[]): Array<{
    date: string;
    views: number;
    downloads: number;
  }> {
    const dailyActivity = new Map<string, { views: number; downloads: number }>();
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyActivity.set(dateStr, { views: 0, downloads: 0 });
    }

    // Count events by day
    events.forEach(event => {
      const dateStr = event.timestamp.toISOString().split('T')[0];
      if (dailyActivity.has(dateStr)) {
        const day = dailyActivity.get(dateStr)!;
        if (event.eventType === 'view') day.views++;
        if (event.eventType === 'download') day.downloads++;
      }
    });

    return Array.from(dailyActivity.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Return empty summary
   */
  private emptySummary(): AnalyticsSummary {
    return {
      totalViews: 0,
      totalDownloads: 0,
      totalClicks: 0,
      uniqueUsers: 0,
      topResources: [],
      activityByDay: []
    };
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// React hook for easy analytics tracking
export function useAnalytics() {
  return {
    trackView: analyticsService.trackView.bind(analyticsService),
    trackDownload: analyticsService.trackDownload.bind(analyticsService),
    trackClick: analyticsService.trackClick.bind(analyticsService),
    getManagerAnalytics: analyticsService.getManagerAnalytics.bind(analyticsService),
    getAllManagersAnalytics: analyticsService.getAllManagersAnalytics.bind(analyticsService),
  };
}

// Data services for connected apps
import OAuthService from './oauthService';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  attendees?: string[];
}

interface SlackMessage {
  id: string;
  text: string;
  user: string;
  timestamp: string;
  channel: string;
}

interface AsanaTask {
  id: string;
  name: string;
  completed: boolean;
  assignee?: string;
  dueDate?: string;
  project: string;
}

interface ZoomMeeting {
  id: string;
  topic: string;
  startTime: string;
  duration: number;
  participants?: number;
}

export class DataServices {
  // Google Calendar Service
  static async getGoogleCalendarEvents(timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    try {
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const params = new URLSearchParams({
        timeMin: timeMin || now.toISOString(),
        timeMax: timeMax || weekFromNow.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '50',
      });

      const response = await OAuthService.makeAuthenticatedRequest(
        'gcal',
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`
      );

      if (!response?.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const data = await response.json();
      
      return data.items?.map((event: any): CalendarEvent => ({
        id: event.id,
        title: event.summary || 'No title',
        start: event.start?.dateTime || event.start?.date || '',
        end: event.end?.dateTime || event.end?.date || '',
        description: event.description,
        location: event.location,
        attendees: event.attendees?.map((attendee: any) => attendee.email) || [],
      })) || [];
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      return [];
    }
  }

  // Microsoft Outlook Calendar Service
  static async getOutlookCalendarEvents(): Promise<CalendarEvent[]> {
    try {
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const params = new URLSearchParams({
        startDateTime: now.toISOString(),
        endDateTime: weekFromNow.toISOString(),
        $top: '50',
        $orderby: 'start/dateTime',
      });

      const response = await OAuthService.makeAuthenticatedRequest(
        'outlook',
        `https://graph.microsoft.com/v1.0/me/calendar/calendarView?${params}`
      );

      if (!response?.ok) {
        throw new Error('Failed to fetch Outlook calendar events');
      }

      const data = await response.json();
      
      return data.value?.map((event: any): CalendarEvent => ({
        id: event.id,
        title: event.subject || 'No title',
        start: event.start?.dateTime || '',
        end: event.end?.dateTime || '',
        description: event.bodyPreview,
        location: event.location?.displayName,
        attendees: event.attendees?.map((attendee: any) => attendee.emailAddress?.address) || [],
      })) || [];
    } catch (error) {
      console.error('Error fetching Outlook calendar events:', error);
      return [];
    }
  }

  // Slack Service
  static async getSlackChannels(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await OAuthService.makeAuthenticatedRequest(
        'slack',
        'https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=100'
      );

      if (!response?.ok) {
        throw new Error('Failed to fetch Slack channels');
      }

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Slack API error');
      }

      return data.channels?.map((channel: any) => ({
        id: channel.id,
        name: channel.name,
      })) || [];
    } catch (error) {
      console.error('Error fetching Slack channels:', error);
      return [];
    }
  }

  static async getSlackMessages(channelId: string, limit: number = 20): Promise<SlackMessage[]> {
    try {
      const response = await OAuthService.makeAuthenticatedRequest(
        'slack',
        `https://slack.com/api/conversations.history?channel=${channelId}&limit=${limit}`
      );

      if (!response?.ok) {
        throw new Error('Failed to fetch Slack messages');
      }

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Slack API error');
      }

      return data.messages?.map((message: any): SlackMessage => ({
        id: message.ts,
        text: message.text || '',
        user: message.user || '',
        timestamp: message.ts,
        channel: channelId,
      })) || [];
    } catch (error) {
      console.error('Error fetching Slack messages:', error);
      return [];
    }
  }

  // Asana Service
  static async getAsanaTasks(): Promise<AsanaTask[]> {
    try {
      // First get user's workspaces
      const workspacesResponse = await OAuthService.makeAuthenticatedRequest(
        'asana',
        'https://app.asana.com/api/1.0/workspaces'
      );

      if (!workspacesResponse?.ok) {
        throw new Error('Failed to fetch Asana workspaces');
      }

      const workspacesData = await workspacesResponse.json();
      const workspaceId = workspacesData.data?.[0]?.gid;

      if (!workspaceId) {
        return [];
      }

      // Get tasks assigned to the user
      const tasksResponse = await OAuthService.makeAuthenticatedRequest(
        'asana',
        `https://app.asana.com/api/1.0/tasks?assignee=me&workspace=${workspaceId}&completed_since=now&limit=50`
      );

      if (!tasksResponse?.ok) {
        throw new Error('Failed to fetch Asana tasks');
      }

      const tasksData = await tasksResponse.json();

      return tasksData.data?.map((task: any): AsanaTask => ({
        id: task.gid,
        name: task.name || 'Untitled task',
        completed: task.completed || false,
        assignee: task.assignee?.name,
        dueDate: task.due_on,
        project: task.projects?.[0]?.name || 'No project',
      })) || [];
    } catch (error) {
      console.error('Error fetching Asana tasks:', error);
      return [];
    }
  }

  // Zoom Service
  static async getZoomMeetings(): Promise<ZoomMeeting[]> {
    try {
      const response = await OAuthService.makeAuthenticatedRequest(
        'zoom',
        'https://api.zoom.us/v2/users/me/meetings?type=scheduled&page_size=30'
      );

      if (!response?.ok) {
        throw new Error('Failed to fetch Zoom meetings');
      }

      const data = await response.json();

      return data.meetings?.map((meeting: any): ZoomMeeting => ({
        id: meeting.id.toString(),
        topic: meeting.topic || 'No topic',
        startTime: meeting.start_time,
        duration: meeting.duration || 0,
        participants: meeting.participants?.length || 0,
      })) || [];
    } catch (error) {
      console.error('Error fetching Zoom meetings:', error);
      return [];
    }
  }

  // Combined data aggregation
  static async getAllCalendarEvents(): Promise<CalendarEvent[]> {
    try {
      const [googleEvents, outlookEvents] = await Promise.allSettled([
        this.getGoogleCalendarEvents(),
        this.getOutlookCalendarEvents(),
      ]);

      const allEvents: CalendarEvent[] = [];

      if (googleEvents.status === 'fulfilled') {
        allEvents.push(...googleEvents.value);
      }

      if (outlookEvents.status === 'fulfilled') {
        allEvents.push(...outlookEvents.value);
      }

      // Sort by start time
      return allEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    } catch (error) {
      console.error('Error aggregating calendar events:', error);
      return [];
    }
  }

  // Get user's productivity summary
  static async getProductivitySummary(): Promise<{
    upcomingEvents: number;
    pendingTasks: number;
    scheduledMeetings: number;
    recentMessages: number;
  }> {
    try {
      const [events, tasks, meetings, channels] = await Promise.allSettled([
        this.getAllCalendarEvents(),
        this.getAsanaTasks(),
        this.getZoomMeetings(),
        this.getSlackChannels(),
      ]);

      return {
        upcomingEvents: events.status === 'fulfilled' ? events.value.length : 0,
        pendingTasks: tasks.status === 'fulfilled' ? tasks.value.filter(t => !t.completed).length : 0,
        scheduledMeetings: meetings.status === 'fulfilled' ? meetings.value.length : 0,
        recentMessages: channels.status === 'fulfilled' ? channels.value.length : 0,
      };
    } catch (error) {
      console.error('Error getting productivity summary:', error);
      return {
        upcomingEvents: 0,
        pendingTasks: 0,
        scheduledMeetings: 0,
        recentMessages: 0,
      };
    }
  }

  // Health data (for Apple Health/Google Fit integration)
  static async getHealthSummary(): Promise<{
    steps: number;
    activeMinutes: number;
    heartRate?: number;
  }> {
    // This would integrate with HealthKit on iOS or Google Fit
    // For now, return mock data
    return {
      steps: 8500,
      activeMinutes: 45,
      heartRate: 72,
    };
  }
}

export default DataServices; 
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserPreferences {
  lastActivePage?: string;
  lastVisitedAt?: string; // ISO date string
  preferredView?: 'dashboard' | 'workouts' | 'goals' | 'schedule';
}

/**
 * Get user preferences from Firestore
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const prefsRef = doc(db, 'users', userId, 'preferences', 'main');
    const prefsSnap = await getDoc(prefsRef);
    
    if (prefsSnap.exists()) {
      return prefsSnap.data() as UserPreferences;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
}

/**
 * Save user preferences to Firestore
 */
export async function saveUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> {
  try {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('Invalid user ID provided');
    }

    // Filter out undefined values - Firestore doesn't allow undefined
    const cleanPreferences: Record<string, any> = {};
    Object.entries(preferences).forEach(([key, value]) => {
      // Only include defined values (not undefined or null for optional fields)
      // For optional string fields, we still want to save null if explicitly set
      if (value !== undefined) {
        cleanPreferences[key] = value;
      }
    });

    // Always update lastVisitedAt
    cleanPreferences.lastVisitedAt = new Date().toISOString();

    const prefsRef = doc(db, 'users', userId, 'preferences', 'main');
    await setDoc(prefsRef, cleanPreferences, { merge: true });
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw error;
  }
}

/**
 * Track user activity/event
 */
export interface UserActivity {
  type: 'page_view' | 'workout_completed' | 'goal_created' | 'weight_logged' | 'schedule_updated' | 'settings_changed';
  page?: string;
  metadata?: Record<string, any>;
  timestamp: string; // ISO date string
}

export async function logUserActivity(
  userId: string,
  activity: Omit<UserActivity, 'timestamp'>
): Promise<void> {
  try {
    // Store in a subcollection for activity tracking
    const activityRef = doc(db, 'users', userId, 'activity', `${Date.now()}_${activity.type}`);
    await setDoc(activityRef, {
      ...activity,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging user activity:', error);
    // Don't throw - activity logging should not break the app
  }
}


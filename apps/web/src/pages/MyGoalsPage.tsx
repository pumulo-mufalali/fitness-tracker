import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/auth-provider';
import { getUserGoals, createGoal, updateGoal, deleteGoal } from '../lib/firebase-goal-service';
import { logUserActivity } from '../lib/firebase-user-preferences-service';
import { useToast } from '../providers/toast-provider';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { Goal } from '@myfitness/shared';

export default function MyGoalsPage({ onBack }: { onBack?: () => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccess } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    target: 0,
    current: 0,
    unit: '',
    category: 'weight' as const,
    deadline: '',
  });

  // Fetch goals from Firebase
  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ['goals', user?.uid],
    queryFn: () => getUserGoals(user!.uid),
    enabled: !!user?.uid,
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: (goalData: Omit<Goal, 'id'>) => createGoal(user!.uid, goalData),
    onSuccess: (newGoal) => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.uid] });
      // Log activity
      if (user?.uid) {
        logUserActivity(user.uid, {
          type: 'goal_created',
          metadata: { goalId: newGoal.id, title: newGoal.title, target: newGoal.target },
        });
      }
      handleCloseModal();
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: ({ goalId, updates }: { goalId: string; updates: Partial<Omit<Goal, 'id' | 'createdAt'>> }) =>
      updateGoal(user!.uid, goalId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.uid] });
      // Log activity
      if (user?.uid) {
        logUserActivity(user.uid, {
          type: 'goal_created', // Using goal_created for updates too
          metadata: { goalId: variables.goalId, ...variables.updates },
        });
      }
      handleCloseModal();
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: (goalId: string) => deleteGoal(user!.uid, goalId),
    onSuccess: (_, goalId) => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.uid] });
      showSuccess('Goal deleted successfully!');
      setShowDeleteConfirm(false);
      setGoalToDelete(null);
      // Log activity
      if (user?.uid) {
        logUserActivity(user.uid, {
          type: 'goal_created', // Using goal_created for deletes too
          metadata: { goalId, action: 'deleted' },
        });
      }
    },
  });

  const handleAddGoal = () => {
    setFormData({
      title: '',
      target: 0,
      current: 0,
      unit: '',
      category: 'weight',
      deadline: '',
    });
    setEditGoal(null);
    setShowModal(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setFormData({
      title: goal.title,
      target: goal.target,
      current: goal.current,
      unit: goal.unit,
      category: 'weight', // Always set to weight
      deadline: goal.deadline,
    });
    setEditGoal(goal);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditGoal(null);
    setFormData({
      title: '',
      target: 0,
      current: 0,
      unit: '',
      category: 'weight',
      deadline: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editGoal) {
      updateGoalMutation.mutate({ goalId: editGoal.id, updates: formData });
    } else {
      createGoalMutation.mutate(formData);
    }
  };

  const handleDelete = (goalId: string) => {
    setGoalToDelete(goalId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (goalToDelete) {
      deleteGoalMutation.mutate(goalToDelete);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My weight goals</h1>
        <button 
          className="px-6 py-3  bg-blue-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-sm transform hover:-translate-y-0.5" 
          onClick={handleAddGoal}
        >
          + Add Goal
        </button>
      </div>
      
      {goals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">No goals yet. Click "Add Goal" to create your first goal!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map(goal => {
            const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
            const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return (
              <div key={goal.id} className="p-6 bg-white dark:bg-gray-800  shadow-sm border border-gray-200 dark:border-gray-700 space-y-4 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-bold text-xl text-gray-900 dark:text-white">{goal.title}</h2>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="p-2  bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300 transition-all duration-200" 
                      title="Edit Goal" 
                      onClick={() => handleEditGoal(goal)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button 
                      className="p-2  bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-300 transition-all duration-200" 
                      title="Delete Goal" 
                      onClick={() => handleDelete(goal.id)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{goal.current}{goal.unit}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">of {goal.target}{goal.unit}</div>
                  <div className="ml-auto text-lg font-semibold text-blue-600 dark:text-blue-400">{progress}%</div>
                </div>
                <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {daysLeft > 0 ? `${daysLeft} days remaining` : 'Deadline passed'}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4 pb-4">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseModal} />
          <div className="relative bg-white dark:bg-gray-800  p-6 shadow-md w-full max-w-md max-h-[calc(100vh-4rem)] overflow-y-auto border border-gray-200 dark:border-gray-700 mt-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {editGoal ? 'Edit Goal' : 'Add Goal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full px-4 py-3  border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Goal Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <input
                className="w-full px-4 py-3  border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Target"
                type="number"
                value={formData.target || ''}
                onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                required
              />
              <input
                className="w-full px-4 py-3  border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Current"
                type="number"
                value={formData.current || ''}
                onChange={(e) => setFormData({ ...formData, current: Number(e.target.value) })}
                required
              />
              <input
                className="w-full px-4 py-3  border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
              <input
                className="w-full px-4 py-3  border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" className="px-6 py-3  bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="px-6 py-3  bg-blue-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-sm" disabled={createGoalMutation.isPending || updateGoalMutation.isPending}>
                  {createGoalMutation.isPending || updateGoalMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setGoalToDelete(null);
        }}
      />
    </div>
  );
}

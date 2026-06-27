export interface Exercise {
  id: string;
  name: string;
  imageUrl: string;
}

export interface ExerciseCategory {
  category: string;
  exercises: Exercise[];
}

export const exerciseCategories: ExerciseCategory[] = [
  {
    category: 'Cardio',
    exercises: [
      { id: 'ex1', name: 'Overhead Reach', imageUrl: '/exercises/ex1.gif' },
      { id: 'ex2', name: 'Jumping Jacks', imageUrl: '/exercises/ex2.gif' },
      { id: 'ex3', name: 'Ice Skaters', imageUrl: '/exercises/ex3.gif' },
      { id: 'ex4', name: 'Toe Taps With Reach', imageUrl: '/exercises/ex4.gif' },
    ]
  },
  {
    category: 'Arms',
    exercises: [
      { id: 'ex5', name: 'Tricep Box Dips', imageUrl: '/exercises/ex5.gif' },
      { id: 'ex6', name: 'Elevated Push Ups', imageUrl: '/exercises/ex6.gif' },
      { id: 'ex7', name: 'Diamond Push Ups', imageUrl: '/exercises/ex7.gif' },
      { id: 'ex8', name: 'Plank With T Rotation', imageUrl: '/exercises/ex8.gif' },
    ]
  },
  {
    category: 'Legs',
    exercises: [
      { id: 'ex9', name: 'Barbell Back Squat', imageUrl: '/exercises/ex9.webp' },
      { id: 'ex10', name: 'Romanian Deadlift', imageUrl: '/exercises/ex10.webp' },
      { id: 'ex11', name: 'Walking Lunges', imageUrl: '/exercises/ex11.webp' },
      { id: 'ex12', name: 'Standing Calf Raise', imageUrl: '/exercises/ex12.webp' },
    ]
  },
  {
    category: 'Abs',
    exercises: [
      { id: 'ex13', name: 'Crunches', imageUrl: '/exercises/ex13.gif' },
      { id: 'ex14', name: 'Russian Twist', imageUrl: '/exercises/ex14.gif' },
      { id: 'ex15', name: 'Side Jack-Knife', imageUrl: '/exercises/ex15.gif' },
      { id: 'ex16', name: 'Jack-knife ', imageUrl: '/exercises/ex16.gif' },
    ]
  },
  {
    category: 'Stretches',
    exercises: [
      { id: 'ex17', name: 'Yoga Flow', imageUrl: '/exercises/ex17.gif' },
      { id: 'ex18', name: 'Hamstring Stretch', imageUrl: '/exercises/ex18.gif' },
      { id: 'ex19', name: 'Shoulder Stretch', imageUrl: '/exercises/ex19.gif' },
      { id: 'ex20', name: 'Neck Stretch', imageUrl: '/exercises/ex20.gif' },
    ]
  },
];

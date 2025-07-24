import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Child = {
  id: number;
  name: string;
  dob: string;
  photoUri?: string;
};

export type ActivityType = 'feeding' | 'sleep' | 'diaper' | 'bath' | 'water';

export type Activity = {
  id: number;
  childId: number;
  type: ActivityType;
  time: string; // ISO
  details?: string;
  amount?: number;
};

interface AppStateValue {
  children: Child[];
  addChild: (child: Omit<Child, 'id'>) => void;
  updateChild: (child: Child) => void;
  removeChild: (id: number) => void;
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id'>) => void;
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

let childIdCounter = 3;
let activityIdCounter = 1;

export const AppStateProvider = ({ children: node }: { children: ReactNode }) => {
  const [children, setChildren] = useState<Child[]>([
    { id: 1, name: 'Аня', dob: '2023-01-15' },
    { id: 2, name: 'Миша', dob: '2021-09-03' },
  ]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const addChild = (child: Omit<Child, 'id'>) => {
    setChildren(prev => [...prev, { ...child, id: childIdCounter++ }]);
  };
  const updateChild = (child: Child) => {
    setChildren(prev => prev.map(c => (c.id === child.id ? child : c)));
  };
  const removeChild = (id: number) => {
    setChildren(prev => prev.filter(c => c.id !== id));
    setActivities(prev => prev.filter(a => a.childId !== id));
  };
  const addActivity = (activity: Omit<Activity, 'id'>) => {
    setActivities(prev => [...prev, { ...activity, id: activityIdCounter++ }]);
  };

  return (
    <AppStateContext.Provider value={{ children, addChild, updateChild, removeChild, activities, addActivity }}>
      {node}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}; 
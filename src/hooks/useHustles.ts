import { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

export interface Hustle {
  id: string;
  title: string;
  description: string;
  category: 'job' | 'internship' | 'project' | 'tutoring' | 'other';
  postedBy: string;
  contactEmail?: string;
  createdAt: string;
}

interface UseHustlesReturn {
  hustles: Hustle[];
  loading: boolean;
  addHustle: (hustle: Omit<Hustle, 'id' | 'createdAt'>) => Promise<void>;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
}

const generateMockHustles = (): Hustle[] => {
  const mockData: Hustle[] = [
    {
      id: 'hustle-1',
      title: 'React Developer Needed',
      description: 'Looking for a React developer to help build a startup MVP. Flexible hours, competitive pay.',
      category: 'job',
      postedBy: 'TechStartup23',
      contactEmail: 'hire@startup.com',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'hustle-2',
      title: 'Math Tutor Available',
      description: 'Offering calculus and linear algebra tutoring. $25/hour. 3+ years experience.',
      category: 'tutoring',
      postedBy: 'MathGenius',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'hustle-3',
      title: 'Summer Internship - Marketing',
      description: 'Local marketing agency seeking summer intern. Great for business majors!',
      category: 'internship',
      postedBy: 'MarketingPro',
      contactEmail: 'internships@agency.com',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'hustle-4',
      title: 'Open Source Project Contributors',
      description: 'Join our student-led open source project. Learn, collaborate, build your portfolio.',
      category: 'project',
      postedBy: 'OpenSourceCrew',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
  return mockData;
};

export function useHustles(): UseHustlesReturn {
  const [hustles, setHustles] = useState<Hustle[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { success, error } = useNotification();

  useEffect(() => {
    const fetchHustles = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setHustles(generateMockHustles());
      setLoading(false);
    };

    fetchHustles();
  }, []);

  const addHustle = async (hustleData: Omit<Hustle, 'id' | 'createdAt'>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newHustle: Hustle = {
        ...hustleData,
        id: `hustle-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      setHustles(prev => [newHustle, ...prev]);
      success('Hustle posted successfully!');
    } catch (err) {
      error('Failed to post hustle. Please try again.');
      throw err;
    }
  };

  const filteredHustles = categoryFilter === 'all' 
    ? hustles 
    : hustles.filter(h => h.category === categoryFilter);

  return { 
    hustles: filteredHustles, 
    loading, 
    addHustle, 
    categoryFilter, 
    setCategoryFilter 
  };
}

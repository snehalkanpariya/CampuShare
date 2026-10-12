// Pre-configured Student Personas for Gujarat Vidyapith CampuShare
// Enables seamless testing and live demonstration of the complete View -> Request -> Owner Receive -> Accept/Reject -> Notify flow.

export const DEMO_SENIOR = {
  id: 'user-senior-1',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@gvp.edu.in',
  enrollmentNumber: '21BTECH042',
  role: 'Senior (4th Year)',
  department: 'Computer Science & Engineering',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  verified: true,
  karmaPoints: 480
};

export const DEMO_JUNIOR = {
  id: 'user-junior-1',
  name: 'Aarav Shah',
  email: 'aarav.shah@gvp.edu.in',
  enrollmentNumber: '24BTECH015',
  role: 'Junior (1st Year)',
  department: 'Computer Engineering',
  avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  verified: true,
  karmaPoints: 120
};

export const DEMO_SENIOR_2 = {
  id: 'user-senior-2',
  name: 'Priya Patel',
  email: 'priya.patel@gvp.edu.in',
  enrollmentNumber: '22MCA019',
  role: 'Senior (3rd Year)',
  department: 'Master of Computer Applications (MCA)',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  verified: true,
  karmaPoints: 340
};

export const DEMO_USERS = [DEMO_SENIOR, DEMO_JUNIOR, DEMO_SENIOR_2];

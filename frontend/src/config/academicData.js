// Gujarat Vidyapith Academic Data & Hierarchy (Faculty -> Department -> Course -> Semester)

export const FACULTY_DEPARTMENT_MAP = {
  'Languages and Literature': ['Gujarati', 'Hindi', 'English'],
  'Social Science': [
    'Rural Economics',
    'History and Culture',
    'Sociology',
    'Gandhian Studies',
    'Social Work'
  ],
  'Education': ['Education', 'Yoga'],
  'Physical Education': ['Physical Education'],
  'Science': ['Microbiology', 'Food & Nutrition'],
  'Information, Communication and Technology': [
    'Computer Science',
    'Journalism and Mass Communication',
    'Library & Information Science'
  ],
  'Management and Commerce': ['Management', 'Commerce', 'Rural Studies']
};

export const COURSES = [
  // Computer Science / ICT
  { code: 'MCA', name: 'Master of Computer Applications', maxSemesters: 4, degreeType: 'PG', defaultDepartment: 'Computer Science' },
  { code: 'MSCIT', name: 'M.Sc. Information Technology', maxSemesters: 4, degreeType: 'PG', defaultDepartment: 'Computer Science' },
  { code: 'BCA', name: 'Bachelor of Computer Applications', maxSemesters: 6, degreeType: 'UG', defaultDepartment: 'Computer Science' },
  { code: 'PGDCA', name: 'Post Graduate Diploma in Computer Applications', maxSemesters: 2, degreeType: 'DIPLOMA', defaultDepartment: 'Computer Science' },
  { code: 'MJMC', name: 'Master of Journalism and Mass Communication', maxSemesters: 4, degreeType: 'PG', defaultDepartment: 'Journalism and Mass Communication' },
  { code: 'MLISC', name: 'Master of Library and Information Science', maxSemesters: 4, degreeType: 'PG', defaultDepartment: 'Library & Information Science' },

  // Management & Commerce
  { code: 'MBA', name: 'Master of Business Administration', maxSemesters: 4, degreeType: 'PG', defaultDepartment: 'Management' },
  { code: 'BBA', name: 'Bachelor of Business Administration', maxSemesters: 6, degreeType: 'UG', defaultDepartment: 'Management' },
  { code: 'MCOM', name: 'Master of Commerce', maxSemesters: 4, degreeType: 'PG', defaultDepartment: 'Commerce' },
  { code: 'BCOM', name: 'Bachelor of Commerce', maxSemesters: 6, degreeType: 'UG', defaultDepartment: 'Commerce' },
  { code: 'MRS', name: 'Master of Rural Studies', maxSemesters: 4, degreeType: 'PG', defaultDepartment: 'Rural Studies' },

  // Science
  { code: 'MSC', name: 'Master of Science', maxSemesters: 4, degreeType: 'PG', defaultDepartment: 'Microbiology' },
  { code: 'BSC', name: 'Bachelor of Science', maxSemesters: 6, degreeType: 'UG', defaultDepartment: 'Microbiology' },

  // Education & Physical Education
  { code: 'MED', name: 'Master of Education', maxSemesters: 4, degreeType: 'PG', defaultDepartment: 'Education' },
  { code: 'BED', name: 'Bachelor of Education', maxSemesters: 4, degreeType: 'UG', defaultDepartment: 'Education' },
  { code: 'BPED', name: 'Bachelor of Physical Education', maxSemesters: 4, degreeType: 'UG', defaultDepartment: 'Physical Education' },
  { code: 'MPED', name: 'Master of Physical Education', maxSemesters: 4, degreeType: 'PG', defaultDepartment: 'Physical Education' },

  // Languages & Social Sciences
  { code: 'MA', name: 'Master of Arts', maxSemesters: 4, degreeType: 'PG', defaultDepartment: 'Gujarati' },
  { code: 'BA', name: 'Bachelor of Arts', maxSemesters: 6, degreeType: 'UG', defaultDepartment: 'Gujarati' },
  { code: 'MSW', name: 'Master of Social Work', maxSemesters: 4, degreeType: 'PG', defaultDepartment: 'Social Work' },
  { code: 'BSW', name: 'Bachelor of Social Work', maxSemesters: 6, degreeType: 'UG', defaultDepartment: 'Social Work' },
  { code: 'LLB', name: 'Bachelor of Laws', maxSemesters: 6, degreeType: 'UG', defaultDepartment: 'History and Culture' },
  { code: 'PHP', name: 'Diploma in Panchayati Raj', maxSemesters: 2, degreeType: 'DIPLOMA', defaultDepartment: 'Rural Economics' }
];

export function getFacultyNames() {
  return Object.keys(FACULTY_DEPARTMENT_MAP);
}

export function getDepartmentsByFaculty(facultyName) {
  return FACULTY_DEPARTMENT_MAP[facultyName] || [];
}

export function getFacultyByDepartment(deptName) {
  for (const [faculty, depts] of Object.entries(FACULTY_DEPARTMENT_MAP)) {
    if (depts.includes(deptName)) {
      return faculty;
    }
  }
  return 'Information, Communication and Technology'; // Fallback
}

export function getCoursesByDepartment(deptName) {
  const filtered = COURSES.filter((c) => c.defaultDepartment === deptName);
  if (filtered.length > 0) return filtered;
  return COURSES; // Fallback to full list if no specific department match
}

export function getCourseByCode(code) {
  if (!code) return COURSES[0];
  const upper = code.toUpperCase().trim();
  return COURSES.find((c) => c.code === upper) || {
    code: upper,
    name: upper,
    maxSemesters: 4,
    degreeType: 'PG'
  };
}

export function isMasterCourse(courseCode) {
  const course = getCourseByCode(courseCode);
  if (!course) return false;
  return (
    course.degreeType === 'PG' ||
    course.name?.toLowerCase().includes('master') ||
    course.name?.toLowerCase().includes('m.sc') ||
    course.name?.toLowerCase().includes('m.') ||
    course.code?.toUpperCase().startsWith('M')
  );
}

export function getMaxSemestersForCourse(courseCode) {
  const course = getCourseByCode(courseCode);
  if (isMasterCourse(courseCode)) {
    return Math.max(course ? course.maxSemesters : 4, 4);
  }
  return course ? course.maxSemesters : 4;
}

export function getAvailableSemesters(courseCode, isSenior = false) {
  const maxSem = getMaxSemestersForCourse(courseCode);
  const isMaster = isMasterCourse(courseCode);
  const semesters = [];

  // All Master courses must display at least 4 semesters (1, 2, 3, 4)
  const totalSemesters = isMaster ? Math.max(maxSem, 4) : maxSem;

  // Always display all available semesters (Sem 1, 2, 3, 4...)
  for (let sem = 1; sem <= totalSemesters; sem++) {
    semesters.push(sem);
  }

  return semesters;
}

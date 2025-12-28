// Ghana Education Service (GES) class levels
export const CLASS_LEVELS = [
  { value: "creche", label: "Crèche" },
  { value: "nursery-1", label: "Nursery 1" },
  { value: "nursery-2", label: "Nursery 2" },
  { value: "kg-1", label: "KG 1" },
  { value: "kg-2", label: "KG 2" },
  { value: "basic-1", label: "Basic 1" },
  { value: "basic-2", label: "Basic 2" },
  { value: "basic-3", label: "Basic 3" },
  { value: "basic-4", label: "Basic 4" },
  { value: "basic-5", label: "Basic 5" },
  { value: "basic-6", label: "Basic 6" },
  { value: "jhs-1", label: "JHS 1" },
  { value: "jhs-2", label: "JHS 2" },
  { value: "jhs-3", label: "JHS 3" },
] as const;

// Ghana grading system for Basic Education
export const GRADING_SYSTEM = [
  { min: 80, max: 100, grade: "1", description: "Excellent", letter: "A" },
  { min: 70, max: 79, grade: "2", description: "Very Good", letter: "B+" },
  { min: 60, max: 69, grade: "3", description: "Good", letter: "B" },
  { min: 55, max: 59, grade: "4", description: "Credit", letter: "C+" },
  { min: 50, max: 54, grade: "5", description: "Credit", letter: "C" },
  { min: 45, max: 49, grade: "6", description: "Pass", letter: "D+" },
  { min: 40, max: 44, grade: "7", description: "Pass", letter: "D" },
  { min: 0, max: 39, grade: "8", description: "Fail", letter: "F" },
] as const;

// Common subjects in Ghana Basic Schools
export const DEFAULT_SUBJECTS = [
  { code: "ENG", name: "English Language" },
  { code: "MTH", name: "Mathematics" },
  { code: "SCI", name: "Integrated Science" },
  { code: "SOC", name: "Social Studies" },
  { code: "RME", name: "Religious and Moral Education" },
  { code: "ICT", name: "Information and Communication Technology" },
  { code: "CRA", name: "Creative Arts" },
  { code: "TWI", name: "Ghanaian Language (Twi)" },
  { code: "FRE", name: "French" },
  { code: "PHE", name: "Physical Education" },
  { code: "BDT", name: "Basic Design and Technology" },
] as const;

// Subject names array for easy use
export const SUBJECTS = DEFAULT_SUBJECTS.map(s => s.name);

// Ghana regions
export const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Eastern",
  "Central",
  "Northern",
  "Volta",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "Savannah",
  "North East",
  "Western North",
  "Oti",
] as const;

// Academic terms in Ghana
export const ACADEMIC_TERMS = [
  { value: "term-1", label: "Term 1", months: "September - December" },
  { value: "term-2", label: "Term 2", months: "January - April" },
  { value: "term-3", label: "Term 3", months: "May - July" },
] as const;

// Assessment types
export const ASSESSMENT_TYPES = [
  { value: "class-test", label: "Class Test", weight: 10 },
  { value: "assignment", label: "Assignment", weight: 10 },
  { value: "project", label: "Project Work", weight: 10 },
  { value: "mid-term", label: "Mid-Term Exam", weight: 20 },
  { value: "end-term", label: "End of Term Exam", weight: 50 },
] as const;

// Helper function to calculate grade from percentage
export function getGradeFromPercentage(percentage: number) {
  return GRADING_SYSTEM.find(
    (g) => percentage >= g.min && percentage <= g.max
  ) || GRADING_SYSTEM[GRADING_SYSTEM.length - 1];
}

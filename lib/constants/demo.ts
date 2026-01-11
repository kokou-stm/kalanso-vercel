// Demo student for MVP/testing
// Uses a fixed UUID for database consistency across all tables
export const DEMO_STUDENT = {
  id: "550e8400-e29b-41d4-a716-446655440000", // UUID for database
  student_code: "STU-2024-001", // Readable for display
  first_name: "Demo",
  last_name: "Student",
  email: "demo@kalanso.app",
} as const

export type DemoStudent = typeof DEMO_STUDENT

"use client"

import { useTranslation } from "@/lib/i18n/use-translation"
import type { Course } from "@/types/academic"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, Download, Mail, RotateCcw, Eye } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface Student {
  id: string
  name: string
  email: string
  enrollmentDate: Date
  progress: number
  currentClass: number
  currentSession: number
  masteryStatus: number
  lastActivity: Date
}

interface StudentsTabProps {
  course: Course
}

export function StudentsTab({ course }: StudentsTabProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())

  // Mock student data
  const students: Student[] = [
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@example.com",
      enrollmentDate: new Date("2024-01-15"),
      progress: 85,
      currentClass: 2,
      currentSession: 1,
      masteryStatus: 88,
      lastActivity: new Date("2024-01-20"),
    },
    {
      id: "2",
      name: "Bob Smith",
      email: "bob@example.com",
      enrollmentDate: new Date("2024-01-16"),
      progress: 45,
      currentClass: 1,
      currentSession: 3,
      masteryStatus: 42,
      lastActivity: new Date("2024-01-18"),
    },
    {
      id: "3",
      name: "Carol Williams",
      email: "carol@example.com",
      enrollmentDate: new Date("2024-01-14"),
      progress: 65,
      currentClass: 1,
      currentSession: 4,
      masteryStatus: 72,
      lastActivity: new Date("2024-01-21"),
    },
  ]

  const getMasteryColor = (mastery: number) => {
    if (mastery < 50) return "bg-red-500"
    if (mastery < 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getMasteryBadge = (mastery: number) => {
    if (mastery < 50)
      return (
        <Badge variant="destructive" className="text-xs">
          {t("academic.students.lowMastery")}
        </Badge>
      )
    if (mastery < 80)
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
          {t("academic.students.mediumMastery")}
        </Badge>
      )
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
        {t("academic.students.highMastery")}
      </Badge>
    )
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleStudent = (id: string) => {
    const newSelected = new Set(selectedStudents)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedStudents(newSelected)
  }

  const toggleAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set())
    } else {
      setSelectedStudents(new Set(filteredStudents.map((s) => s.id)))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{t("academic.students.title")}</h2>
          <p className="text-gray-600 mt-1">{t("academic.students.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="cursor-pointer bg-transparent">
            <UserPlus className="w-4 h-4 mr-2" />
            {t("academic.students.enrollStudents")}
          </Button>
          <Button variant="outline" className="cursor-pointer bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            {t("academic.students.exportProgress")}
          </Button>
          <Button variant="outline" className="cursor-pointer bg-transparent">
            <Mail className="w-4 h-4 mr-2" />
            {t("academic.students.sendAnnouncement")}
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t("academic.students.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedStudents.size > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{t("academic.students.selected", { count: selectedStudents.size })}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="cursor-pointer bg-transparent">
                <Mail className="w-4 h-4 mr-2" />
                {t("academic.students.sendMessage")}
              </Button>
              <Button size="sm" variant="outline" className="cursor-pointer bg-transparent">
                <RotateCcw className="w-4 h-4 mr-2" />
                {t("academic.students.resetProgress")}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Student Roster */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                    onChange={toggleAll}
                    className="cursor-pointer"
                  />
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">{t("academic.students.name")}</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">{t("academic.students.email")}</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">{t("academic.students.enrolled")}</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">{t("academic.students.progress")}</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">
                  {t("academic.students.currentLocation")}
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">{t("academic.students.mastery")}</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">
                  {t("academic.students.lastActivity")}
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">{t("academic.students.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedStudents.has(student.id)}
                      onChange={() => toggleStudent(student.id)}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{student.name}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{student.email}</td>
                  <td className="p-4 text-sm text-gray-600">{student.enrollmentDate.toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={cn("h-full transition-all", getMasteryColor(student.progress))}
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    {t("academic.structure.classNumber", { number: student.currentClass })} /{" "}
                    {t("academic.structure.sessionNumber", { number: student.currentSession })}
                  </td>
                  <td className="p-4">{getMasteryBadge(student.masteryStatus)}</td>
                  <td className="p-4 text-sm text-gray-600">{student.lastActivity.toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="cursor-pointer">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="cursor-pointer">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="cursor-pointer">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>{t("academic.students.noStudents")}</p>
        </div>
      )}
    </div>
  )
}

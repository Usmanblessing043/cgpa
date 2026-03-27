"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
type Course = {
  id: number;
  grade: string;
  unit: number;
};

type Semester = {
  id: string;
  name: string;
  courses: Course[];
};

type Level = {
  level: number;
  semesters: Semester[];
};
const gradeMap: Record<string, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

function calculateGPA(courses: any[]) {
  let totalPoints = 0;
  let totalUnits = 0;
  courses.forEach((c) => {
    totalPoints += gradeMap[c.grade] * c.unit;
    totalUnits += c.unit;
  });
  return totalUnits === 0 ? 0 : totalPoints / totalUnits;
}

const initialData: Level[] = [100, 200, 300, 400].map((level) => ({
  level,
  semesters: [
    { id: `${level}-1`, name: "First Semester", courses: [] },
    { id: `${level}-2`, name: "Second Semester", courses: [] },
  ],
}));

export default function Dashboard() {
  const [levels, setLevels] = useState<Level[]>(initialData);

  const addCourse = (levelIndex: number, semId: string) => {
    setLevels((prev) =>
      prev.map((lvl, i) =>
        i === levelIndex
          ? {
              ...lvl,
              semesters: lvl.semesters.map((sem) =>
                sem.id === semId
                  ? {
                      ...sem,
                      courses: [
                        ...sem.courses,
                        { id: Date.now(), grade: "A", unit: 1 },
                      ],
                    }
                  : sem
              ),
            }
          : lvl
      )
    );
  };

  const updateCourse = (
    levelIndex: number,
    semId: string,
    courseId: number,
    field: string,
    value: any
  ) => {
    setLevels((prev) =>
      prev.map((lvl, i) =>
        i === levelIndex
          ? {
              ...lvl,
              semesters: lvl.semesters.map((sem) =>
                sem.id === semId
                  ? {
                      ...sem,
                      courses: sem.courses.map((c) =>
                        c.id === courseId ? { ...c, [field]: value } : c
                      ),
                    }
                  : sem
              ),
            }
          : lvl
      )
    );
  };

  const removeCourse = (
    levelIndex: number,
    semId: string,
    courseId: number
  ) => {
    setLevels((prev) =>
      prev.map((lvl, i) =>
        i === levelIndex
          ? {
              ...lvl,
              semesters: lvl.semesters.map((sem) =>
                sem.id === semId
                  ? {
                      ...sem,
                      courses: sem.courses.filter((c) => c.id !== courseId),
                    }
                  : sem
              ),
            }
          : lvl
      )
    );
  };

  const cumulativeCGPA = () => {
    let totalPoints = 0;
    let totalUnits = 0;
    levels.forEach((lvl) => {
      lvl.semesters.forEach((sem) => {
        sem.courses.forEach((c) => {
          totalPoints += gradeMap[c.grade] * c.unit;
          totalUnits += c.unit;
        });
      });
    });
    return totalUnits === 0 ? 0 : (totalPoints / totalUnits).toFixed(2);
  };

  const trendData = useMemo(() => {
    const data: { name: string; gpa: number }[] = [];
    levels.forEach((lvl) => {
      lvl.semesters.forEach((sem) => {
        data.push({
          name: `${lvl.level}L ${sem.name.split(" ")[0]}`,
          gpa: Number(calculateGPA(sem.courses).toFixed(2)),
        });
      });
    });
    return data;
  }, [levels]);

  const bestSemester = useMemo(() => {
    if (trendData.length === 0) return null;
    return trendData.reduce((best, curr) => (curr.gpa > best.gpa ? curr : best));
  }, [trendData]);

  const worstSemester = useMemo(() => {
    if (trendData.length === 0) return null;
    return trendData.reduce((worst, curr) => (curr.gpa < worst.gpa ? curr : worst));
  }, [trendData]);

  return (
    <div className="p-6 w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white">
      <h1 className="text-4xl font-bold mb-8">Modern CGPA Dashboard</h1>

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-700 shadow-xl">
          <CardContent className="p-5">
            <p className="opacity-80">Cumulative CGPA</p>
            <h2 className="text-3xl font-bold text-white">{cumulativeCGPA()}</h2>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 shadow-xl">
          <CardContent className="p-5">
            <p className="opacity-80">Best Semester</p>
            <h2 className="text-lg font-bold text-white">
              {bestSemester ? `${bestSemester.name} (${bestSemester.gpa})` : "-"}
            </h2>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-pink-500 shadow-xl">
          <CardContent className="p-5">
            <p className="opacity-80">Worst Semester</p>
            <h2 className="text-lg font-bold text-white">
              {worstSemester ? `${worstSemester.name} (${worstSemester.gpa})` : "-"}
            </h2>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="mb-10 bg-gray-800 border-none shadow-lg rounded-xl">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">GPA Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis domain={[0, 5]} stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none' }} />
              <Line type="monotone" dataKey="gpa" stroke="#8b5cf6" strokeWidth={3} dot={{ r:5, fill:'#f472b6' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Levels */}
      {levels.map((lvl, levelIndex) => (
        <div key={lvl.level} className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">{lvl.level} Level</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {lvl.semesters.map((sem) => {
              const gpa = calculateGPA(sem.courses).toFixed(2);

              return (
                <motion.div key={sem.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="bg-gray-800 border-none shadow-lg rounded-2xl hover:scale-105 transition-transform duration-300">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-white">{sem.name}</h3>
                        <span className="font-bold text-indigo-400">GPA: {gpa}</span>
                      </div>

                      {sem.courses.map((course) => (
                        <div key={course.id} className="flex gap-3 mb-3">
                          <select
                            value={course.grade}
                            onChange={(e) => updateCourse(levelIndex, sem.id, course.id, "grade", e.target.value)}
                            className="bg-gray-700 p-2 rounded-lg text-white"
                          >
                            {Object.keys(gradeMap).map((g) => (
                              <option key={g}>{g}</option>
                            ))}
                          </select>

                          <input
  type="number"
  value={course.unit}
  onChange={(e) => {
    let value = Number(e.target.value);
    if (value < 0) value = 0;
    if (value > 5) value = 5;
    updateCourse(levelIndex, sem.id, course.id, "unit", value);
  }}
  className="bg-gray-700 p-2 w-20 rounded-lg text-white"
/>

                          <Button
                            variant="destructive"
                            onClick={() => removeCourse(levelIndex, sem.id, course.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}

                      <Button
                        onClick={() => addCourse(levelIndex, sem.id)}
                        className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700"
                      >
                        + Add Course
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

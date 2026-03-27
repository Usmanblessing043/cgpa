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

const initialData = [100, 200, 300, 400].map((level) => ({
  level,
  semesters: [
    { id: `${level}-1`, name: "First Semester", courses: [] },
    { id: `${level}-2`, name: "Second Semester", courses: [] },
  ],
}));

export default function Dashboard() {
  const [levels, setLevels] = useState(initialData);

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

  // 📊 Build analytics data
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
    return trendData.reduce((best, curr) =>
      curr.gpa > best.gpa ? curr : best
    );
  }, [trendData]);

  const worstSemester = useMemo(() => {
    if (trendData.length === 0) return null;
    return trendData.reduce((worst, curr) =>
      curr.gpa < worst.gpa ? curr : worst
    );
  }, [trendData]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Student CGPA Dashboard</h1>

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-xl">
          <CardContent className="p-4">
            <p className="text-gray-500">Cumulative CGPA</p>
            <h2 className="text-2xl font-bold">{cumulativeCGPA()}</h2>
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardContent className="p-4">
            <p className="text-gray-500">Best Semester</p>
            <h2 className="text-lg font-bold">
              {bestSemester ? `${bestSemester.name} (${bestSemester.gpa})` : "-"}
            </h2>
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardContent className="p-4">
            <p className="text-gray-500">Worst Semester</p>
            <h2 className="text-lg font-bold">
              {worstSemester ? `${worstSemester.name} (${worstSemester.gpa})` : "-"}
            </h2>
          </CardContent>
        </Card>
      </div>

      {/* 📈 GPA Trend Chart */}
      <Card className="mb-8 shadow-xl">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-4">GPA Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="gpa" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Levels */}
      {levels.map((lvl, levelIndex) => (
        <div key={lvl.level} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{lvl.level} Level</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {lvl.semesters.map((sem) => {
              const gpa = calculateGPA(sem.courses).toFixed(2);

              return (
                <motion.div
                  key={sem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="shadow-lg rounded-2xl">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">{sem.name}</h3>
                        <span className="font-bold">GPA: {gpa}</span>
                      </div>

                      {sem.courses.map((course) => (
                        <div key={course.id} className="flex gap-3 mb-3">
                          <select
                            value={course.grade}
                            onChange={(e) =>
                              updateCourse(
                                levelIndex,
                                sem.id,
                                course.id,
                                "grade",
                                e.target.value
                              )
                            }
                            className="border p-2 rounded-lg"
                          >
                            {Object.keys(gradeMap).map((g) => (
                              <option key={g}>{g}</option>
                            ))}
                          </select>

                          <input
                            type="number"
                            value={course.unit}
                            onChange={(e) =>
                              updateCourse(
                                levelIndex,
                                sem.id,
                                course.id,
                                "unit",
                                Number(e.target.value)
                              )
                            }
                            className="border p-2 w-20 rounded-lg"
                          />

                          <Button
                            variant="destructive"
                            onClick={() =>
                              removeCourse(levelIndex, sem.id, course.id)
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      ))}

                      <Button
                        onClick={() => addCourse(levelIndex, sem.id)}
                        className="mt-2"
                      >
                        Add Course
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

import React, { useState } from "react";
import CourseItem from "../components/CourseItem.jsx";

export default function CourseList() {
  const [courses, setCourses] = useState([
    { id: 1, title: "資料庫系統", reviews: [] },
    { id: 2, title: "程式設計", reviews: [] },
  ]);

  const handleAddReview = (courseId, rating, comment) => {
    setCourses(prev =>
      prev.map(c =>
        c.id === courseId ? { ...c, reviews: [...c.reviews, { rating, comment }] } : c
      )
    );
  };

  const handleAddExam = (courseId, exam) => {
    console.log("新增考古題:", courseId, exam);
  };

  return (
    <div>
      <h2>課程清單</h2>
      {courses.map(course => (
        <CourseItem
          key={course.id}
          course={course}
          onAddReview={handleAddReview}
          onAddExam={handleAddExam}
        />
      ))}
    </div>
  );
}

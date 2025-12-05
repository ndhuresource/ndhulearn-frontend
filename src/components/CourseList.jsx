import React from "react";
import "../styles/CourseList.css";   
import CourseItem from "./CourseItem";

export default function CourseList({ courses = [], onAddReview, onAddExam }) {
  return (
    <div className="course-list-container">
      <div className="course-list-header">
        <h2>課程清單</h2>
        <p>查看課程評價與考古題</p>
      </div>
      {courses.length === 0 ? (
        <div className="course-list-empty">目前還沒有課程</div>
      ) : (
        <div className="course-list-grid">
          {courses.map((c) => (
            <CourseItem
              key={c.id}
              course={c}
              onAddReview={onAddReview}
              onAddExam={onAddExam}
            />
          ))}
        </div>
      )}
    </div>
  );
}

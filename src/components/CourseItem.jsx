import React, { useState } from "react";
import "../styles/CourseItem.css";  
import ReviewForm from "./ReviewForm";
import PastExamForm from "./PastExamForm";
import RatingStars from "./RatingStars";

export default function CourseItem({ course, onAddReview, onAddExam }) {
  const [activeTab, setActiveTab] = useState("reviews");

  return (
    <div className="course-item">
      <h3>{course.title}</h3>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "reviews" ? "active" : ""}
          onClick={() => setActiveTab("reviews")}
        >
          評論
        </button>
        <button
          className={activeTab === "exams" ? "active" : ""}
          onClick={() => setActiveTab("exams")}
        >
          考古題
        </button>
      </div>

      {/* 內容 */}
      {activeTab === "reviews" && (
        <>
          {course.reviews.map((r, i) => (
            <div key={i} className="review">
              <RatingStars value={r.rating} onChange={() => {}} />
              <p>{r.comment}</p>
            </div>
          ))}
          <ReviewForm onSubmit={(rating, comment) => onAddReview(course.id, rating, comment)} />
        </>
      )}

      {activeTab === "exams" && (
        <>
          {course.exams.map((e, i) => (
            <div key={i} className="exam-item">
              📄 {e.title} — <a href={e.link}>下載</a>
            </div>
          ))}
          <PastExamForm onSubmit={(exam) => onAddExam(course.id, exam)} />
        </>
      )}
    </div>
  );
}

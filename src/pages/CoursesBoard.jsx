import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { courseService } from "../services/courseService";
import "../styles/Courses.css";

export default function CoursesBoard() {
  const nav = useNavigate();

  // --- 資料狀態 ---
  const [colleges, setColleges] = useState([]); 
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // --- 篩選條件 State (修改重點：優先從 sessionStorage 讀取) ---
  const [selectedCollege, setSelectedCollege] = useState(sessionStorage.getItem("filter_college") || "");
  const [selectedDept, setSelectedDept] = useState(sessionStorage.getItem("filter_dept") || "");
  const [selectedGroup, setSelectedGroup] = useState(sessionStorage.getItem("filter_group") || "");
  const [selectedLevel, setSelectedLevel] = useState(sessionStorage.getItem("filter_level") || "");
  const [selectedType, setSelectedType] = useState(sessionStorage.getItem("filter_type") || "");
  const [sort, setSort] = useState(sessionStorage.getItem("filter_sort") || "new");
  const [keyword, setKeyword] = useState(sessionStorage.getItem("filter_keyword") || "");
  
  // 頁碼也建議記住，不然篩選保留了但跳回第一頁會怪怪的
  const [page, setPage] = useState(Number(sessionStorage.getItem("filter_page")) || 1);
  const [totalPages, setTotalPages] = useState(1);

  // --- 新增課程 Modal 狀態 ---
  const [showModal, setShowModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: "", id: "", departmentId: "", groupId: "", courseLevel: "學士", type: "必修"
  });
  const [modalCollege, setModalCollege] = useState("");

  // 1. 初始化
  useEffect(() => {
    const init = async () => {
      const me = JSON.parse(localStorage.getItem("currentUser") || "null");
      setCurrentUser(me);
      try {
        const collegeData = await courseService.getColleges();
        setColleges(collegeData);
        // 不用手動呼叫 fetchCourses，因為下方的 useEffect 會偵測到 state 初始值而自動執行
      } catch (error) {
        console.error("初始化失敗", error);
      }
    };
    init();
  }, []);

  // 2. 監聽篩選變動，並儲存到 sessionStorage (修改重點)
  useEffect(() => {
    sessionStorage.setItem("filter_college", selectedCollege);
    sessionStorage.setItem("filter_dept", selectedDept);
    sessionStorage.setItem("filter_group", selectedGroup);
    sessionStorage.setItem("filter_level", selectedLevel);
    sessionStorage.setItem("filter_type", selectedType);
    sessionStorage.setItem("filter_sort", sort);
    sessionStorage.setItem("filter_keyword", keyword);
    sessionStorage.setItem("filter_page", page);
    
    // 觸發搜尋
    fetchCourses();
  }, [selectedCollege, selectedDept, selectedGroup, selectedLevel, selectedType, sort, keyword, page]);

  // 3. 抓取課程
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await courseService.getCourses({
        department: selectedDept,
        group: selectedGroup,
        level: selectedLevel,
        type: selectedType,
        sort,
        search: keyword,
        page
      });
      setCourses(data.courses);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("搜尋課程失敗", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 篩選連動邏輯 ---
  const handleCollegeChange = (e) => {
    setSelectedCollege(e.target.value);
    setSelectedDept("");
    setSelectedGroup("");
    setPage(1);
  };
  const handleDeptChange = (e) => {
    setSelectedDept(e.target.value);
    setSelectedGroup("");
    setPage(1);
  };
  
  // 處理其他篩選變更時重置頁碼 (除了 keyword，keyword 我們在按搜尋或 Enter 時處理)
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
    // fetchCourses 會由 useEffect 觸發
  };

  // 衍生資料
  const filterDepartments = colleges.find(c => String(c.id) === selectedCollege)?.departments || [];
  const filterGroups = filterDepartments.find(d => String(d.id) === selectedDept)?.groups || [];
  const modalDepartments = colleges.find(c => String(c.id) === modalCollege)?.departments || [];
  const modalGroups = modalDepartments.find(d => String(d.id) === newCourse.departmentId)?.groups || [];

  const handleModalCollegeChange = (e) => {
    setModalCollege(e.target.value);
    setNewCourse(prev => ({ ...prev, departmentId: "", groupId: "" }));
  };
  const handleModalDeptChange = (e) => {
    setNewCourse(prev => ({ ...prev, departmentId: e.target.value, groupId: "" }));
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert("請先登入");
    if (!newCourse.name || !newCourse.id || !newCourse.departmentId) {
      return alert("請填寫完整資訊");
    }
    try {
      await courseService.createCourse(newCourse);
      alert("課程新增成功！");
      setShowModal(false);
      setNewCourse({ name: "", id: "", departmentId: "", groupId: "", courseLevel: "學士", type: "必修" });
      setModalCollege(""); 
      setPage(1);
      // fetchCourses 由 effect 觸發
    } catch (error) {
      alert("新增失敗：" + (error.response?.data?.message || ""));
    }
  };

  const openModal = () => {
    if (!currentUser) return alert("請先登入"), nav("/login");
    setShowModal(true);
  };

  const changePage = (p) => { 
    if (p >= 1 && p <= totalPages) { 
      setPage(p); 
      window.scrollTo(0, 0); 
    } 
  };

  const controlStyle = {
    height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #ddd',
    backgroundColor: '#fff', fontSize: '14px', boxSizing: 'border-box', display: 'flex', alignItems: 'center',
    flex: 1, minWidth: 0
  };

  return (
    <div className="courses-wrap">
      <div className="courses-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>📚 課程評價版</h2>
        <button className="btn-primary" onClick={openModal} style={{ height: '40px', padding: '0 20px', display: 'flex', alignItems: 'center' }}>＋ 新增課程</button>
      </div>

      <div className="filters-container" style={{ display: 'flex', flexDirection: 'column', gap: 15, padding: 20, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <select value={selectedCollege} onChange={handleCollegeChange} style={controlStyle}>
            <option value="">全部學院</option>
            {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={selectedDept} onChange={handleDeptChange} disabled={!selectedCollege} style={{ ...controlStyle, backgroundColor: !selectedCollege ? '#f5f5f5' : '#fff' }}>
            <option value="">{selectedCollege ? "全部科系" : "請先選擇學院"}</option>
            {filterDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={selectedGroup} onChange={handleFilterChange(setSelectedGroup)} disabled={!selectedDept || filterGroups.length===0} style={{ ...controlStyle, backgroundColor: (!selectedDept||filterGroups.length===0) ? '#f5f5f5' : '#fff' }}>
            <option value="">{!selectedDept ? "請先選擇科系" : "全部班別"}</option>
            {filterGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select value={selectedLevel} onChange={handleFilterChange(setSelectedLevel)} style={controlStyle}>
            <option value="">全部學制</option>
            <option value="學士">學士</option>
            <option value="碩士">碩士</option>
            <option value="博士">博士</option>
          </select>
          <select value={selectedType} onChange={handleFilterChange(setSelectedType)} style={controlStyle}>
            <option value="">全部類型</option>
            <option value="必修">必修</option>
            <option value="選修">選修</option>
          </select>
          <select value={sort} onChange={handleFilterChange(setSort)} style={controlStyle}>
            <option value="new">排序：最新</option>
            {/* 修改這裡：把「筆記數」改成「資源數」 */}
            <option value="notes_desc">資源數 多→少</option>
            <option value="notes_asc">資源數 少→多</option>
            <option value="reviews_desc">評論數 多→少</option>
            <option value="reviews_asc">評論數 少→多</option>
          </select>
        </div>
        <div style={{ display: 'flex', width: '100%' }}>
          <input placeholder="搜尋課程名稱/代碼 (按 Enter)" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} style={{ ...controlStyle, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: 'none', flex: 1 }} />
          <button className="btn-primary" onClick={handleSearch} style={{ height: '40px', padding: '0 30px', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, whiteSpace: 'nowrap', fontSize: '15px' }}>搜尋</button>
        </div>
      </div>

      {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>載入中...</div> : 
       courses.length === 0 ? <div className="empty" style={{ padding: 40, textAlign: 'center', color: '#888' }}>找不到符合條件的課程</div> : (
        <>
          <div className="courses-list" style={{ display: 'grid', gap: 15, marginTop: 20 }}>
            {courses.map(c => (
              <div key={c.id} className="course-card" style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #eef1f7', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: 20, fontWeight: 700, color: '#333' }}>
                      <Link to={`/courses/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{c.name}</Link>
                    </h3>
                    
                    {/* 課程標籤順序：代碼 -> 科系 -> 班別 -> 學制 -> 必選修 */}
                    <div style={{ display: 'flex', gap: 10, fontSize: 13, flexWrap: 'wrap', alignItems: 'center', color: '#666' }}>
                      <span style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>{c.id}</span>
                      
                      <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '2px 6px', borderRadius: 4 }}>{c.departmentName}</span>
                      
                      {c.groupName && <span style={{ background: '#e0f2f1', color: '#00695c', padding: '2px 6px', borderRadius: 4 }}>{c.groupName}</span>}
                      
                      <span style={{ background: '#f3e5f5', color: '#7b1fa2', padding: '2px 6px', borderRadius: 4 }}>{c.course_level}</span>
                      
                      <span style={{ background: c.type === '必修' ? '#ffebee' : '#e8f5e9', color: c.type === '必修' ? '#c62828' : '#2e7d32', padding: '2px 6px', borderRadius: 4, fontWeight: 'bold' }}>{c.type}</span>
                      
                      {c.teachers && c.teachers.length > 0 && <span style={{ background: '#fff8e1', color: '#f57f17', padding: '2px 6px', borderRadius: 4 }}>👨‍🏫 {c.teachers.join('、')}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 120 }}>
                    <div style={{ color: '#fbc02d', fontWeight: 'bold', fontSize: 18 }}>★ 0.0</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{c.reviewCount} 評論・{c.noteCount} 資源</div>
                    <Link to={`/courses/${c.id}`} className="btn-primary" style={{ marginTop: 8, display: 'inline-block', fontSize: 13, padding: '4px 12px' }}>查看詳情</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 30, marginBottom: 30 }}>
              <button onClick={() => changePage(page - 1)} disabled={page === 1} className="btn-ghost" style={{ padding: '8px 16px', opacity: page === 1 ? 0.5 : 1 }}>上一頁</button>
              <div style={{ display: 'flex', gap: 5 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                  if (totalPages > 10 && Math.abs(page - p) > 2 && p !== 1 && p !== totalPages) { if (Math.abs(page - p) === 3) return <span key={p} style={{lineHeight:'36px', color:'#999'}}>...</span>; return null; }
                  return <button key={p} onClick={() => changePage(p)} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid', borderColor: p === page ? '#1367c2' : '#ddd', backgroundColor: p === page ? '#1367c2' : '#fff', color: p === page ? '#fff' : '#333', cursor: 'pointer', fontWeight: p === page ? 'bold' : 'normal' }}>{p}</button>;
                })}
              </div>
              <button onClick={() => changePage(page + 1)} disabled={page === totalPages} className="btn-ghost" style={{ padding: '8px 16px', opacity: page === totalPages ? 0.5 : 1 }}>下一頁</button>
            </div>
          )}
        </>
      )}

      {/* Modal 保持不變 */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', padding: 30, borderRadius: 12, width: '90%', maxWidth: 500, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>新增課程</h3>
            <form onSubmit={handleCreateCourse} style={{ display: 'grid', gap: 15 }}>
              <div><label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>課程名稱</label><input required value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} placeholder="例如：計算機概論" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} /></div>
              <div><label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>課程代碼</label><input required value={newCourse.id} onChange={e => setNewCourse({...newCourse, id: e.target.value})} placeholder="例如：CS101" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} /></div>
              <div><label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>所屬學院</label><select style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} value={modalCollege} onChange={handleModalCollegeChange}><option value="">請選擇學院</option>{colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>所屬科系</label><select style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} required value={newCourse.departmentId} onChange={handleModalDeptChange} disabled={!modalCollege}><option value="">請選擇科系</option>{modalDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
              <div><label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>所屬班別 (選填)</label><select style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} value={newCourse.groupId} onChange={e => setNewCourse({...newCourse, groupId: e.target.value})} disabled={!newCourse.departmentId || modalGroups.length === 0}><option value="">{modalGroups.length > 0 ? "請選擇班別 (或略過)" : "此科系無分班"}</option>{modalGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}><div><label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>學制</label><select style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} value={newCourse.courseLevel} onChange={e => setNewCourse({...newCourse, courseLevel: e.target.value})}><option value="學士">學士</option><option value="碩士">碩士</option><option value="博士">博士</option></select></div><div><label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>必選修</label><select style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} value={newCourse.type} onChange={e => setNewCourse({...newCourse, type: e.target.value})}><option value="必修">必修</option><option value="選修">選修</option><option value="通識">通識</option></select></div></div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}><button type="submit" className="btn-primary" style={{ flex: 1 }}>建立</button><button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>取消</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
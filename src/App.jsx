import React, { useEffect, useState } from "react";

const STORAGE_KEY = "task-tracker-v1";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function uid() {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load tasks", e);
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function ProgressBar({ percent }) {
  return (
    <div style={{width:'100%', background:'#e6e9ef', borderRadius:999, height:10, overflow:'hidden'}}>
      <div style={{width:`${Math.min(100, Math.max(0, percent))}%`, height:'100%', background:'linear-gradient(90deg,#4f46e5,#06b6d4)'}} />
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("Général");
  const [filterDate, setFilterDate] = useState(todayISO());
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  function addTask(e) {
    e?.preventDefault();
    if (!title.trim()) return;
    const newTask = {
      id: uid(),
      title: title.trim(),
      description: desc.trim(),
      date: date || todayISO(),
      time: time || null,
      category: category || "Général",
      status: "todo",
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    setTitle("");
    setDesc("");
    setTime("");
    setCategory("Général");
  }

  function toggleStatus(id) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t)));
  }

  function startStopTask(id) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, status: t.status === "doing" ? "todo" : "doing" } : t)));
  }

  function deleteTask(id) {
    if (!confirm("Supprimer cette tâche ?")) return;
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function editTask(id, patch) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
  }

  const tasksForDay = tasks.filter(t => t.date === filterDate && (showCompleted ? true : t.status !== "done"));
  const total = tasksForDay.length;
  const done = tasksForDay.filter(t => t.status === "done").length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  function weeklySummary() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const all = tasks.filter(t => t.date === iso);
      const completed = all.filter(t => t.status === "done").length;
      const pct = all.length === 0 ? 0 : Math.round((completed / all.length) * 100);
      days.push({ iso, total: all.length, completed, pct });
    }
    return days;
  }

  return (
    <div style={{minHeight:'100vh', background:'#f8fafc', padding:20, fontFamily:'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'}}>
      <div style={{maxWidth:800, margin:'0 auto', background:'#fff', boxShadow:'0 6px 18px rgba(15,23,42,0.06)', borderRadius:18, padding:20}}>
        <header style={{marginBottom:16}}>
          <h1 style={{fontSize:22, fontWeight:700}}>Tracker de tâches — Journalier</h1>
          <p style={{color:'#6b7280', marginTop:6}}>Gère tes tâches, suis ta progression et conserve l'historique localement.</p>
        </header>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12}}>
          <div>
            <label style={{fontSize:12, color:'#374151'}}>Afficher le jour</label>
            <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} style={{display:'block', width:'100%', padding:8, borderRadius:8, border:'1px solid #e5e7eb', marginTop:6}} />
          </div>
          <div>
            <label style={{fontSize:12, color:'#374151'}}>Montrer tâches terminées</label>
            <div style={{marginTop:6}}>
              <label style={{display:'inline-flex', alignItems:'center'}}>
                <input type="checkbox" checked={showCompleted} onChange={e=>setShowCompleted(e.target.checked)} style={{marginRight:8}} />
                <span style={{fontSize:14}}>Oui</span>
              </label>
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:12, color:'#6b7280'}}>Progression</div>
            <div style={{marginTop:8}}>
              <ProgressBar percent={percent} />
              <div style={{fontSize:12, color:'#6b7280', marginTop:6}}>{done} / {total} — {percent}%</div>
            </div>
          </div>
        </div>

        <form onSubmit={addTask} style={{marginBottom:16}}>
          <div style={{display:'flex', gap:8, marginBottom:8}}>
            <input placeholder="Nouvelle tâche (titre)" value={title} onChange={e=>setTitle(e.target.value)} style={{flex:2,padding:10,borderRadius:8,border:'1px solid #e5e7eb'}} />
            <select value={category} onChange={e=>setCategory(e.target.value)} style={{padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}>
              <option>Général</option>
              <option>Travail</option>
              <option>Personnel</option>
              <option>Sport</option>
              <option>Études</option>
            </select>
          </div>
          <textarea placeholder="Description (optionnelle)" value={desc} onChange={e=>setDesc(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb',height:80,marginBottom:8}} />
          <div style={{display:'flex', gap:8}}>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{padding:8,borderRadius:8,border:'1px solid #e5e7eb'}} />
            <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{padding:8,borderRadius:8,border:'1px solid #e5e7eb'}} />
            <button type="submit" style={{background:'#4f46e5', color:'#fff', borderRadius:8, padding:'10px 16px', border:'none'}}>Ajouter</button>
          </div>
        </form>

        <section>
          <h2 style={{fontSize:18, fontWeight:600, marginBottom:8}}>Tâches pour {filterDate}</h2>
          {tasksForDay.length === 0 ? (
            <div style={{textAlign:'center', color:'#6b7280', padding:20}}>Aucune tâche pour ce jour. Ajoute-en une !</div>
          ) : (
            <ul style={{display:'grid', gap:12}}>
              {tasksForDay.map(task=>(
                <li key={task.id} style={{border:'1px solid #e6e9ef', borderRadius:12, padding:12, display:'flex', justifyContent:'space-between', gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex', alignItems:'center', gap:12}}>
                      <button onClick={()=>toggleStatus(task.id)} style={{width:36,height:36,borderRadius:18,border:'1px solid #e6e9ef', background: task.status==='done' ? '#dcfce7' : 'transparent'}}>
                        {task.status==='done' ? '✓' : ''}
                      </button>
                      <div>
                        <div style={{fontWeight:600}}>{task.title}</div>
                        <div style={{fontSize:12,color:'#6b7280'}}>{task.category} {task.time ? `• ${task.time}` : ''}</div>
                      </div>
                    </div>
                    {task.description ? <div style={{marginTop:8,fontSize:14,color:'#374151'}}>{task.description}</div> : null}
                    <div style={{marginTop:10, display:'flex', gap:8}}>
                      <button style={{padding:'6px 8px', borderRadius:8, background:'#fff4ce', border:'1px solid #fde68a'}} onClick={()=>startStopTask(task.id)}>{task.status==='doing' ? 'Marquer comme à faire' : 'Démarrer'}</button>
                      <button style={{padding:'6px 8px', borderRadius:8, background:'#fee2e2', border:'1px solid #fecaca'}} onClick={()=>deleteTask(task.id)}>Supprimer</button>
                      <button style={{padding:'6px 8px', borderRadius:8, background:'#f3f4f6', border:'1px solid #e5e7eb'}} onClick={()=>{
                        const newTitle = prompt('Modifier le titre', task.title);
                        if (!newTitle) return;
                        editTask(task.id, { title: newTitle });
                      }}>Éditer le titre</button>
                    </div>
                  </div>
                  <div style={{textAlign:'right', fontSize:12, color:'#9ca3af'}}>
                    <div>{new Date(task.createdAt).toLocaleString()}</div>
                    <div style={{marginTop:6}}>{task.status.toUpperCase()}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={{marginTop:16}}>
          <h3 style={{fontWeight:600}}>Résumé hebdo (7 jours)</h3>
          <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8, marginTop:8}}>
            {weeklySummary().map(d=>(
              <div key={d.iso} style={{padding:8,borderRadius:8,border:'1px solid #e6e9ef', textAlign:'center', fontSize:12}}>
                <div style={{fontWeight:600}}>{d.iso.slice(5)}</div>
                <div style={{color:'#6b7280'}}>{d.total} tâches</div>
                <div style={{marginTop:6}}>{d.pct}%</div>
                <div style={{height:8, marginTop:6, background:'#f3f4f6', borderRadius:999, overflow:'hidden'}}>
                  <div style={{width:`${d.pct}%`, height:'100%', background:'linear-gradient(90deg,#06b6d4,#4f46e5)'}} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer style={{marginTop:12, fontSize:12, color:'#9ca3af'}}>Données stockées en local (localStorage). Pour synchroniser entre appareils il faudra ajouter un backend.</footer>
      </div>
    </div>
  );
}

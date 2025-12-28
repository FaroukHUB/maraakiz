import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment/dist/locale/fr';
import DashboardLayout from '../layouts/DashboardLayout';
import './CalendrierApple.css';

moment.locale('fr');

const CalendrierApple = () => {
  const [view, setView] = useState('week'); // day, week, month, year
  const [currentDate, setCurrentDate] = useState(moment());
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCours, setSelectedCours] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchCours();
  }, [currentDate, view]);

  const fetchCours = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      let start_date, end_date;

      if (view === 'day') {
        start_date = currentDate.clone().startOf('day').format('YYYY-MM-DD');
        end_date = currentDate.clone().endOf('day').format('YYYY-MM-DD');
      } else if (view === 'week') {
        start_date = currentDate.clone().startOf('week').format('YYYY-MM-DD');
        end_date = currentDate.clone().endOf('week').format('YYYY-MM-DD');
      } else if (view === 'month') {
        start_date = currentDate.clone().startOf('month').startOf('week').format('YYYY-MM-DD');
        end_date = currentDate.clone().endOf('month').endOf('week').format('YYYY-MM-DD');
      } else if (view === 'year') {
        start_date = currentDate.clone().startOf('year').format('YYYY-MM-DD');
        end_date = currentDate.clone().endOf('year').format('YYYY-MM-DD');
      }

      const response = await axios.get(`${API_BASE_URL}/api/calendrier/cours`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { start_date, end_date }
      });

      setCours(response.data);
    } catch (err) {
      console.error('Erreur chargement cours:', err);
    } finally {
      setLoading(false);
    }
  };

  const goToday = () => setCurrentDate(moment());

  const goNext = () => {
    if (view === 'day') setCurrentDate(currentDate.clone().add(1, 'day'));
    else if (view === 'week') setCurrentDate(currentDate.clone().add(1, 'week'));
    else if (view === 'month') setCurrentDate(currentDate.clone().add(1, 'month'));
    else if (view === 'year') setCurrentDate(currentDate.clone().add(1, 'year'));
  };

  const goPrev = () => {
    if (view === 'day') setCurrentDate(currentDate.clone().subtract(1, 'day'));
    else if (view === 'week') setCurrentDate(currentDate.clone().subtract(1, 'week'));
    else if (view === 'month') setCurrentDate(currentDate.clone().subtract(1, 'month'));
    else if (view === 'year') setCurrentDate(currentDate.clone().subtract(1, 'year'));
  };

  const handleCoursClick = (coursItem) => {
    setSelectedCours(coursItem);
    setShowModal(true);
  };

  const getTitle = () => {
    if (view === 'day') return currentDate.format('D MMMM YYYY');
    if (view === 'week') {
      const start = currentDate.clone().startOf('week');
      const end = currentDate.clone().endOf('week');
      return start.month() === end.month()
        ? `${start.format('D')} - ${end.format('D MMMM YYYY')}`
        : `${start.format('D MMMM')} - ${end.format('D MMMM YYYY')}`;
    }
    if (view === 'month') return currentDate.format('MMMM YYYY');
    if (view === 'year') return currentDate.format('YYYY');
  };

  return (
    <DashboardLayout>
      <div className="apple-calendar">
        {/* Toolbar */}
        <div className="cal-toolbar">
        <div className="toolbar-left">
          <button className="btn-today" onClick={goToday}>Aujourd'hui</button>
          <div className="toolbar-nav">
            <button className="btn-nav" onClick={goPrev}>‹</button>
            <button className="btn-nav" onClick={goNext}>›</button>
          </div>
          <h1 className="toolbar-title">{getTitle()}</h1>
        </div>

        <div className="toolbar-right">
          <div className="view-switcher">
            {['day', 'week', 'month', 'year'].map(v => (
              <button
                key={v}
                className={`view-btn ${view === v ? 'active' : ''}`}
                onClick={() => setView(v)}
              >
                {{day: 'Jour', week: 'Semaine', month: 'Mois', year: 'Année'}[v]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="cal-content">
        {loading ? (
          <div className="cal-loading"><div className="spinner"></div></div>
        ) : (
          <>
            {view === 'day' && <ViewDay cours={cours} currentDate={currentDate} onClick={handleCoursClick} />}
            {view === 'week' && <ViewWeek cours={cours} currentDate={currentDate} onClick={handleCoursClick} />}
            {view === 'month' && <ViewMonth cours={cours} currentDate={currentDate} onClick={handleCoursClick} />}
            {view === 'year' && <ViewYear cours={cours} currentDate={currentDate} onClick={handleCoursClick} />}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedCours && (
        <CoursModal cours={selectedCours} onClose={() => { setShowModal(false); setSelectedCours(null); }} onUpdate={fetchCours} />
      )}
      </div>
    </DashboardLayout>
  );
};

// Day View
const ViewDay = ({ cours, currentDate, onClick }) => {
  const hours = Array.from({ length: 17 }, (_, i) => i + 7);
  const [now, setNow] = useState(moment());

  useEffect(() => {
    const timer = setInterval(() => setNow(moment()), 60000);
    return () => clearInterval(timer);
  }, []);

  const dayCours = cours.filter(c => moment(c.date_debut).isSame(currentDate, 'day'));

  const getStyle = (c) => {
    const start = moment(c.date_debut);
    const top = (start.hours() * 60 + start.minutes() - 7 * 60) / 60 * 120;
    const height = moment(c.date_fin).diff(start, 'minutes') / 60 * 120;
    return { top: `${top}px`, height: `${height}px` };
  };

  const showLine = now.isSame(currentDate, 'day');
  const lineTop = showLine ? (now.hours() * 60 + now.minutes() - 7 * 60) / 60 * 120 : 0;

  return (
    <div className="view-day">
      <div className="day-header">{currentDate.format('dddd D MMMM YYYY')}</div>
      <div className="day-body">
        <div className="time-gutter">
          {hours.map(h => <div key={h} className="time-slot"><span>{h}:00</span></div>)}
        </div>
        <div className="day-grid">
          {hours.map(h => <div key={h} className="grid-row"></div>)}
          {dayCours.map(c => (
            <div key={c.id} className="cours-event" style={getStyle(c)} onClick={() => onClick(c)}>
              <div className="event-time">{moment(c.date_debut).format('HH:mm')}</div>
              <div className="event-title">{c.titre}</div>
              {c.eleves?.[0] && <div className="event-eleve">{c.eleves[0].prenom} {c.eleves[0].nom}</div>}
              {c.is_recurrent && <span className="recur-badge">🔁</span>}
            </div>
          ))}
          {showLine && (
            <div className="time-line" style={{top: `${lineTop}px`}}>
              <div className="time-dot"></div>
              <div className="time-bar"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Week View
const ViewWeek = ({ cours, currentDate, onClick }) => {
  const hours = Array.from({ length: 17 }, (_, i) => i + 7);
  const [now, setNow] = useState(moment());
  const days = Array.from({ length: 7 }, (_, i) => currentDate.clone().startOf('week').add(i, 'days'));

  useEffect(() => {
    const timer = setInterval(() => setNow(moment()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getDayCours = (day) => cours.filter(c => moment(c.date_debut).isSame(day, 'day'));

  const getStyle = (c) => {
    const start = moment(c.date_debut);
    const top = (start.hours() * 60 + start.minutes() - 7 * 60) / 60 * 120;
    const height = moment(c.date_fin).diff(start, 'minutes') / 60 * 120;
    return { top: `${top}px`, height: `${height}px` };
  };

  const showLine = now.isBetween(days[0].clone().startOf('day'), days[6].clone().endOf('day'));
  const lineTop = showLine ? (now.hours() * 60 + now.minutes() - 7 * 60) / 60 * 120 : 0;

  return (
    <div className="view-week">
      <div className="week-header">
        <div className="week-gutter"></div>
        {days.map(d => (
          <div key={d.format('YYYY-MM-DD')} className="week-day-head">
            <div className="day-name">{d.format('ddd')}</div>
            <div className={`day-num ${d.isSame(moment(), 'day') ? 'today' : ''}`}>{d.format('D')}</div>
          </div>
        ))}
      </div>
      <div className="week-body">
        <div className="time-gutter">
          {hours.map(h => <div key={h} className="time-slot"><span>{h}:00</span></div>)}
        </div>
        <div className="week-grid">
          {days.map(d => (
            <div key={d.format('YYYY-MM-DD')} className="week-col">
              {hours.map(h => <div key={h} className="grid-row"></div>)}
              {getDayCours(d).map(c => (
                <div key={c.id} className="cours-event" style={getStyle(c)} onClick={() => onClick(c)}>
                  <div className="event-time">{moment(c.date_debut).format('HH:mm')}</div>
                  <div className="event-title">{c.titre}</div>
                  {c.eleves?.[0] && <div className="event-eleve">{c.eleves[0].prenom}</div>}
                  {c.is_recurrent && <span className="recur-badge">🔁</span>}
                </div>
              ))}
              {showLine && d.isSame(now, 'day') && (
                <div className="time-line" style={{top: `${lineTop}px`}}>
                  <div className="time-dot"></div>
                  <div className="time-bar"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Month View
const ViewMonth = ({ cours, currentDate, onClick }) => {
  const start = currentDate.clone().startOf('month').startOf('week');
  const end = currentDate.clone().endOf('month').endOf('week');
  const days = [];
  let d = start.clone();
  while (d.isSameOrBefore(end)) {
    days.push(d.clone());
    d.add(1, 'day');
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const getDayCours = (day) => cours.filter(c => moment(c.date_debut).isSame(day, 'day'));

  return (
    <div className="view-month">
      <div className="month-header">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(n => (
          <div key={n} className="month-day-head">{n}</div>
        ))}
      </div>
      <div className="month-grid">
        {weeks.map((week, wi) => (
          <div key={wi} className="month-row">
            {week.map(day => {
              const dc = getDayCours(day);
              const isCurrent = day.month() === currentDate.month();
              const isToday = day.isSame(moment(), 'day');
              return (
                <div key={day.format('YYYY-MM-DD')} className={`month-cell ${!isCurrent ? 'other' : ''} ${isToday ? 'today' : ''}`}>
                  <div className="cell-num">{day.format('D')}</div>
                  <div className="cell-events">
                    {dc.slice(0, 3).map(c => (
                      <div key={c.id} className="event-chip" onClick={() => onClick(c)}>
                        <span className="chip-time">{moment(c.date_debut).format('HH:mm')}</span>
                        <span className="chip-title">{c.titre}</span>
                        {c.is_recurrent && <span className="chip-recur">🔁</span>}
                      </div>
                    ))}
                    {dc.length > 3 && <div className="more-events">+{dc.length - 3} de plus</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Year View
const ViewYear = ({ cours, currentDate, onClick }) => {
  const months = Array.from({ length: 12 }, (_, i) => currentDate.clone().month(i));

  const getMiniDays = (month) => {
    const start = month.clone().startOf('month').startOf('week');
    const end = month.clone().endOf('month').endOf('week');
    const days = [];
    let d = start.clone();
    while (d.isSameOrBefore(end)) {
      days.push(d.clone());
      d.add(1, 'day');
    }
    return days;
  };

  const getCoursCount = (day) => cours.filter(c => moment(c.date_debut).isSame(day, 'day')).length;

  return (
    <div className="view-year">
      {months.map(m => {
        const days = getMiniDays(m);
        const weeks = [];
        for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

        return (
          <div key={m.month()} className="mini-cal">
            <div className="mini-header">{m.format('MMMM')}</div>
            <div className="mini-weekdays">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((n, i) => <div key={i}>{n}</div>)}
            </div>
            <div className="mini-days">
              {weeks.map((week, wi) => (
                <div key={wi} className="mini-row">
                  {week.map(d => {
                    const isCurrent = d.month() === m.month();
                    const isToday = d.isSame(moment(), 'day');
                    const count = getCoursCount(d);
                    return (
                      <div key={d.format('YYYY-MM-DD')} className={`mini-day ${!isCurrent ? 'other' : ''} ${isToday ? 'today' : ''} ${count > 0 ? 'has-cours' : ''}`}>
                        {d.format('D')}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Modal
const CoursModal = ({ cours, onClose, onUpdate }) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleDelete = async () => {
    if (!confirm('Supprimer ce cours?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/calendrier/cours/${cours.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate();
      onClose();
    } catch (err) {
      alert('Erreur suppression');
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{cours.titre}</h2>
          <button className="btn-x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {cours.eleves?.length > 0 && (
            <div className="modal-sec">
              <div className="sec-label">Élèves</div>
              <div className="eleves-chips">
                {cours.eleves.map(e => (
                  <div key={e.id} className="eleve-chip">
                    <div className="avatar">{e.prenom[0]}{e.nom[0]}</div>
                    <span>{e.prenom} {e.nom}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="modal-sec">
            <div className="sec-label">📅 Date et heure</div>
            <div>{moment(cours.date_debut).format('dddd D MMMM YYYY')}</div>
            <div>{moment(cours.date_debut).format('HH:mm')} - {moment(cours.date_fin).format('HH:mm')} ({cours.duree} min)</div>
          </div>
          {cours.is_recurrent && (
            <div className="modal-sec">
              <div className="recur-badge-lg">🔁 Se répète toutes les semaines</div>
            </div>
          )}
          {cours.lien_visio && (
            <div className="modal-sec">
              <div className="sec-label">🎥 Lien visio</div>
              <a href={cours.lien_visio} target="_blank" rel="noopener noreferrer" className="visio-link">
                📹 {cours.lien_visio}
              </a>
            </div>
          )}
          {cours.matiere && (
            <div className="modal-sec">
              <div className="sec-label">Matière</div>
              <div>{cours.matiere}</div>
            </div>
          )}
          <div className="modal-sec">
            <div className="sec-label">Type</div>
            <div>{cours.type_cours === 'en-ligne' ? '💻 En ligne' : '🏫 Présentiel'}</div>
          </div>
          {cours.description && (
            <div className="modal-sec">
              <div className="sec-label">Description</div>
              <div>{cours.description}</div>
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn-del" onClick={handleDelete}>Supprimer</button>
          <button className="btn-can" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default CalendrierApple;

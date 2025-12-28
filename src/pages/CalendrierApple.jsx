import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment/dist/locale/fr';
import DashboardLayout from '../layouts/DashboardLayout';
import './CalendrierApple.css';

moment.locale('fr');

// Palette de couleurs pour les élèves
const ELEVE_COLORS = [
  { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', shadow: 'rgba(102, 126, 234, 0.3)' }, // Violet
  { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', shadow: 'rgba(240, 147, 251, 0.3)' }, // Rose
  { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', shadow: 'rgba(79, 172, 254, 0.3)' }, // Bleu clair
  { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', shadow: 'rgba(67, 233, 123, 0.3)' }, // Vert
  { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', shadow: 'rgba(250, 112, 154, 0.3)' }, // Orange
  { bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', shadow: 'rgba(48, 207, 208, 0.3)' }, // Turquoise
  { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', shadow: 'rgba(168, 237, 234, 0.3)' }, // Pastel
  { bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', shadow: 'rgba(255, 154, 158, 0.3)' }, // Rose clair
  { bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', shadow: 'rgba(255, 236, 210, 0.3)' }, // Pêche
  { bg: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', shadow: 'rgba(255, 110, 127, 0.3)' }, // Rouge-bleu
];

// Fonction pour obtenir la couleur d'un élève
const getEleveColor = (eleveId) => {
  const index = eleveId % ELEVE_COLORS.length;
  return ELEVE_COLORS[index];
};

const CalendrierApple = () => {
  const [view, setView] = useState('week'); // day, week, month, year
  const [currentDate, setCurrentDate] = useState(moment());
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCours, setSelectedCours] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [eleves, setEleves] = useState([]);
  const [isRecurrent, setIsRecurrent] = useState(false);

  const [formData, setFormData] = useState({
    eleve_ids: [],
    matiere: 'coran',
    description: '',
    date: moment().format('YYYY-MM-DD'),
    heure_debut: '09:00',
    heure_fin: '10:00',
    lien_visio: '',
    sync_to_google: true,
    statut: 'planifie',
    recurrence_schedule: {},
    recurrence_end_date: ''
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchCours();
    fetchEleves();
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

  const fetchEleves = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/eleves`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEleves(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des élèves:', error);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      eleve_ids: [],
      matiere: 'coran',
      description: '',
      date: moment().format('YYYY-MM-DD'),
      heure_debut: '09:00',
      heure_fin: '10:00',
      lien_visio: '',
      sync_to_google: true,
      statut: 'planifie',
      recurrence_schedule: {},
      recurrence_end_date: ''
    });
    setIsRecurrent(false);
    setShowAddModal(true);
  };

  const handleSubmitCours = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const elevesSelectionnes = eleves.filter(e => formData.eleve_ids.includes(e.id));
      const titre = elevesSelectionnes.length > 0
        ? `Cours ${formData.matiere} - ${elevesSelectionnes.map(e => e.prenom).join(', ')}`
        : `Cours ${formData.matiere}`;

      if (isRecurrent) {
        const dataToSend = {
          eleve_ids: formData.eleve_ids,
          titre,
          matiere: formData.matiere,
          description: formData.description,
          recurrence_schedule: formData.recurrence_schedule,
          recurrence_start_date: formData.date,
          recurrence_end_date: formData.recurrence_end_date,
          type_cours: 'en-ligne',
          lien_visio: formData.lien_visio,
          sync_to_google: formData.sync_to_google,
          statut: formData.statut
        };

        await axios.post(`${API_BASE_URL}/api/calendrier/cours/recurrent`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Construire les datetime complets pour l'API
        const date_debut = `${formData.date}T${formData.heure_debut}:00`;
        const date_fin = `${formData.date}T${formData.heure_fin}:00`;

        const dataToSend = {
          eleve_ids: formData.eleve_ids,
          titre,
          matiere: formData.matiere,
          description: formData.description,
          date_debut: date_debut,
          date_fin: date_fin,
          type_cours: 'en-ligne',
          lien_visio: formData.lien_visio,
          sync_to_google: formData.sync_to_google,
          statut: formData.statut
        };

        await axios.post(`${API_BASE_URL}/api/calendrier/cours`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowAddModal(false);
      fetchCours();
    } catch (error) {
      console.error('Erreur lors de la création du cours:', error);
      alert('Erreur lors de la création du cours');
    }
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
          <button className="btn-add-cours" onClick={handleOpenAddModal}>
            <span className="btn-icon">+</span>
            Nouveau cours
          </button>
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

      {/* Modal détails cours */}
      {showModal && selectedCours && (
        <CoursModal cours={selectedCours} onClose={() => { setShowModal(false); setSelectedCours(null); }} onUpdate={fetchCours} />
      )}

      {/* Modal création cours */}
      {showAddModal && (
        <AddCoursModal
          formData={formData}
          setFormData={setFormData}
          eleves={eleves}
          isRecurrent={isRecurrent}
          setIsRecurrent={setIsRecurrent}
          onSubmit={handleSubmitCours}
          onClose={() => setShowAddModal(false)}
        />
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
    const eleveId = c.eleves?.[0]?.id || 0;
    const color = getEleveColor(eleveId);
    return {
      top: `${top}px`,
      height: `${height}px`,
      background: color.bg,
      boxShadow: `0 2px 8px ${color.shadow}`
    };
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
    const eleveId = c.eleves?.[0]?.id || 0;
    const color = getEleveColor(eleveId);
    return {
      top: `${top}px`,
      height: `${height}px`,
      background: color.bg,
      boxShadow: `0 2px 8px ${color.shadow}`
    };
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
                    {dc.slice(0, 3).map(c => {
                      const eleveId = c.eleves?.[0]?.id || 0;
                      const color = getEleveColor(eleveId);
                      return (
                        <div
                          key={c.id}
                          className="event-chip"
                          style={{ background: color.bg, boxShadow: `0 2px 6px ${color.shadow}` }}
                          onClick={() => onClick(c)}
                        >
                          <span className="chip-time">{moment(c.date_debut).format('HH:mm')}</span>
                          <span className="chip-title">{c.titre}</span>
                          {c.is_recurrent && <span className="chip-recur">🔁</span>}
                        </div>
                      );
                    })}
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
                {cours.eleves.map(e => {
                  const color = getEleveColor(e.id);
                  return (
                    <div key={e.id} className="eleve-chip">
                      {e.avatar_url ? (
                        <img
                          src={e.avatar_url}
                          alt={`${e.prenom} ${e.nom}`}
                          className="avatar"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div className="avatar" style={{ background: color.bg }}>{e.prenom[0]}{e.nom[0]}</div>
                      )}
                      <span>{e.prenom} {e.nom}</span>
                    </div>
                  );
                })}
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

// Modal de création de cours
const AddCoursModal = ({ formData, setFormData, eleves, isRecurrent, setIsRecurrent, onSubmit, onClose }) => {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-content add-cours-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Nouveau cours</h2>
          <button className="btn-x" onClick={onClose}>×</button>
        </div>

        <form onSubmit={onSubmit} className="modal-body">
          {/* Sélection élève(s) */}
          <div className="form-section">
            <label className="form-label">👥 Élève(s) *</label>
            {eleves.length === 0 ? (
              <div style={{ padding: '1rem', background: '#fff3cd', borderRadius: '8px', color: '#856404' }}>
                ⚠️ Aucun élève disponible. Veuillez d'abord ajouter des élèves.
              </div>
            ) : (
              <>
                <select
                  className="form-input"
                  value=""
                  onChange={(e) => {
                    const eleveId = parseInt(e.target.value);
                    if (eleveId && !formData.eleve_ids.includes(eleveId)) {
                      setFormData({
                        ...formData,
                        eleve_ids: [...formData.eleve_ids, eleveId]
                      });
                    }
                  }}
                >
                  <option value="">+ Ajouter un élève</option>
                  {eleves.filter(e => !formData.eleve_ids.includes(e.id)).map(eleve => (
                    <option key={eleve.id} value={eleve.id}>
                      {eleve.prenom} {eleve.nom}
                    </option>
                  ))}
                </select>

                {formData.eleve_ids.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {formData.eleve_ids.map(eleveId => {
                      const eleve = eleves.find(e => e.id === eleveId);
                      return eleve ? (
                        <div key={eleveId} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 12px',
                          background: '#e8f2f4',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}>
                          <span>{eleve.prenom} {eleve.nom}</span>
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              eleve_ids: formData.eleve_ids.filter(id => id !== eleveId)
                            })}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '18px',
                              color: '#437C8B'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Toggle Cours Récurrent */}
          <div className="form-section">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isRecurrent}
                onChange={(e) => setIsRecurrent(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontWeight: 600 }}>🔁 Cours récurrent (se répète sur plusieurs jours)</span>
            </label>
          </div>

          {/* Date */}
          <div className="form-section">
            <label className="form-label">📅 {isRecurrent ? 'Date de début' : 'Date'} *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="form-input"
              required
            />
          </div>

          {/* Sélection des jours avec horaires (seulement pour récurrent) */}
          {isRecurrent && (
            <>
              <div className="form-section">
                <label className="form-label">📆 Jours et horaires *</label>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                  Cliquez sur un jour pour définir ses horaires
                </p>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[
                    { id: 0, name: 'Lundi' },
                    { id: 1, name: 'Mardi' },
                    { id: 2, name: 'Mercredi' },
                    { id: 3, name: 'Jeudi' },
                    { id: 4, name: 'Vendredi' },
                    { id: 5, name: 'Samedi' },
                    { id: 6, name: 'Dimanche' }
                  ].map(day => {
                    const dayKey = day.id.toString();
                    const isSelected = dayKey in formData.recurrence_schedule;

                    return (
                      <div key={day.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const newSchedule = { ...formData.recurrence_schedule };
                            if (isSelected) {
                              delete newSchedule[dayKey];
                            } else {
                              newSchedule[dayKey] = { debut: '09:00', fin: '10:00' };
                            }
                            setFormData({ ...formData, recurrence_schedule: newSchedule });
                          }}
                          style={{
                            padding: '10px',
                            background: isSelected ? '#437C8B' : 'white',
                            color: isSelected ? 'white' : '#333',
                            border: '1px solid #d1d1d6',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            transition: 'all 0.15s'
                          }}
                        >
                          {day.name}
                        </button>

                        {isSelected && (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingLeft: '12px' }}>
                            <input
                              type="time"
                              value={formData.recurrence_schedule[dayKey].debut}
                              onChange={(e) => {
                                const newSchedule = { ...formData.recurrence_schedule };
                                newSchedule[dayKey].debut = e.target.value;
                                setFormData({ ...formData, recurrence_schedule: newSchedule });
                              }}
                              className="form-input"
                              style={{ flex: 1 }}
                            />
                            <span style={{ color: '#6b7280', fontWeight: 600 }}>→</span>
                            <input
                              type="time"
                              value={formData.recurrence_schedule[dayKey].fin}
                              onChange={(e) => {
                                const newSchedule = { ...formData.recurrence_schedule };
                                newSchedule[dayKey].fin = e.target.value;
                                setFormData({ ...formData, recurrence_schedule: newSchedule });
                              }}
                              className="form-input"
                              style={{ flex: 1 }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date de fin */}
              <div className="form-section">
                <label className="form-label">📅 Date de fin de la récurrence *</label>
                <input
                  type="date"
                  value={formData.recurrence_end_date}
                  onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
                  required={isRecurrent}
                  className="form-input"
                />
              </div>
            </>
          )}

          {/* Horaires (pour cours non récurrent) */}
          {!isRecurrent && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-section">
                <label className="form-label">⏰ Heure de début *</label>
                <input
                  type="time"
                  value={formData.heure_debut}
                  onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-section">
                <label className="form-label">⏱️ Heure de fin *</label>
                <input
                  type="time"
                  value={formData.heure_fin}
                  onChange={(e) => setFormData({ ...formData, heure_fin: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* Matière */}
          <div className="form-section">
            <label className="form-label">📚 Matière</label>
            <select
              value={formData.matiere}
              onChange={(e) => setFormData({ ...formData, matiere: e.target.value })}
              className="form-input"
            >
              <option value="coran">Coran</option>
              <option value="arabe">Arabe</option>
              <option value="tajwid">Tajwid</option>
              <option value="fiqh">Fiqh</option>
              <option value="aqida">Aqida</option>
            </select>
          </div>

          {/* Lien visio */}
          <div className="form-section">
            <label className="form-label">🔗 Lien visio</label>
            <input
              type="url"
              value={formData.lien_visio}
              onChange={(e) => setFormData({ ...formData, lien_visio: e.target.value })}
              placeholder="https://meet.google.com/..."
              className="form-input"
            />
          </div>

          {/* Statut */}
          <div className="form-section">
            <label className="form-label">📊 Statut</label>
            <select
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              className="form-input"
            >
              <option value="planifie">📅 À venir</option>
              <option value="termine">✅ Terminé</option>
              <option value="reporte">⏸️ Reporté</option>
            </select>
          </div>

          {/* Description */}
          <div className="form-section">
            <label className="form-label">📝 Notes (optionnel)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              placeholder="Points à aborder, devoirs..."
              className="form-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e5e5e5' }}>
            <button type="button" onClick={onClose} className="btn-can">
              Annuler
            </button>
            <button type="submit" style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #5a98ab 0%, #437C8B 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendrierApple;

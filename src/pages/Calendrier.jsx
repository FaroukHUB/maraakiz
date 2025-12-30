import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendrier.css';

// Import explicite de la locale française
import 'moment/dist/locale/fr';

// Forcer la locale française
moment.locale('fr');

// Créer le localizer APRÈS avoir défini la locale
const localizer = momentLocalizer(moment);

// Messages français personnalisés
const messages = {
  allDay: 'Journée',
  previous: '←',
  next: '→',
  today: "Aujourd'hui",
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  agenda: 'Agenda',
  date: 'Date',
  time: 'Heure',
  event: 'Cours',
  noEventsInRange: 'Aucun cours pour cette période',
  showMore: total => `+ ${total} cours`
};

// Formats français pour les en-têtes du calendrier
const formats = {
  monthHeaderFormat: (date) => moment(date).format('MMMM YYYY'),
  dayHeaderFormat: (date) => moment(date).format('dddd D MMMM YYYY'),
  dayRangeHeaderFormat: ({ start, end }) =>
    `${moment(start).format('D MMMM')} - ${moment(end).format('D MMMM YYYY')}`,
  agendaHeaderFormat: ({ start, end }) =>
    `${moment(start).format('D MMMM')} - ${moment(end).format('D MMMM YYYY')}`,
  weekdayFormat: (date) => moment(date).format('dddd'),
  dateFormat: (date) => moment(date).format('D'),
  dayFormat: (date) => moment(date).format('DD ddd'),
  timeGutterFormat: (date) => moment(date).format('HH:mm'),
  eventTimeRangeFormat: ({ start, end }) =>
    `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
  agendaDateFormat: (date) => moment(date).format('ddd D MMM'),
  agendaTimeFormat: (date) => moment(date).format('HH:mm'),
  agendaTimeRangeFormat: ({ start, end }) =>
    `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Calendrier = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDayView, setShowDayView] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eleves, setEleves] = useState([]);
  const [trames, setTrames] = useState([]);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [isRecurrent, setIsRecurrent] = useState(false);  // Nouveau : toggle pour cours récurrent
  const [showRapportModal, setShowRapportModal] = useState(false);  // Modal rapport de cours
  const [rapportData, setRapportData] = useState({
    resume: '',
    vu_en_cours: '',
    devoirs: '',
    a_revoir: '',
    a_voir_prochaine_fois: '',
    commentaire_prof: '',
    progression_pourcentage: 0,
    note: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [formData, setFormData] = useState({
    eleve_ids: [],
    matiere: 'coran',
    description: '',
    date: '',
    heure_debut: '',
    heure_fin: '',
    lien_visio: '',
    trame_cours_id: null,
    sync_to_google: true,
    statut: 'planifie',
    // Champs pour cours récurrents - horaires personnalisés par jour
    recurrence_schedule: {},  // Format: {"0": {"debut": "21:00", "fin": "22:00"}, "2": {"debut": "19:30", "fin": "20:30"}}
    recurrence_end_date: ''  // Date de fin de la récurrence
  });

  useEffect(() => {
    fetchCours();
    fetchEleves();
    fetchTrames();
    checkGoogleStatus();
  }, []);

  const fetchCours = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/calendrier/cours`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Transformer les cours en événements pour le calendrier
      const formattedEvents = res.data.map(cours => ({
        id: cours.id,
        title: `${cours.is_recurrent ? '🔁 ' : ''}${cours.titre} - ${cours.eleves.map(e => e.prenom).join(', ')}`,
        start: new Date(cours.date_debut),
        end: new Date(cours.date_fin),
        resource: cours
      }));

      setEvents(formattedEvents);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
      setLoading(false);
    }
  };

  const fetchEleves = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/eleves`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEleves(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des élèves:', error);
    }
  };

  const fetchTrames = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/calendrier/trames`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrames(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des trames:', error);
    }
  };

  const checkGoogleStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/calendrier/google/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoogleConnected(res.data.connected);
    } catch (error) {
      console.error('Erreur lors de la vérification du statut Google:', error);
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/calendrier/google/auth-url`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Ouvrir la fenêtre d'authentification Google
      window.open(res.data.auth_url, '_blank', 'width=600,height=600');

      // Écouter le message de retour
      window.addEventListener('message', (event) => {
        if (event.data.type === 'google-auth-success') {
          setGoogleConnected(true);
          alert('Google Calendar connecté avec succès !');
        }
      });
    } catch (error) {
      console.error('Erreur lors de la connexion à Google Calendar:', error);
      alert('Erreur lors de la connexion à Google Calendar');
    }
  };

  const handleSelectSlot = ({ start, end }) => {
    setSelectedDate({ start, end });
    setFormData({
      ...formData,
      date: moment(start).format('YYYY-MM-DD'),
      heure_debut: '09:00',
      heure_fin: '10:00'
    });
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
    setShowDayView(false);

    // Pré-remplir le formulaire avec les données de l'événement
    setFormData({
      eleve_ids: event.resource.eleves.map(e => e.id),
      matiere: event.resource.matiere || 'coran',
      description: event.resource.description || '',
      date: moment(event.resource.date_debut).format('YYYY-MM-DD'),
      heure_debut: moment(event.resource.date_debut).format('HH:mm'),
      heure_fin: moment(event.resource.date_fin).format('HH:mm'),
      lien_visio: event.resource.lien_visio || '',
      trame_cours_id: event.resource.trame_cours_id,
      sync_to_google: event.resource.sync_to_google,
      statut: event.resource.statut || 'planifie'
    });

    setShowModal(true);
  };

  const handleDayClick = (date) => {
    const dayEvents = events.filter(event =>
      moment(event.start).isSame(date, 'day')
    );

    setSelectedDate(date);
    setShowDayView(true);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      // Générer le titre automatiquement
      const elevesSelectionnes = eleves.filter(e => formData.eleve_ids.includes(e.id));
      const titre = elevesSelectionnes.length > 0
        ? `Cours ${formData.matiere} - ${elevesSelectionnes.map(e => e.prenom).join(', ')}`
        : `Cours ${formData.matiere}`;

      if (isRecurrent && !selectedEvent) {
        // Créer des cours récurrents avec horaires personnalisés
        const dataToSend = {
          eleve_ids: formData.eleve_ids,
          titre,
          matiere: formData.matiere,
          description: formData.description,
          recurrence_schedule: formData.recurrence_schedule,  // Horaires par jour
          recurrence_start_date: formData.date,
          recurrence_end_date: formData.recurrence_end_date,
          type_cours: 'en-ligne',
          lien_visio: formData.lien_visio,
          trame_cours_id: formData.trame_cours_id,
          sync_to_google: formData.sync_to_google,
          statut: formData.statut
        };

        const response = await axios.post(
          `${API_URL}/api/calendrier/cours/recurrent`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert(response.data.message);
      } else {
        // Créer/modifier un cours unique
        const date_debut = `${formData.date}T${formData.heure_debut}`;
        const date_fin = `${formData.date}T${formData.heure_fin}`;

        const dataToSend = {
          ...formData,
          titre,
          date_debut,
          date_fin,
          type_cours: 'en-ligne'
        };

        // Supprimer les champs temporaires
        delete dataToSend.date;
        delete dataToSend.heure_debut;
        delete dataToSend.heure_fin;
        delete dataToSend.recurrence_schedule;
        delete dataToSend.recurrence_end_date;

        if (selectedEvent) {
          // Update existing cours
          await axios.put(
            `${API_URL}/api/calendrier/cours/${selectedEvent.id}`,
            dataToSend,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          alert('Cours modifié avec succès !');
        } else {
          // Create new cours
          await axios.post(
            `${API_URL}/api/calendrier/cours`,
            dataToSend,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          alert('Cours créé avec succès !');
        }
      }

      setShowModal(false);
      resetForm();
      fetchCours();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du cours:', error);
      alert('Erreur lors de l\'enregistrement du cours');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/api/calendrier/cours/${selectedEvent.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Cours supprimé avec succès !');
      setShowModal(false);
      resetForm();
      fetchCours();
    } catch (error) {
      console.error('Erreur lors de la suppression du cours:', error);
      alert('Erreur lors de la suppression du cours');
    }
  };

  const resetForm = () => {
    setFormData({
      eleve_ids: [],
      matiere: 'coran',
      description: '',
      date: '',
      heure_debut: '',
      heure_fin: '',
      lien_visio: '',
      trame_cours_id: null,
      sync_to_google: true,
      statut: 'planifie',
      recurrence_schedule: {},
      recurrence_end_date: ''
    });
    setSelectedEvent(null);
    setSelectedDate(null);
    setIsRecurrent(false);
  };

  const handleRapportSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEvent) return;

    try {
      const token = localStorage.getItem('token');

      // First, update course status to 'termine'
      const date_debut = `${formData.date}T${formData.heure_debut}`;
      const date_fin = `${formData.date}T${formData.heure_fin}`;

      const elevesSelectionnes = eleves.filter(e => formData.eleve_ids.includes(e.id));
      const titre = elevesSelectionnes.length > 0
        ? `Cours ${formData.matiere} - ${elevesSelectionnes.map(e => e.prenom).join(', ')}`
        : `Cours ${formData.matiere}`;

      const courseDataToSend = {
        ...formData,
        titre,
        date_debut,
        date_fin,
        type_cours: 'en-ligne',
        statut: 'termine' // Make sure status is termine
      };

      delete courseDataToSend.date;
      delete courseDataToSend.heure_debut;
      delete courseDataToSend.heure_fin;
      delete courseDataToSend.recurrence_schedule;
      delete courseDataToSend.recurrence_end_date;

      await axios.put(
        `${API_URL}/api/calendrier/cours/${selectedEvent.id}`,
        courseDataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Create or update course notes
      const response = await axios.post(
        `${API_URL}/api/notes-cours/`,
        {
          cours_id: selectedEvent.id,
          ...rapportData
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const notesId = response.data.id;

      // Upload files if any
      for (const file of uploadedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        await axios.post(
          `${API_URL}/api/notes-cours/${notesId}/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      alert('✅ Cours marqué comme terminé et rapport enregistré avec succès !');
      setShowRapportModal(false);
      setShowModal(false);
      setRapportData({
        resume: '',
        vu_en_cours: '',
        devoirs: '',
        a_revoir: '',
        a_voir_prochaine_fois: '',
        commentaire_prof: '',
        progression_pourcentage: 0,
        note: ''
      });
      setUploadedFiles([]);
      resetForm();
      fetchCours(); // Refresh course list
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du rapport:', error);
      // If notes already exist, try updating
      if (error.response?.status === 400) {
        try {
          const token = localStorage.getItem('token');
          // Get existing notes first
          const getResponse = await axios.get(
            `${API_URL}/api/notes-cours/cours/${selectedEvent.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const notesId = getResponse.data.id;

          // Update notes
          await axios.put(
            `${API_URL}/api/notes-cours/${notesId}`,
            rapportData,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // Upload new files
          for (const file of uploadedFiles) {
            const formDataFile = new FormData();
            formDataFile.append('file', file);

            await axios.post(
              `${API_URL}/api/notes-cours/${notesId}/upload`,
              formDataFile,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data'
                }
              }
            );
          }

          alert('✅ Rapport de cours mis à jour avec succès !');
          setShowRapportModal(false);
          setRapportData({
            resume: '',
            vu_en_cours: '',
            devoirs: '',
            a_revoir: '',
            a_voir_prochaine_fois: '',
            commentaire_prof: '',
            progression_pourcentage: 0,
            note: ''
          });
          setUploadedFiles([]);
        } catch (updateError) {
          console.error('Erreur lors de la mise à jour:', updateError);
          alert('Erreur lors de l\'enregistrement du rapport');
        }
      } else {
        alert('Erreur lors de l\'enregistrement du rapport');
      }
    }
  };

  const handleTrameSelect = (trameId) => {
    if (!trameId) return;

    const trame = trames.find(t => t.id === parseInt(trameId));
    if (trame) {
      setFormData({
        ...formData,
        titre: trame.nom,
        matiere: trame.matiere || formData.matiere,
        description: trame.description || formData.description,
        trame_cours_id: trame.id
      });
    }
  };

  const eventStyleGetter = (event) => {
    const matiere = event.resource?.matiere || 'coran';
    const statut = event.resource?.statut || 'planifie';

    // Couleurs par matière
    const matiereColors = {
      'coran': '#10b981',
      'arabe': '#3b82f6',
      'tajwid': '#8b5cf6',
      'fiqh': '#f59e0b',
      'aqida': '#ef4444'
    };

    // Modifier l'opacité selon le statut
    let backgroundColor = matiereColors[matiere] || '#6b7280';
    let opacity = 0.9;
    let borderLeft = '4px solid';
    let borderColor = backgroundColor;

    if (statut === 'termine') {
      opacity = 0.5;
      borderColor = '#10b981'; // Vert pour terminé
    } else if (statut === 'reporte') {
      borderColor = '#f59e0b'; // Orange pour reporté
    } else {
      borderColor = '#3b82f6'; // Bleu pour planifié/à venir
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity,
        color: 'white',
        border: 'none',
        borderLeft: `${borderLeft} ${borderColor}`,
        display: 'block',
        fontWeight: '500',
        fontSize: '0.875rem',
        padding: '4px 8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }
    };
  };

  if (loading) {
    return (
      <div className="calendrier-container">
        <div className="loading">Chargement du calendrier...</div>
      </div>
    );
  }

  return (
    <div className="calendrier-container">
      <div className="calendrier-header">
        <div>
          <h1>📅 Mon Calendrier</h1>
          <p className="subtitle">Gérez tous vos cours en un coup d'œil</p>
        </div>
        <div className="header-actions">
          {googleConnected ? (
            <span className="google-status connected">
              ✓ Google Calendar synchronisé
            </span>
          ) : (
            <button className="btn-google" onClick={connectGoogleCalendar}>
              <span className="google-icon">G</span>
              Connecter Google Calendar
            </button>
          )}
          <button className="btn-primary" onClick={() => {
            resetForm();
            setShowModal(true);
          }}>
            + Nouveau cours
          </button>
        </div>
      </div>

      {/* Légende */}
      <div className="calendar-legend">
        <div className="legend-title">📊 Légende</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-bar" style={{ backgroundColor: '#3b82f6' }}></div>
            <span>À venir</span>
          </div>
          <div className="legend-item">
            <div className="legend-bar" style={{ backgroundColor: '#10b981', opacity: 0.5 }}></div>
            <span>Terminé</span>
          </div>
          <div className="legend-item">
            <div className="legend-bar" style={{ backgroundColor: '#f59e0b' }}></div>
            <span>Reporté</span>
          </div>
        </div>
      </div>

      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day']}
          view={view}
          onView={(newView) => setView(newView)}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          messages={messages}
          formats={formats}
          culture="fr"
        />
      </div>

      {/* Modal pour créer/modifier un cours */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEvent ? 'Modifier le cours' : 'Nouveau cours'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="cours-form">
              {/* Sélection élève(s) - Dropdown moderne */}
              <div className="form-group">
                <label>👥 Élève(s) *</label>
                {eleves.length === 0 ? (
                  <div className="no-eleves-message">
                    <p>⚠️ Aucun élève disponible. Veuillez d'abord ajouter des élèves.</p>
                  </div>
                ) : (
                  <select
                    className="modern-select"
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
                )}

                {/* Liste des élèves sélectionnés */}
                {formData.eleve_ids.length > 0 && (
                  <div className="selected-eleves">
                    {formData.eleve_ids.map(eleveId => {
                      const eleve = eleves.find(e => e.id === eleveId);
                      return eleve ? (
                        <div key={eleveId} className="selected-eleve-chip">
                          <span>{eleve.prenom} {eleve.nom}</span>
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              eleve_ids: formData.eleve_ids.filter(id => id !== eleveId)
                            })}
                            className="remove-chip"
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Toggle Cours Récurrent */}
              {!selectedEvent && (
                <div className="form-group">
                  <label className="checkbox-label recurrent-toggle">
                    <input
                      type="checkbox"
                      checked={isRecurrent}
                      onChange={(e) => setIsRecurrent(e.target.checked)}
                    />
                    <span style={{fontWeight: 600, fontSize: '1.05rem'}}>
                      🔁 Cours récurrent (se répète sur plusieurs jours)
                    </span>
                  </label>
                </div>
              )}

              {/* Date (readonly pour cours unique, éditable pour récurrent) + Horaires */}
              <div className="form-group">
                <label>📅 {isRecurrent ? 'Date de début' : 'Date'}</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={isRecurrent ? (e) => setFormData({ ...formData, date: e.target.value }) : null}
                  readOnly={!isRecurrent}
                  className={isRecurrent ? "modern-select" : "readonly-input"}
                />
              </div>

              {/* Sélection des jours avec horaires (seulement pour récurrent) */}
              {isRecurrent && (
                <div className="form-group">
                  <label>📆 Jours et horaires *</label>
                  <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem'}}>
                    Cliquez sur un jour pour définir ses horaires
                  </p>
                  <div className="days-selector">
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
                        <div key={day.id} className="day-schedule-card">
                          <button
                            type="button"
                            className={`day-button ${isSelected ? 'active' : ''}`}
                            onClick={() => {
                              const newSchedule = {...formData.recurrence_schedule};
                              if (isSelected) {
                                delete newSchedule[dayKey];
                              } else {
                                newSchedule[dayKey] = {debut: '09:00', fin: '10:00'};
                              }
                              setFormData({ ...formData, recurrence_schedule: newSchedule });
                            }}
                          >
                            {day.name}
                          </button>

                          {isSelected && (
                            <div className="day-time-inputs">
                              <input
                                type="time"
                                value={formData.recurrence_schedule[dayKey].debut}
                                onChange={(e) => {
                                  const newSchedule = {...formData.recurrence_schedule};
                                  newSchedule[dayKey].debut = e.target.value;
                                  setFormData({ ...formData, recurrence_schedule: newSchedule });
                                }}
                                className="time-input-small"
                                placeholder="Début"
                              />
                              <span style={{color: '#6b7280', fontWeight: 600}}>→</span>
                              <input
                                type="time"
                                value={formData.recurrence_schedule[dayKey].fin}
                                onChange={(e) => {
                                  const newSchedule = {...formData.recurrence_schedule};
                                  newSchedule[dayKey].fin = e.target.value;
                                  setFormData({ ...formData, recurrence_schedule: newSchedule });
                                }}
                                className="time-input-small"
                                placeholder="Fin"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Date de fin (seulement pour récurrent) */}
              {isRecurrent && (
                <div className="form-group">
                  <label>📅 Date de fin de la récurrence *</label>
                  <input
                    type="date"
                    value={formData.recurrence_end_date}
                    onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
                    required={isRecurrent}
                    className="modern-select"
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>⏰ Heure de début *</label>
                  <input
                    type="time"
                    value={formData.heure_debut}
                    onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })}
                    required
                    className="time-input"
                  />
                </div>

                <div className="form-group">
                  <label>⏱️ Heure de fin *</label>
                  <input
                    type="time"
                    value={formData.heure_fin}
                    onChange={(e) => setFormData({ ...formData, heure_fin: e.target.value })}
                    required
                    className="time-input"
                  />
                </div>
              </div>

              {/* Matière */}
              <div className="form-group">
                <label>📚 Matière</label>
                <select
                  value={formData.matiere}
                  onChange={(e) => setFormData({ ...formData, matiere: e.target.value })}
                  className="modern-select"
                >
                  <option value="coran">Coran</option>
                  <option value="arabe">Arabe</option>
                  <option value="tajwid">Tajwid</option>
                  <option value="fiqh">Fiqh</option>
                  <option value="aqida">Aqida</option>
                </select>
              </div>

              {/* Lien visio */}
              <div className="form-group">
                <label>🔗 Lien visio</label>
                <input
                  type="url"
                  value={formData.lien_visio}
                  onChange={(e) => setFormData({ ...formData, lien_visio: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="url-input"
                />
              </div>

              {/* Statut (sans annulé) */}
              <div className="form-group">
                <label>📊 Statut</label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  className="modern-select"
                >
                  <option value="planifie">📅 À venir</option>
                  <option value="termine">✅ Terminé</option>
                  <option value="reporte">⏸️ Reporté</option>
                </select>
              </div>

              {/* Description optionnelle */}
              <div className="form-group">
                <label>📝 Notes (optionnel)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Points à aborder, devoirs..."
                  className="modern-textarea"
                />
              </div>

              {googleConnected && (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.sync_to_google}
                      onChange={(e) => setFormData({ ...formData, sync_to_google: e.target.checked })}
                    />
                    Synchroniser avec Google Calendar
                  </label>
                </div>
              )}

              <div className="modal-actions">
                {selectedEvent && (
                  <button type="button" className="btn-danger" onClick={handleDelete}>
                    Supprimer
                  </button>
                )}
                <div className="modal-actions-right">
                  {selectedEvent && formData.statut !== 'termine' && (
                    <button
                      type="button"
                      className="btn-primary"
                      style={{backgroundColor: '#10b981', marginRight: '10px'}}
                      onClick={() => {
                        setShowRapportModal(true);
                      }}
                    >
                      ✅ Marquer comme terminé
                    </button>
                  )}
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    {selectedEvent ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vue détaillée d'un jour */}
      {showDayView && (
        <div className="day-view-modal">
          <div className="day-view-content">
            <h2>{moment(selectedDate).format('dddd D MMMM YYYY')}</h2>
            {/* À implémenter: liste des cours du jour avec détails */}
          </div>
        </div>
      )}

      {/* Modal Rapport de Cours */}
      {showRapportModal && (
        <div className="modal-overlay" onClick={() => setShowRapportModal(false)}>
          <div className="modal-content" style={{maxWidth: '800px'}} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📝 Rapport de Cours</h2>
              <button className="modal-close" onClick={() => setShowRapportModal(false)}>×</button>
            </div>

            <form onSubmit={handleRapportSubmit} className="cours-form">
              <div className="form-group">
                <label>📋 Résumé du cours</label>
                <textarea
                  value={rapportData.resume}
                  onChange={(e) => setRapportData({ ...rapportData, resume: e.target.value })}
                  rows="3"
                  placeholder="Résumé général du cours..."
                  className="modern-textarea"
                />
              </div>

              <div className="form-group">
                <label>✅ Vu en cours</label>
                <textarea
                  value={rapportData.vu_en_cours}
                  onChange={(e) => setRapportData({ ...rapportData, vu_en_cours: e.target.value })}
                  rows="3"
                  placeholder="Points abordés, chapitres traités..."
                  className="modern-textarea"
                />
              </div>

              <div className="form-group">
                <label>📚 Devoirs donnés</label>
                <textarea
                  value={rapportData.devoirs}
                  onChange={(e) => setRapportData({ ...rapportData, devoirs: e.target.value })}
                  rows="2"
                  placeholder="Devoirs à faire pour le prochain cours..."
                  className="modern-textarea"
                />
              </div>

              <div className="form-group">
                <label>🔄 À revoir</label>
                <textarea
                  value={rapportData.a_revoir}
                  onChange={(e) => setRapportData({ ...rapportData, a_revoir: e.target.value })}
                  rows="2"
                  placeholder="Points à réviser..."
                  className="modern-textarea"
                />
              </div>

              <div className="form-group">
                <label>➡️ À voir la prochaine fois</label>
                <textarea
                  value={rapportData.a_voir_prochaine_fois}
                  onChange={(e) => setRapportData({ ...rapportData, a_voir_prochaine_fois: e.target.value })}
                  rows="2"
                  placeholder="Programme du prochain cours..."
                  className="modern-textarea"
                />
              </div>

              <div className="form-group">
                <label>💬 Commentaire du professeur</label>
                <textarea
                  value={rapportData.commentaire_prof}
                  onChange={(e) => setRapportData({ ...rapportData, commentaire_prof: e.target.value })}
                  rows="2"
                  placeholder="Observations, remarques..."
                  className="modern-textarea"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>📊 Progression (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={rapportData.progression_pourcentage}
                    onChange={(e) => setRapportData({ ...rapportData, progression_pourcentage: parseInt(e.target.value) || 0 })}
                    className="modern-select"
                  />
                </div>

                <div className="form-group">
                  <label>⭐ Note / Appréciation</label>
                  <input
                    type="text"
                    value={rapportData.note}
                    onChange={(e) => setRapportData({ ...rapportData, note: e.target.value })}
                    placeholder="Ex: Très bien, Bon travail..."
                    className="modern-select"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>📎 Fichiers (PDF, images, audio, vidéo)</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.mp3,.wav,.mp4,.webm"
                  onChange={(e) => setUploadedFiles(Array.from(e.target.files))}
                  className="modern-select"
                />
                {uploadedFiles.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {uploadedFiles.length} fichier(s) sélectionné(s)
                  </p>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => {
                  setShowRapportModal(false);
                  setFormData({ ...formData, statut: 'planifie' }); // Reset status if cancelled
                }}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Enregistrer le rapport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendrier;

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendrier.css';

// Import de la locale française
import 'moment/locale/fr';

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
  monthHeaderFormat: (date) => moment(date).locale('fr').format('MMMM YYYY'),
  dayHeaderFormat: (date) => moment(date).locale('fr').format('dddd D MMMM YYYY'),
  dayRangeHeaderFormat: ({ start, end }) =>
    `${moment(start).locale('fr').format('D MMMM')} - ${moment(end).locale('fr').format('D MMMM YYYY')}`,
  agendaHeaderFormat: ({ start, end }) =>
    `${moment(start).locale('fr').format('D MMMM')} - ${moment(end).locale('fr').format('D MMMM YYYY')}`,
  weekdayFormat: (date) => moment(date).locale('fr').format('dddd'),
  dateFormat: (date) => moment(date).locale('fr').format('D'),
  dayFormat: (date) => moment(date).locale('fr').format('DD ddd'),
  timeGutterFormat: (date) => moment(date).locale('fr').format('HH:mm'),
  eventTimeRangeFormat: ({ start, end }) =>
    `${moment(start).locale('fr').format('HH:mm')} - ${moment(end).locale('fr').format('HH:mm')}`,
  agendaDateFormat: (date) => moment(date).locale('fr').format('ddd D MMM'),
  agendaTimeFormat: (date) => moment(date).locale('fr').format('HH:mm'),
  agendaTimeRangeFormat: ({ start, end }) =>
    `${moment(start).locale('fr').format('HH:mm')} - ${moment(end).locale('fr').format('HH:mm')}`,
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Calendrier = () => {
  // Créer le localizer avec la locale française
  const localizer = useMemo(() => {
    moment.locale('fr');
    return momentLocalizer(moment);
  }, []);

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
    statut: 'planifie'
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
        title: `${cours.titre} - ${cours.eleves.map(e => e.prenom).join(', ')}`,
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
      date: moment(start).locale('fr').format('YYYY-MM-DD'),
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
      date: moment(event.resource.date_debut).locale('fr').format('YYYY-MM-DD'),
      heure_debut: moment(event.resource.date_debut).locale('fr').format('HH:mm'),
      heure_fin: moment(event.resource.date_fin).locale('fr').format('HH:mm'),
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

      // Combiner date + heures pour créer datetime
      const date_debut = `${formData.date}T${formData.heure_debut}`;
      const date_fin = `${formData.date}T${formData.heure_fin}`;

      // Générer le titre automatiquement
      const elevesSelectionnes = eleves.filter(e => formData.eleve_ids.includes(e.id));
      const titre = elevesSelectionnes.length > 0
        ? `Cours ${formData.matiere} - ${elevesSelectionnes.map(e => e.prenom).join(', ')}`
        : `Cours ${formData.matiere}`;

      // Préparer les données pour l'API
      const dataToSend = {
        ...formData,
        titre,
        date_debut,
        date_fin,
        type_cours: 'en-ligne' // Toujours en ligne
      };

      // Supprimer les champs temporaires
      delete dataToSend.date;
      delete dataToSend.heure_debut;
      delete dataToSend.heure_fin;

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
      statut: 'planifie'
    });
    setSelectedEvent(null);
    setSelectedDate(null);
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

              {/* Date (readonly) + Horaires */}
              <div className="form-group">
                <label>📅 Date</label>
                <input
                  type="date"
                  value={formData.date}
                  readOnly
                  className="readonly-input"
                />
              </div>

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
            <h2>{moment(selectedDate).locale('fr').format('dddd D MMMM YYYY')}</h2>
            {/* À implémenter: liste des cours du jour avec détails */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendrier;

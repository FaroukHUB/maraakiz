import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendrier.css';

// Configuration française pour moment et le calendrier
moment.locale('fr');
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

  const [formData, setFormData] = useState({
    eleve_ids: [],
    titre: '',
    matiere: 'coran',
    description: '',
    date_debut: '',
    date_fin: '',
    type_cours: 'presentiel',
    lien_visio: '',
    trame_cours_id: null,
    sync_to_google: true
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
      date_debut: moment(start).format('YYYY-MM-DDTHH:mm'),
      date_fin: moment(end).format('YYYY-MM-DDTHH:mm')
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
      titre: event.resource.titre,
      matiere: event.resource.matiere || 'coran',
      description: event.resource.description || '',
      date_debut: moment(event.resource.date_debut).format('YYYY-MM-DDTHH:mm'),
      date_fin: moment(event.resource.date_fin).format('YYYY-MM-DDTHH:mm'),
      type_cours: event.resource.type_cours || 'presentiel',
      lien_visio: event.resource.lien_visio || '',
      trame_cours_id: event.resource.trame_cours_id,
      sync_to_google: event.resource.sync_to_google
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

      if (selectedEvent) {
        // Update existing cours
        await axios.put(
          `${API_URL}/api/calendrier/cours/${selectedEvent.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Cours modifié avec succès !');
      } else {
        // Create new cours
        await axios.post(
          `${API_URL}/api/calendrier/cours`,
          formData,
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
      titre: '',
      matiere: 'coran',
      description: '',
      date_debut: '',
      date_fin: '',
      type_cours: 'presentiel',
      lien_visio: '',
      trame_cours_id: null,
      sync_to_google: true
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
    const colors = {
      'coran': '#10b981',
      'arabe': '#3b82f6',
      'tajwid': '#8b5cf6',
      'fiqh': '#f59e0b',
      'aqida': '#ef4444'
    };

    const matiere = event.resource?.matiere || 'coran';
    const backgroundColor = colors[matiere] || '#6b7280';

    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontWeight: '500',
        fontSize: '0.875rem',
        padding: '4px 8px'
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
              {/* Trame de cours */}
              {!selectedEvent && trames.length > 0 && (
                <div className="form-group">
                  <label>📋 Utiliser une trame de cours</label>
                  <select onChange={(e) => handleTrameSelect(e.target.value)}>
                    <option value="">-- Sélectionner une trame --</option>
                    {trames.map(trame => (
                      <option key={trame.id} value={trame.id}>
                        {trame.nom} ({trame.matiere})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sélection multi-élèves */}
              <div className="form-group">
                <label>👥 Élève(s) * <span className="text-sm text-gray-500">(cochez un ou plusieurs élèves)</span></label>
                {eleves.length === 0 ? (
                  <div className="no-eleves-message">
                    <p>⚠️ Aucun élève disponible. Veuillez d'abord ajouter des élèves à votre liste.</p>
                  </div>
                ) : (
                  <div className="eleves-selector">
                    {eleves.map(eleve => (
                      <label key={eleve.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.eleve_ids.includes(eleve.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                eleve_ids: [...formData.eleve_ids, eleve.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                eleve_ids: formData.eleve_ids.filter(id => id !== eleve.id)
                              });
                            }
                          }}
                        />
                        {eleve.prenom} {eleve.nom}
                      </label>
                    ))}
                  </div>
                )}
                {formData.eleve_ids.length > 0 && (
                  <p className="selected-count">✓ {formData.eleve_ids.length} élève(s) sélectionné(s)</p>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Titre *</label>
                  <input
                    type="text"
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Matière</label>
                  <select
                    value={formData.matiere}
                    onChange={(e) => setFormData({ ...formData, matiere: e.target.value })}
                  >
                    <option value="coran">Coran</option>
                    <option value="arabe">Arabe</option>
                    <option value="tajwid">Tajwid</option>
                    <option value="fiqh">Fiqh</option>
                    <option value="aqida">Aqida</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date et heure de début *</label>
                  <input
                    type="datetime-local"
                    value={formData.date_debut}
                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Date et heure de fin *</label>
                  <input
                    type="datetime-local"
                    value={formData.date_fin}
                    onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type de cours</label>
                  <select
                    value={formData.type_cours}
                    onChange={(e) => setFormData({ ...formData, type_cours: e.target.value })}
                  >
                    <option value="presentiel">Présentiel</option>
                    <option value="en-ligne">En ligne</option>
                    <option value="en-differe">En différé</option>
                  </select>
                </div>

                {formData.type_cours === 'en-ligne' && (
                  <div className="form-group">
                    <label>Lien visio</label>
                    <input
                      type="url"
                      value={formData.lien_visio}
                      onChange={(e) => setFormData({ ...formData, lien_visio: e.target.value })}
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                )}
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
            <h2>{moment(selectedDate).format('dddd D MMMM YYYY')}</h2>
            {/* À implémenter: liste des cours du jour avec détails */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendrier;

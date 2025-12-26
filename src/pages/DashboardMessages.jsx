import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import axios from "axios";
import {
  Send,
  ArrowLeft,
  MessageSquare,
  Clock,
  Search,
  Plus,
  X
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const DashboardMessages = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [nouveauMessage, setNouveauMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [firstMessage, setFirstMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchConversations();
  }, []);

  useEffect(() => {
    if (userId) {
      const conv = conversations.find((c) => c.autre_user_id === parseInt(userId));
      if (conv) {
        handleSelectConversation(conv);
      }
    }
  }, [userId, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur chargement conversations:", error);
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/messages/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(response.data);
    } catch (error) {
      console.error("Erreur chargement contacts:", error);
    }
  };

  const handleOpenNewMessage = () => {
    fetchContacts();
    setShowNewMessageModal(true);
  };

  const handleSendFirstMessage = async (e) => {
    e.preventDefault();

    if (!firstMessage.trim() || !selectedContact) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/messages/`,
        {
          destinataire_id: selectedContact.id,
          contenu: firstMessage
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      setFirstMessage("");
      setSelectedContact(null);
      setShowNewMessageModal(false);

      // Refresh conversations
      await fetchConversations();

      // Open the new conversation
      const newConv = conversations.find(c => c.autre_user_id === selectedContact.id);
      if (newConv) {
        handleSelectConversation(newConv);
      }
    } catch (error) {
      console.error("Erreur envoi message:", error);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/messages/conversation/${conversation.autre_user_id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessages(response.data);

      // Refresh conversations to update unread count
      fetchConversations();
    } catch (error) {
      console.error("Erreur chargement messages:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!nouveauMessage.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/messages/`,
        {
          destinataire_id: selectedConversation.autre_user_id,
          contenu: nouveauMessage
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      setNouveauMessage("");

      // Reload messages
      handleSelectConversation(selectedConversation);
    } catch (error) {
      console.error("Erreur envoi message:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short"
      });
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.autre_user_nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#437C8B]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-12rem)] flex flex-col lg:flex-row gap-4">
        {/* Conversations list */}
        <div
          className={`lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col ${
            selectedConversation ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
              <button
                onClick={handleOpenNewMessage}
                className="p-2 bg-[#437C8B] text-white rounded-xl hover:bg-[#35626f] transition-all"
                title="Nouveau message"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <MessageSquare size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-600">Aucune conversation</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.conversation_id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedConversation?.conversation_id === conv.conversation_id
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {conv.autre_user_nom}
                          </p>
                          {conv.non_lus > 0 && (
                            <span className="bg-[#437C8B] text-white text-xs font-medium px-2 py-0.5 rounded-full">
                              {conv.non_lus}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conv.dernier_message}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{formatDate(conv.dernier_message_date)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conversation detail */}
        <div
          className={`flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col ${
            !selectedConversation ? "hidden lg:flex" : "flex"
          }`}
        >
          {!selectedConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageSquare size={64} className="mb-4" />
              <p className="text-lg">Sélectionnez une conversation</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center gap-4">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedConversation.autre_user_nom}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {selectedConversation.autre_user_type === "prof"
                      ? "Professeur"
                      : "Élève"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <p>Aucun message dans cette conversation</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isFromMe = msg.expediteur_id === currentUser?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                            isFromMe
                              ? "bg-[#437C8B] text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          {msg.sujet && (
                            <p className="font-semibold mb-1">{msg.sujet}</p>
                          )}
                          <p className="whitespace-pre-wrap">{msg.contenu}</p>
                          <p
                            className={`text-xs mt-2 ${
                              isFromMe ? "text-white/70" : "text-gray-500"
                            }`}
                          >
                            {formatDate(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-6 border-t border-gray-200"
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={nouveauMessage}
                    onChange={(e) => setNouveauMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!nouveauMessage.trim()}
                    className="px-6 py-3 bg-[#437C8B] text-white rounded-xl hover:bg-[#35626f] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send size={20} />
                    <span className="hidden sm:inline">Envoyer</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Modal Nouveau Message */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Nouveau message</h3>
              <button
                onClick={() => {
                  setShowNewMessageModal(false);
                  setSelectedContact(null);
                  setFirstMessage("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!selectedContact ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Sélectionnez un destinataire :
                  </p>
                  <div className="space-y-2">
                    {contacts.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        Aucun contact disponible
                      </p>
                    ) : (
                      contacts.map((contact) => (
                        <button
                          key={contact.id}
                          onClick={() => setSelectedContact(contact)}
                          className="w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left"
                        >
                          <p className="font-semibold text-gray-900">{contact.nom}</p>
                          <p className="text-sm text-gray-500">{contact.email}</p>
                          <p className="text-xs text-gray-400 capitalize mt-1">
                            {contact.type === "eleve" ? "Élève" : contact.type === "professeur" ? "Professeur" : "Institut"}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendFirstMessage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destinataire
                    </label>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-900">{selectedContact.nom}</p>
                        <p className="text-sm text-gray-500">{selectedContact.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedContact(null)}
                        className="text-sm text-[#437C8B] hover:underline"
                      >
                        Changer
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={firstMessage}
                      onChange={(e) => setFirstMessage(e.target.value)}
                      placeholder="Écrivez votre message..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent resize-none"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewMessageModal(false);
                        setSelectedContact(null);
                        setFirstMessage("");
                      }}
                      className="flex-1 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={!firstMessage.trim()}
                      className="flex-1 px-6 py-3 bg-[#437C8B] text-white rounded-xl hover:bg-[#35626f] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                    >
                      <Send size={18} />
                      Envoyer
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardMessages;

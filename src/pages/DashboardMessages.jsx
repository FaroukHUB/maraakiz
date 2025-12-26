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
  X,
  Paperclip,
  Image as ImageIcon,
  File,
  Download,
  Trash2
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleFileSelect = (file) => {
    if (!file) return;

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendFirstMessage = async (e) => {
    e.preventDefault();

    if (!firstMessage.trim() && !selectedFile) return;
    if (!selectedContact) return;

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("destinataire_id", selectedContact.id);
      if (firstMessage.trim()) {
        formData.append("contenu", firstMessage);
      }
      if (selectedFile) {
        formData.append("fichier", selectedFile);
      }

      await axios.post(`${API_URL}/api/messages/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      setFirstMessage("");
      clearFile();
      setSelectedContact(null);
      setShowNewMessageModal(false);

      // Refresh conversations
      await fetchConversations();
    } catch (error) {
      console.error("Erreur envoi message:", error);
      alert("Erreur lors de l'envoi du message");
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

    if (!nouveauMessage.trim() && !selectedFile) return;
    if (!selectedConversation) return;

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("destinataire_id", selectedConversation.autre_user_id);
      if (nouveauMessage.trim()) {
        formData.append("contenu", nouveauMessage);
      }
      if (selectedFile) {
        formData.append("fichier", selectedFile);
      }

      await axios.post(`${API_URL}/api/messages/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      setNouveauMessage("");
      clearFile();

      // Reload messages
      handleSelectConversation(selectedConversation);
    } catch (error) {
      console.error("Erreur envoi message:", error);
      alert("Erreur lors de l'envoi du message");
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

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (fileName, fileType) => {
    if (fileType?.startsWith("image/")) return <ImageIcon size={16} />;
    return <File size={16} />;
  };

  const getAvatarColor = (userId) => {
    const colors = ["#437C8B", "#E8833A", "#8B4367", "#3A8BE8", "#8BE83A"];
    return colors[userId % colors.length];
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
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
                className="p-2.5 bg-[#437C8B] text-white rounded-xl hover:bg-[#35626f] transition-all hover:scale-105"
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
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
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
              <div className="divide-y divide-gray-100">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.conversation_id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-all ${
                      selectedConversation?.conversation_id === conv.conversation_id
                        ? "bg-blue-50 border-l-4 border-[#437C8B]"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0"
                        style={{ backgroundColor: getAvatarColor(conv.autre_user_id) }}
                      >
                        {getInitials(conv.autre_user_nom)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {conv.autre_user_nom}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                            <Clock size={12} />
                            <span>{formatDate(conv.dernier_message_date)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-600 truncate flex-1">
                            {conv.dernier_message}
                          </p>
                          {conv.non_lus > 0 && (
                            <span className="bg-[#437C8B] text-white text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                              {conv.non_lus}
                            </span>
                          )}
                        </div>
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
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
              <MessageSquare size={64} className="mb-4 opacity-50" />
              <p className="text-lg">Sélectionnez une conversation</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-4 bg-gradient-to-r from-[#437C8B] to-[#35626f] text-white">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 font-semibold flex-shrink-0"
                >
                  {getInitials(selectedConversation.autre_user_nom)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">
                    {selectedConversation.autre_user_nom}
                  </h3>
                  <p className="text-xs text-white/80 capitalize">
                    {selectedConversation.autre_user_type === "prof"
                      ? "Professeur"
                      : "Élève"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-gray-50 to-gray-100">
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
                        className={`flex ${isFromMe ? "justify-end" : "justify-start"} animate-fade-in`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                            isFromMe
                              ? "bg-gradient-to-br from-[#437C8B] to-[#35626f] text-white"
                              : "bg-white text-gray-900 border border-gray-200"
                          }`}
                        >
                          {msg.sujet && (
                            <p className="font-semibold mb-1 text-sm opacity-90">{msg.sujet}</p>
                          )}
                          {msg.contenu && (
                            <p className="whitespace-pre-wrap">{msg.contenu}</p>
                          )}

                          {/* File attachment */}
                          {msg.fichier_nom && (
                            <div className={`mt-2 p-2 rounded-lg ${
                              isFromMe ? "bg-white/10" : "bg-gray-100"
                            }`}>
                              {msg.fichier_type?.startsWith("image/") ? (
                                <div>
                                  <img
                                    src={`${API_URL}/api/messages/fichier/${msg.fichier_nom}`}
                                    alt="Image"
                                    className="max-w-full rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(`${API_URL}/api/messages/fichier/${msg.fichier_nom}`, '_blank')}
                                  />
                                  <div className="flex items-center justify-between text-xs opacity-80">
                                    <span>{formatFileSize(msg.fichier_taille)}</span>
                                    <a
                                      href={`${API_URL}/api/messages/fichier/${msg.fichier_nom}`}
                                      download
                                      className="flex items-center gap-1 hover:underline"
                                    >
                                      <Download size={12} />
                                      Télécharger
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <a
                                  href={`${API_URL}/api/messages/fichier/${msg.fichier_nom}`}
                                  download
                                  className="flex items-center gap-2 text-sm hover:underline"
                                >
                                  {getFileIcon(msg.fichier_nom, msg.fichier_type)}
                                  <span className="flex-1 truncate">{msg.fichier_nom}</span>
                                  <span className="text-xs opacity-70">
                                    {formatFileSize(msg.fichier_taille)}
                                  </span>
                                  <Download size={14} />
                                </a>
                              )}
                            </div>
                          )}

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
                className="p-4 border-t border-gray-200 bg-white"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* File preview */}
                {selectedFile && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <File size={24} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={clearFile}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Drag overlay */}
                {isDragging && (
                  <div className="absolute inset-0 bg-[#437C8B]/10 border-2 border-dashed border-[#437C8B] rounded-xl flex items-center justify-center z-10">
                    <div className="text-center">
                      <Paperclip size={48} className="mx-auto mb-2 text-[#437C8B]" />
                      <p className="text-[#437C8B] font-medium">Déposez votre fichier ici</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar,.mp3,.wav,.mp4"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 hover:bg-gray-100 rounded-xl transition-all"
                    title="Joindre un fichier"
                  >
                    <Paperclip size={20} className="text-gray-600" />
                  </button>
                  <input
                    type="text"
                    value={nouveauMessage}
                    onChange={(e) => setNouveauMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!nouveauMessage.trim() && !selectedFile}
                    className="px-6 py-3 bg-gradient-to-r from-[#437C8B] to-[#35626f] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 disabled:hover:shadow-none"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col animate-scale-in">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#437C8B] to-[#35626f] text-white">
              <h3 className="text-2xl font-bold">Nouveau message</h3>
              <button
                onClick={() => {
                  setShowNewMessageModal(false);
                  setSelectedContact(null);
                  setFirstMessage("");
                  clearFile();
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
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
                          className="w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#437C8B] transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                              style={{ backgroundColor: getAvatarColor(contact.id) }}
                            >
                              {getInitials(contact.nom)}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{contact.nom}</p>
                              <p className="text-sm text-gray-500">{contact.email}</p>
                              <p className="text-xs text-gray-400 capitalize mt-1">
                                {contact.type === "eleve" ? "Élève" : contact.type === "professeur" ? "Professeur" : "Institut"}
                              </p>
                            </div>
                          </div>
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
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                          style={{ backgroundColor: getAvatarColor(selectedContact.id) }}
                        >
                          {getInitials(selectedContact.nom)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{selectedContact.nom}</p>
                          <p className="text-sm text-gray-500">{selectedContact.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedContact(null)}
                        className="text-sm text-[#437C8B] hover:underline font-medium"
                      >
                        Changer
                      </button>
                    </div>
                  </div>

                  {selectedFile && (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        {filePreview ? (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <File size={24} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={clearFile}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message {!selectedFile && "(obligatoire)"}
                    </label>
                    <textarea
                      value={firstMessage}
                      onChange={(e) => setFirstMessage(e.target.value)}
                      placeholder="Écrivez votre message..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent resize-none transition-all"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInputChange}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar,.mp3,.wav,.mp4"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center gap-2"
                    >
                      <Paperclip size={18} />
                      Fichier
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewMessageModal(false);
                        setSelectedContact(null);
                        setFirstMessage("");
                        clearFile();
                      }}
                      className="flex-1 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={!firstMessage.trim() && !selectedFile}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#437C8B] to-[#35626f] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
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

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default DashboardMessages;

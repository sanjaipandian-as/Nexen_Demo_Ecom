import React, { useState, useEffect } from 'react';
import {
    MdHelpOutline,
    MdRefresh,
    MdSearch,
    MdFilterList,
    MdCheckCircle,
    MdClose,
    MdInfo,
    MdReply,
    MdPerson,
    MdPhone,
    MdEmail,
    MdHistory,
    MdWarning,
    MdArrowForward,
    MdLabel,
    MdOutlineErrorOutline,
    MdSchedule
} from 'react-icons/md';
import API from '../../../../api';
import { toast } from 'react-toastify';

// Move helper functions outside
const getPriorityColor = (priority) => {
    switch (priority) {
        case 'urgent': return 'bg-rose-100 text-rose-600 border-rose-200';
        case 'high': return 'bg-orange-100 text-orange-600 border-orange-200';
        case 'medium': return 'bg-amber-100 text-amber-600 border-amber-200';
        case 'low': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
        default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
};

const TicketCard = ({
    ticket,
    onToggle
}) => {
    const ticketID = ticket._id.slice(-8).toUpperCase();
    const date = new Date(ticket.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return (
        <div
            onClick={() => onToggle(ticket._id)}
            className={`group bg-white rounded-3xl border transition-all duration-500 relative overflow-hidden flex flex-col p-6 cursor-pointer hover:shadow-xl ${ticket.status === 'pending' ? 'border-amber-100 hover:border-amber-300 bg-amber-50/10' : 'border-slate-100'}`}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${ticket.status === 'pending' ? 'bg-amber-100 text-amber-600 shadow-lg shadow-amber-50' : 'bg-slate-100 text-slate-400'}`}>
                        <MdLabel size={24} />
                    </div>
                    <div className="overflow-hidden max-w-[150px]">
                        <p className="font-black text-slate-900 text-lg tracking-tight truncate">#{ticketID}</p>
                        <p className="text-[10px] font-bold text-slate-400 capitalize truncate">{ticket.name}</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                </div>
            </div>

            <div className="bg-slate-50/50 rounded-2xl p-4 mb-6 border border-slate-100/50">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <MdInfo size={12} className="text-slate-300" /> Intent Summary
                </p>
                <h4 className="text-sm font-black text-slate-800 line-clamp-1 mb-1">{ticket.subject}</h4>
                <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed italic">
                    "{ticket.message}"
                </p>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50/50">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${ticket.status === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{ticket.status.replace('-', ' ')}</span>
                </div>
                <button className="flex items-center gap-2 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform">
                    Inspect Case <MdArrowForward />
                </button>
            </div>
        </div>
    );
};

const AdminSupportTickets = ({ refreshId }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('pending'); // pending, in-progress, resolved, closed
    const [replyText, setReplyText] = useState('');
    const [isClosingModal, setIsClosingModal] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, [refreshId]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await API.get('/support/admin/all');
            setTickets(response.data.tickets || []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            toast.error('Failed to load support tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (ticketId, status, response = '') => {
        try {
            setActionLoading(true);
            const updateData = { status };
            if (response) {
                updateData.adminResponse = response;
            }
            await API.put(`/support/admin/update/${ticketId}`, updateData);
            toast.success(`Ticket marked as ${status}`);
            await fetchTickets();
            if (status === 'resolved' || status === 'closed') {
                closeDetailsModal();
            }
        } catch (error) {
            console.error('Error updating ticket:', error);
            toast.error('Failed to update ticket');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendReply = async (ticketId) => {
        if (!replyText.trim()) {
            toast.warn('Please enter a reply message');
            return;
        }
        await handleUpdateStatus(ticketId, 'resolved', replyText);
    };

    const closeDetailsModal = () => {
        setIsClosingModal(true);
        setTimeout(() => {
            setSelectedTicketId(null);
            setIsClosingModal(false);
            setReplyText('');
        }, 300);
    };

    const filteredTickets = tickets.filter(ticket => {
        const searchLower = searchTerm.toLowerCase() || '';
        return (
            (ticket._id && ticket._id.toLowerCase().includes(searchLower)) ||
            (ticket.name && ticket.name.toLowerCase().includes(searchLower)) ||
            (ticket.email && ticket.email.toLowerCase().includes(searchLower)) ||
            (ticket.subject && ticket.subject.toLowerCase().includes(searchLower))
        );
    });

    const pending = filteredTickets.filter(t => t.status === 'pending');
    const inProgress = filteredTickets.filter(t => t.status === 'in-progress');
    const resolved = filteredTickets.filter(t => t.status === 'resolved');
    const closed = filteredTickets.filter(t => t.status === 'closed');

    const getActiveTickets = () => {
        switch (activeTab) {
            case 'pending': return pending;
            case 'in-progress': return inProgress;
            case 'resolved': return resolved;
            case 'closed': return closed;
            default: return filteredTickets;
        }
    };

    return (
        <div className="p-8 md:p-12 space-y-8 h-screen overflow-y-auto no-scrollbar pb-32 bg-[#F8FAFC]">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 flex items-center justify-center text-rose-600">
                        <MdHelpOutline size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-hero">Unified Ticket Intel</h1>
                        <p className="text-slate-500 font-medium text-sm mt-1">Manage, moderate, and resolve customer support inquiries through this portal.</p>
                    </div>
                </div>

                <div className="relative w-full lg:w-96 group">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search ID, Customer, or Intent..."
                        className="w-full h-14 pl-12 pr-6 bg-white border border-slate-200 rounded-2xl focus:border-rose-600 focus:outline-none transition-all shadow-sm font-bold text-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 sticky top-0 z-[100] bg-[#F8FAFC]/80 backdrop-blur-md py-4 -mx-2 px-2">
                <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1">
                    {[
                        { id: 'pending', label: 'Queued', count: pending.length, icon: MdWarning, color: 'text-amber-500' },
                        { id: 'in-progress', label: 'Processing', count: inProgress.length, icon: MdRefresh, color: 'text-blue-500' },
                        { id: 'resolved', label: 'Resolved', count: resolved.length, icon: MdCheckCircle, color: 'text-emerald-500' },
                        { id: 'closed', label: 'Historical', count: closed.length, icon: MdHistory, color: 'text-slate-400' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === tab.id
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-105'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                        >
                            <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : tab.color} />
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-[9px] ${activeTab === tab.id ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <button
                    onClick={fetchTickets}
                    className="p-4 bg-white rounded-2xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm active:scale-95 group"
                >
                    <MdRefresh size={24} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
                </button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-slate-100" />
                    ))
                ) : getActiveTickets().length === 0 ? (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <MdLabel size={48} className="text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight font-hero">No Case Profiles Identified</h3>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 px-8 text-center">Protocol cleared: No assets found in the current buffer category.</p>
                    </div>
                ) : (
                    getActiveTickets().map(ticket => (
                        <TicketCard
                            key={ticket._id}
                            ticket={ticket}
                            onToggle={(id) => {
                                setSelectedTicketId(id);
                                setReplyText(''); // Clear reply text when switching tickets
                            }}
                        />
                    ))
                )}
            </div>

            {/* Ticket Details Modal */}
            {selectedTicketId && tickets.find(t => t._id === selectedTicketId) && (() => {
                const selectedTicket = tickets.find(t => t._id === selectedTicketId);
                const ticketID = selectedTicket._id.slice(-8).toUpperCase();
                const date = new Date(selectedTicket.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });

                return (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div
                            className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isClosingModal ? 'opacity-0' : 'opacity-100'}`}
                            onClick={closeDetailsModal}
                        ></div>

                        {/* Modal Content container */}
                        <div className={`relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 ${isClosingModal ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} animate-in fade-in zoom-in-95`}>
                            {/* Close Button */}
                            <button
                                onClick={closeDetailsModal}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all z-50 active:scale-95"
                            >
                                <MdClose size={20} />
                            </button>

                            <div className="flex flex-col md:flex-row h-full overflow-y-auto">
                                {/* 👤 User Profile Section */}
                                <div className="md:w-1/3 bg-slate-50 p-8 md:p-10 border-b md:border-b-0 md:border-r border-slate-100">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-rose-600">
                                            <MdPerson size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Customer Detail</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                            <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg shadow-rose-200 relative z-10">
                                                {selectedTicket.name.charAt(0).toUpperCase()}
                                            </div>
                                            <h4 className="text-xl font-black text-slate-900 relative z-10">{selectedTicket.name}</h4>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 relative z-10">Ticket Source</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl group/info hover:border-rose-200 transition-all shadow-sm">
                                                <div className="p-2.5 bg-slate-50 rounded-xl group-hover/info:bg-rose-50 group-hover/info:text-rose-500 text-slate-400 transition-colors">
                                                    <MdEmail size={20} />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Identity</p>
                                                    <p className="text-sm font-bold text-slate-700 truncate">{selectedTicket.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl group/info hover:border-rose-200 transition-all shadow-sm">
                                                <div className="p-2.5 bg-slate-50 rounded-xl group-hover/info:bg-rose-50 group-hover/info:text-rose-500 text-slate-400 transition-colors">
                                                    <MdPhone size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Node</p>
                                                    <p className="text-sm font-bold text-slate-700 font-mono">{selectedTicket.phone || 'No Phone Registered'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400">
                                                    <MdSchedule size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initiated On</p>
                                                    <p className="text-sm font-bold text-slate-700">{date}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ⚖️ Ticket Content & Actions Section */}
                                <div className="md:w-2/3 p-8 md:p-10 flex flex-col bg-white">
                                    <div className="mb-8 overflow-hidden">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                                                Case #{ticketID}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(selectedTicket.priority)}`}>
                                                {selectedTicket.priority} Priority
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2 pr-12">{selectedTicket.subject}</h2>
                                        <p className="text-slate-500 text-sm font-medium">Category: <span className="text-rose-600 font-bold uppercase tracking-widest text-[10px]">{selectedTicket.category}</span></p>
                                    </div>

                                    <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-2 mb-8">
                                        {/* User Message (Left Aligned) */}
                                        <div className="flex justify-start">
                                            <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm max-w-[85%] xl:max-w-[75%]">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="p-1.5 bg-rose-100/50 rounded-lg text-rose-600">
                                                        <MdPerson size={14} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Customer</span>
                                                </div>
                                                <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap text-sm">
                                                    {selectedTicket.message || <span className="italic text-slate-400">No message content provided.</span>}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Previous Admin Response if exists or Reply Area (Right Aligned) */}
                                        {selectedTicket.adminResponse && (
                                            <div className="flex justify-end">
                                                <div className="bg-slate-900 text-white p-4 rounded-2xl rounded-tr-none shadow-md max-w-[85%] xl:max-w-[75%]">
                                                    <div className="flex items-center justify-between mb-2 gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 bg-slate-800 rounded-lg text-emerald-400">
                                                                <MdCheckCircle size={14} />
                                                            </div>
                                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Support Team</span>
                                                        </div>
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                                            {selectedTicket.respondedAt ? new Date(selectedTicket.respondedAt).toLocaleDateString('en-IN') : ''}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-200 font-medium leading-relaxed whitespace-pre-wrap text-sm">
                                                        {selectedTicket.adminResponse}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
                                                        <MdReply className="text-rose-500" /> New Admin Response Protocol
                                                    </p>
                                                    <textarea
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        className="w-full h-40 p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-rose-200 focus:outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400 shadow-inner resize-none"
                                                        placeholder="Initialize support response sequence... (e.g. Your order has been checked, let us know if you need anything else.)"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-100">
                                        {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' ? (
                                            <>
                                                <button
                                                    disabled={actionLoading}
                                                    onClick={() => handleSendReply(selectedTicket._id)}
                                                    className="col-span-1 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[10px]"
                                                >
                                                    {actionLoading ? 'Processing...' : 'Send Logic & Resolve'} <MdCheckCircle size={18} />
                                                </button>
                                                <button
                                                    disabled={actionLoading}
                                                    onClick={() => {
                                                        handleUpdateStatus(selectedTicket._id, 'in-progress');
                                                        closeDetailsModal();
                                                    }}
                                                    className="col-span-1 py-4 bg-white border-2 border-slate-100 text-slate-500 font-black rounded-2xl hover:border-amber-200 hover:text-amber-600 transition-all active:scale-95 uppercase tracking-[0.2em] text-[10px]"
                                                >
                                                    Mark In-Progress
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    handleUpdateStatus(selectedTicket._id, 'pending');
                                                    closeDetailsModal();
                                                }}
                                                className="col-span-full py-4 bg-slate-50 border border-slate-200 text-slate-500 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-[0.2em] text-[10px]"
                                            >
                                                Re-open Ticket Case
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default AdminSupportTickets;

import { useState, useEffect } from 'react';
import { FaTicketAlt, FaClock, FaCheckCircle, FaSpinner, FaTimesCircle, FaEye, FaChevronDown, FaChevronUp, FaInbox } from 'react-icons/fa';
import API from '../../../api';
import Skeleton from '../../components/Common/Skeleton';


const Tickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedTicket, setExpandedTicket] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, in-progress, resolved, closed

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            setError('');

            console.log('Fetching support tickets...');
            const response = await API.get('/support/my-tickets');
            console.log('Tickets response:', response.data);

            setTickets(response.data.tickets || []);
        } catch (err) {
            console.error('Error fetching tickets:', err);
            console.error('Error response:', err.response);

            if (err.response?.status === 401) {
                setError('Please login to view your tickets');
            } else if (err.response?.status === 404) {
                setError('Support tickets endpoint not found. Please contact support.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to load tickets. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            'pending': {
                label: 'Pending',
                icon: FaClock,
                color: 'orange',
                bgColor: 'bg-orange-100',
                textColor: 'text-orange-700',
                borderColor: 'border-orange-500',
                description: 'Your ticket has been received and is waiting to be reviewed'
            },
            'in-progress': {
                label: 'In Progress',
                icon: FaSpinner,
                color: 'blue',
                bgColor: 'bg-blue-100',
                textColor: 'text-blue-700',
                borderColor: 'border-blue-500',
                description: 'Our team is actively working on your request'
            },
            'resolved': {
                label: 'Resolved',
                icon: FaCheckCircle,
                color: 'green',
                bgColor: 'bg-green-100',
                textColor: 'text-green-700',
                borderColor: 'border-green-500',
                description: 'Your issue has been resolved'
            },
            'closed': {
                label: 'Closed',
                icon: FaTimesCircle,
                color: 'gray',
                bgColor: 'bg-gray-100',
                textColor: 'text-gray-700',
                borderColor: 'border-gray-500',
                description: 'This ticket has been closed'
            }
        };
        return configs[status] || configs['pending'];
    };

    const getCategoryLabel = (category) => {
        const labels = {
            'general': 'General Inquiry',
            'order': 'Order Issue',
            'product': 'Product Question',
            'payment': 'Payment Problem',
            'delivery': 'Delivery Issue',
            'return': 'Return/Refund',
            'technical': 'Technical Support',
            'other': 'Other'
        };
        return labels[category] || category;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }
    };

    const filteredTickets = filter === 'all'
        ? tickets
        : tickets.filter(ticket => ticket.status === filter);

    const toggleTicketExpansion = (ticketId) => {
        setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white border-2 border-gray-100 rounded-xl p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-3 flex-1">
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-24 rounded-lg" />
                                    <Skeleton className="h-8 w-32 rounded-lg" />
                                </div>
                                <Skeleton className="h-6 w-3/4" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                            <Skeleton className="w-8 h-8 rounded-lg" />
                        </div>
                        <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                ))}
            </div>
        );
    }


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FaTicketAlt className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
                    <p className="text-sm text-gray-500">Track and manage your support requests</p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-red-700 font-medium">{error}</p>
                        <button
                            onClick={fetchTickets}
                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all text-sm"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {[
                    { value: 'all', label: 'All Tickets', count: tickets.length },
                    { value: 'pending', label: 'Pending', count: tickets.filter(t => t.status === 'pending').length },
                    { value: 'in-progress', label: 'In Progress', count: tickets.filter(t => t.status === 'in-progress').length },
                    { value: 'resolved', label: 'Resolved', count: tickets.filter(t => t.status === 'resolved').length },
                    { value: 'closed', label: 'Closed', count: tickets.filter(t => t.status === 'closed').length }
                ].map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${filter === tab.value
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Tickets List */}
            {filteredTickets.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <FaInbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {filter === 'all' ? 'No support tickets yet' : `No ${filter} tickets`}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {filter === 'all'
                            ? 'You haven\'t created any support tickets yet'
                            : `You don't have any ${filter} tickets at the moment`
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTickets.map((ticket) => {
                        const statusConfig = getStatusConfig(ticket.status);
                        const StatusIcon = statusConfig.icon;
                        const isExpanded = expandedTicket === ticket._id;

                        return (
                            <div
                                key={ticket._id}
                                className={`bg-white border-2 ${statusConfig.borderColor} rounded-xl overflow-hidden transition-all hover:shadow-lg`}
                            >
                                {/* Ticket Header */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            {/* Status Badge */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 ${statusConfig.bgColor} ${statusConfig.textColor} rounded-lg font-semibold text-sm`}>
                                                    <StatusIcon className={`w-4 h-4 ${ticket.status === 'in-progress' ? 'animate-spin' : ''}`} />
                                                    {statusConfig.label}
                                                </span>
                                                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm">
                                                    {getCategoryLabel(ticket.category)}
                                                </span>
                                            </div>

                                            {/* Ticket Title */}
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                                {ticket.subject}
                                            </h3>

                                            {/* Ticket Meta */}
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <FaClock className="w-3 h-3" />
                                                    {formatDate(ticket.createdAt)}
                                                </span>
                                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                                    #{ticket._id.slice(-8)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Expand Button */}
                                        <button
                                            onClick={() => toggleTicketExpansion(ticket._id)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                                        >
                                            {isExpanded ? (
                                                <FaChevronUp className="w-5 h-5 text-gray-600" />
                                            ) : (
                                                <FaChevronDown className="w-5 h-5 text-gray-600" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Status Description */}
                                    <div className={`mt-4 p-3 ${statusConfig.bgColor} rounded-lg`}>
                                        <p className={`text-sm ${statusConfig.textColor} font-medium`}>
                                            {statusConfig.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t-2 border-gray-100 bg-gray-50 p-6 space-y-6">
                                        {/* Your Message */}
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <FaEye className="w-4 h-4 text-orange-500" />
                                                Your Message
                                            </h4>
                                            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                                                <p className="text-gray-700 whitespace-pre-wrap">{ticket.message}</p>
                                            </div>
                                        </div>

                                        {/* Contact Information */}
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-3">Contact Information</h4>
                                            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-semibold text-gray-700 w-20">Name:</span>
                                                    <span className="text-gray-900">{ticket.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-semibold text-gray-700 w-20">Email:</span>
                                                    <span className="text-gray-900">{ticket.email}</span>
                                                </div>
                                                {ticket.phone && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="font-semibold text-gray-700 w-20">Phone:</span>
                                                        <span className="text-gray-900">{ticket.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Admin Response */}
                                        {ticket.adminResponse && (
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                    <FaCheckCircle className="w-4 h-4 text-green-500" />
                                                    Support Team Response
                                                </h4>
                                                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                                                    <p className="text-gray-700 whitespace-pre-wrap">{ticket.adminResponse}</p>
                                                    {ticket.respondedAt && (
                                                        <p className="text-xs text-green-600 mt-3 font-medium">
                                                            Responded {formatDate(ticket.respondedAt)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Timeline */}
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-3">Timeline</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <FaTicketAlt className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">Ticket Created</p>
                                                        <p className="text-sm text-gray-600">{new Date(ticket.createdAt).toLocaleString('en-IN')}</p>
                                                    </div>
                                                </div>
                                                {ticket.respondedAt && (
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <FaCheckCircle className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">Response Received</p>
                                                            <p className="text-sm text-gray-600">{new Date(ticket.respondedAt).toLocaleString('en-IN')}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Help Text */}
            {tickets.length > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-700">
                        <strong>Need more help?</strong> Our support team typically responds within 24 hours.
                        You can create a new ticket from the Support page.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Tickets;

import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, User, Calendar, Eye, Trash2, CheckCircle, Clock, Archive, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
  user_id?: string;
}

const ContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied' | 'archived'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchContactMessages();
  }, []);

  const fetchContactMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching contact messages:', error);
      toast({
        title: "Error",
        description: "Failed to load contact messages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, status: ContactMessage['status']) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      ));

      toast({
        title: "Success",
        description: `Message marked as ${status}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive"
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setSelectedMessage(null);

      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
    }
  };

  const sendReply = async (message: ContactMessage) => {
    if (!replyText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply message",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsReplying(true);

      // Call the contact-form edge function to send reply email
      const { data, error } = await supabase.functions.invoke('contact-form', {
        body: {
          firstName: message.first_name,
          lastName: message.last_name,
          email: message.email,
          subject: `Re: ${message.subject}`,
          message: replyText,
          isReply: true,
          originalMessageId: message.id
        }
      });

      if (error) throw error;

      // Update message status to replied
      await updateMessageStatus(message.id, 'replied');
      setReplyText('');
      setSelectedMessage(null);

      toast({
        title: "Success",
        description: "Reply sent successfully!",
      });
    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive"
      });
    } finally {
      setIsReplying(false);
    }
  };

  const getStatusBadge = (status: ContactMessage['status']) => {
    switch (status) {
      case 'new':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">New</Badge>;
      case 'read':
        return <Badge variant="secondary">Read</Badge>;
      case 'replied':
        return <Badge variant="default" className="bg-green-100 text-green-800">Replied</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredMessages = messages.filter(message => 
    filter === 'all' || message.status === filter
  );

  const unreadCount = messages.filter(msg => msg.status === 'new').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Contact Messages
            {unreadCount > 0 && (
              <Badge variant="default" className="bg-red-100 text-red-800">
                {unreadCount} new
              </Badge>
            )}
          </h2>
          <p className="text-gray-600">Manage contact form submissions</p>
        </div>
        <Button onClick={fetchContactMessages} variant="outline" size="sm">
          <MessageSquare className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'new', 'read', 'replied', 'archived'].map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(filterOption as any)}
            className="capitalize"
          >
            {filterOption}
            {filterOption !== 'all' && (
              <Badge variant="secondary" className="ml-2">
                {messages.filter(msg => msg.status === filterOption).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Messages List */}
      <div className="grid gap-4">
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-600">
                {filter === 'all' ? 'No contact messages yet.' : `No ${filter} messages.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => (
            <Card key={message.id} className={`hover:shadow-md transition-shadow ${message.status === 'new' ? 'ring-2 ring-blue-100' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{message.subject}</CardTitle>
                      {getStatusBadge(message.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {message.first_name} {message.last_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {message.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(message.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMessage(message);
                            if (message.status === 'new') {
                              updateMessageStatus(message.id, 'read');
                            }
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            {message.subject}
                          </DialogTitle>
                          <DialogDescription>
                            From: {message.first_name} {message.last_name} ({message.email})
                            <br />
                            Received: {new Date(message.created_at).toLocaleString()}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Message:</h4>
                            <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                              {message.message}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {message.status !== 'read' && (
                              <Button
                                onClick={() => updateMessageStatus(message.id, 'read')}
                                variant="outline"
                                size="sm"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as Read
                              </Button>
                            )}
                            {message.status !== 'archived' && (
                              <Button
                                onClick={() => updateMessageStatus(message.id, 'archived')}
                                variant="outline"
                                size="sm"
                              >
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </Button>
                            )}
                            <Button
                              onClick={() => deleteMessage(message.id)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>

                          {/* Reply Section */}
                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Reply className="w-4 h-4" />
                              Send Reply
                            </h4>
                            <Textarea
                              placeholder="Type your reply here..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="mb-2"
                              rows={4}
                            />
                            <Button
                              onClick={() => sendReply(message)}
                              disabled={isReplying || !replyText.trim()}
                              className="w-full"
                            >
                              {isReplying ? (
                                <>
                                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                                  Sending Reply...
                                </>
                              ) : (
                                <>
                                  <Reply className="w-4 h-4 mr-2" />
                                  Send Reply
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 line-clamp-2">{message.message}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{messages.filter(m => m.status === 'new').length}</div>
            <div className="text-sm text-gray-600">New Messages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{messages.filter(m => m.status === 'replied').length}</div>
            <div className="text-sm text-gray-600">Replied</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{messages.filter(m => m.status === 'read').length}</div>
            <div className="text-sm text-gray-600">Read</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{messages.length}</div>
            <div className="text-sm text-gray-600">Total Messages</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactMessages;

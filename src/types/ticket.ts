// Ticket関連の型定義

export type TicketType = 'problem' | 'incident' | 'question' | 'task';
export type TicketPriority = 'urgent' | 'high' | 'normal' | 'low';
export type TicketStatus =
  | 'new'
  | 'open'
  | 'pending'
  | 'hold'
  | 'solved'
  | 'closed';

export interface Ticket {
  id: number;
  url: string;
  external_id?: string;
  type?: TicketType;
  subject?: string;
  raw_subject?: string;
  description?: string;
  priority?: TicketPriority;
  status: TicketStatus;
  recipient?: string;
  requester_id: number;
  submitter_id: number;
  assignee_id?: number;
  organization_id?: number;
  group_id?: number;
  collaborator_ids?: number[];
  follower_ids?: number[];
  email_cc_ids?: number[];
  forum_topic_id?: number;
  problem_id?: number;
  has_incidents?: boolean;
  is_public?: boolean;
  due_at?: string;
  tags?: string[];
  custom_fields?: Array<{
    id: number;
    value: string | number | boolean | null;
  }>;
  satisfaction_rating?: {
    score: 'offered' | 'unoffered' | 'received';
    comment?: string;
  };
  sharing_agreement_ids?: number[];
  fields?: Array<{
    id: number;
    value: string | number | boolean | null;
  }>;
  followup_ids?: number[];
  brand_id?: number;
  allow_channelback?: boolean;
  allow_attachments?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketRequest {
  subject: string;
  comment: {
    body: string;
    html_body?: string;
    public?: boolean;
    author_id?: number;
    uploads?: string[];
  };
  requester?: {
    name?: string;
    email?: string;
    locale_id?: number;
  };
  type?: TicketType;
  priority?: TicketPriority;
  status?: TicketStatus;
  assignee_id?: number;
  group_id?: number;
  tags?: string[];
  custom_fields?: Array<{
    id: number;
    value: string | number | boolean | null;
  }>;
  external_id?: string;
}

export interface UpdateTicketRequest {
  subject?: string;
  comment?: {
    body: string;
    html_body?: string;
    public?: boolean;
    author_id?: number;
    uploads?: string[];
  };
  type?: TicketType;
  priority?: TicketPriority;
  status?: TicketStatus;
  assignee_id?: number;
  group_id?: number;
  tags?: string[];
  custom_fields?: Array<{
    id: number;
    value: string | number | boolean | null;
  }>;
}

export interface TicketsResponse {
  tickets: Ticket[];
  next_page?: string;
  previous_page?: string;
  count: number;
}

export interface CursorTicketsResponse {
  tickets: Ticket[];
  meta: {
    has_more: boolean;
    after_cursor?: string;
    before_cursor?: string;
  };
  links: {
    prev?: string;
    next?: string;
  };
}

export interface TicketResponse {
  ticket: Ticket;
}

export interface CountResponse {
  count: {
    value: number;
    refreshed_at: string;
  };
}

export interface BulkCreateTicketsRequest {
  tickets: CreateTicketRequest[];
}

export interface BulkUpdateTicketsRequest {
  tickets: Array<
    {
      id: number;
    } & UpdateTicketRequest
  >;
}

export interface Comment {
  id: number;
  type: 'Comment' | 'VoiceComment';
  author_id: number;
  body: string;
  html_body: string;
  plain_body?: string;
  public: boolean;
  attachments?: Array<{
    id: number;
    url: string;
    file_name: string;
    content_url: string;
    content_type: string;
    size: number;
    width?: number;
    height?: number;
    inline?: boolean;
    deleted?: boolean;
    malware_access_override?: boolean;
    malware_scan_result?: string;
    thumbnails?: Array<{
      id: number;
      url: string;
      file_name: string;
      content_url: string;
      content_type: string;
      size: number;
      width: number;
      height: number;
      inline: boolean;
    }>;
  }>;
  audit_id?: number;
  via?: {
    channel: string;
    source?: any;
  };
  created_at: string;
  metadata?: {
    system?: {
      client: string;
      ip_address: string;
      location: string;
      latitude: number;
      longitude: number;
    };
    custom?: Record<string, any>;
  };
}

export interface TicketCommentsResponse {
  comments: Comment[];
  next_page?: string;
  previous_page?: string;
  count: number;
}

export interface CommentResponse {
  comment: Comment;
}

export interface JobStatusResponse {
  job_status: {
    id: string;
    url: string;
    job_type?: string;
    total: number;
    progress: number;
    status: 'queued' | 'working' | 'failed' | 'completed';
    message?: string;
    results?: Array<{
      id?: number;
      index?: number;
      title?: string;
      action?: string;
      success?: boolean;
      status?: string;
      errors?: string;
      details?: string;
    }>;
  };
}

export interface ImportComment {
  value?: string;
  body?: string;
  html_body?: string;
  author_id?: number;
  created_at?: string;
  public?: boolean;
}

export interface ImportTicketRequest {
  subject: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  type?: TicketType;
  requester_id?: number;
  submitter_id?: number;
  assignee_id?: number;
  organization_id?: number;
  group_id?: number;
  collaborator_ids?: number[];
  tags?: string[];
  external_id?: string;
  created_at?: string;
  updated_at?: string;
  solved_at?: string;
  custom_fields?: Array<{
    id: number;
    value: string | number | boolean | null;
  }>;
  comments?: ImportComment[];
  archive_immediately?: boolean;
}

export interface ImportTicketResponse {
  ticket: Ticket;
}

export interface BulkImportTicketsRequest {
  tickets: ImportTicketRequest[];
}

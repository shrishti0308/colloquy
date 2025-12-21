import bcrypt from 'bcryptjs';
import { Schema, model } from 'mongoose';
import MongooseDelete, {
  SoftDeleteDocument,
  SoftDeleteModel,
} from 'mongoose-delete';
import { Config } from '../config';

// Enums
export enum SessionStatus {
  SCHEDULED = 'scheduled',
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum SessionVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
}

// Interfaces
export interface ICodeSubmission {
  problemId: string;
  language: string;
  code: string;
  submittedAt: Date;
  notes?: string;
}

export interface ISessionParticipant {
  userId: string;
  joinedAt: Date | null;
  invitedAt?: Date;
  invitationStatus?: InvitationStatus;
  leftAt?: Date;
  submittedCode: ICodeSubmission[];
  score?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
}

export interface IChatMessage {
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

export interface ISession extends SoftDeleteDocument {
  id: string;
  title: string;
  description?: string;
  visibility: SessionVisibility;
  passcode?: string;
  hostId: string;
  participants: ISessionParticipant[];
  maxParticipants: number;
  problems: string[];
  streamCallId: string;
  streamChannelId: string;
  recordingEnabled: boolean;
  recordingUrl?: string;
  chatLogs: IChatMessage[];
  status: SessionStatus;
  scheduledFor?: Date;
  startedAt?: Date;
  endedAt?: Date;
  verifyPasscode(candidatePasscode: string): Promise<boolean>;
}

const codeSubmissionSchema = new Schema<ICodeSubmission>(
  {
    problemId: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: {
      type: String,
    },
  },
  { _id: false }
);

const participantSchema = new Schema<ISessionParticipant>(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    joinedAt: {
      type: Date,
      required: false,
      default: null,
    },
    invitedAt: {
      type: Date,
    },
    invitationStatus: {
      type: String,
      enum: Object.values(InvitationStatus),
    },
    leftAt: {
      type: Date,
    },
    submittedCode: {
      type: [codeSubmissionSchema],
      default: [],
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
    },
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const chatMessageSchema = new Schema<IChatMessage>(
  {
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: false }
);

const sessionSchema = new Schema<ISession>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    visibility: {
      type: String,
      enum: Object.values(SessionVisibility),
      required: [true, 'Visibility is required'],
    },
    passcode: {
      type: String,
    },
    hostId: {
      type: String,
      required: [true, 'Host is required'],
      ref: 'User',
    },
    participants: {
      type: [participantSchema],
      default: [],
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: [1, 'At least 1 participant is required'],
      max: [50, 'Maximum 50 participants allowed'],
      default: 1,
    },
    problems: {
      type: [String],
      default: [],
    },
    streamCallId: {
      type: String,
      required: true,
      unique: true,
    },
    streamChannelId: {
      type: String,
      required: true,
      unique: true,
    },
    recordingEnabled: {
      type: Boolean,
      default: false,
    },
    recordingUrl: {
      type: String,
    },
    chatLogs: {
      type: [chatMessageSchema],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(SessionStatus),
      required: true,
      default: SessionStatus.WAITING,
    },
    scheduledFor: {
      type: Date,
    },
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete (ret as any).__v;
        delete (ret as any)._id;
        delete (ret as any).deleted;
        delete (ret as any).deletedAt;
        delete (ret as any).passcode;
      },
    },
  }
);

// Indexes
sessionSchema.index({ hostId: 1, status: 1 });
sessionSchema.index({ 'participants.userId': 1 });
sessionSchema.index({ status: 1, visibility: 1, scheduledFor: 1 });
sessionSchema.index({ createdAt: -1 });

// Hash passcode before saving
sessionSchema.pre('save', async function (next) {
  if (!this.isModified('passcode') || !this.passcode) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(Config.BCRYPT_SALT_ROUNDS);
    this.passcode = await bcrypt.hash(this.passcode, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to verify passcode
sessionSchema.methods.verifyPasscode = async function (
  candidatePasscode: string
): Promise<boolean> {
  if (!this.passcode) {
    return false;
  }
  return bcrypt.compare(candidatePasscode, this.passcode);
};

// Soft delete plugin
sessionSchema.plugin(MongooseDelete, {
  overrideMethods: 'all',
  deletedAt: true,
  deletedBy: false,
});

const SessionModel = model<ISession, SoftDeleteModel<ISession>>(
  'Session',
  sessionSchema
);

export default SessionModel;

import { Schema, model } from 'mongoose';
import MongooseDelete, {
  SoftDeleteDocument,
  SoftDeleteModel,
} from 'mongoose-delete';
import { ProgrammingLanguage } from './problem.model';

// Enums
export enum SubmissionStatus {
  PASS = 'pass',
  PARTIAL = 'partial',
  FAIL = 'fail',
  ERROR = 'error',
}

// Interface
export interface ISubmission extends SoftDeleteDocument {
  id: string;
  userId: string;
  problemId: string;
  code: string;
  language: ProgrammingLanguage;
  totalTestCases: number;
  passedTestCases: number;
  failedTestCases: number;
  status: SubmissionStatus;
}

const submissionSchema = new Schema<ISubmission>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      ref: 'User',
    },
    problemId: {
      type: String,
      required: [true, 'Problem ID is required'],
      ref: 'Problem',
    },
    code: {
      type: String,
      required: [true, 'Code is required'],
    },
    language: {
      type: String,
      enum: Object.values(ProgrammingLanguage),
      required: [true, 'Language is required'],
    },
    totalTestCases: {
      type: Number,
      required: [true, 'Total test cases is required'],
      min: 0,
    },
    passedTestCases: {
      type: Number,
      required: [true, 'Passed test cases is required'],
      min: 0,
    },
    failedTestCases: {
      type: Number,
      required: [true, 'Failed test cases is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(SubmissionStatus),
      required: [true, 'Status is required'],
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
      },
    },
  }
);

// Indexes
submissionSchema.index({ userId: 1, problemId: 1, createdAt: -1 });
submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ problemId: 1, status: 1 });
submissionSchema.index({ problemId: 1, createdAt: -1 });

submissionSchema.pre('save', function (next) {
  if (this.passedTestCases + this.failedTestCases !== this.totalTestCases) {
    return next(
      new Error('passedTestCases + failedTestCases must equal totalTestCases')
    );
  }
  next();
});

// Soft delete plugin
submissionSchema.plugin(MongooseDelete, {
  overrideMethods: 'all',
  deletedAt: true,
  deletedBy: false,
});

const SubmissionModel = model<ISubmission, SoftDeleteModel<ISubmission>>(
  'Submission',
  submissionSchema
);

export default SubmissionModel;

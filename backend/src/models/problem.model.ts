import { Schema, model } from 'mongoose';
import MongooseDelete, {
  SoftDeleteDocument,
  SoftDeleteModel,
} from 'mongoose-delete';

// Enums
export enum ProblemDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum ProblemVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum ProgrammingLanguage {
  C = 'c',
  CPP = 'cpp',
  PYTHON = 'python',
  JAVA = 'java',
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  GO = 'go',
  RUST = 'rust',
}

// Interfaces
export interface ILanguageTemplate {
  language: ProgrammingLanguage;
  starterCode: string;
}

export interface ITestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden: boolean; // true = hidden from participants, false = visible
}

export interface IProblem extends SoftDeleteDocument {
  id: string;
  title: string;
  description: string;
  difficulty: ProblemDifficulty;
  visibility: ProblemVisibility;
  createdBy: string;
  languageTemplates: ILanguageTemplate[];
  testCases: ITestCase[];
  constraints?: string[];
  hints?: string[];
  tags?: string[];
  usageCount: number;
}

const languageTemplateSchema = new Schema<ILanguageTemplate>(
  {
    language: {
      type: String,
      enum: Object.values(ProgrammingLanguage),
      required: true,
    },
    starterCode: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const testCaseSchema = new Schema<ITestCase>(
  {
    input: {
      type: String,
      required: true,
    },
    expectedOutput: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
    },
    isHidden: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: false }
);

const problemSchema = new Schema<IProblem>(
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
      required: [true, 'Description is required'],
      minlength: [10, 'Description must be at least 10 characters long'],
    },
    difficulty: {
      type: String,
      enum: Object.values(ProblemDifficulty),
      required: [true, 'Difficulty is required'],
    },
    visibility: {
      type: String,
      enum: Object.values(ProblemVisibility),
      required: [true, 'Visibility is required'],
    },
    createdBy: {
      type: String,
      required: [true, 'Creator is required'],
      ref: 'User',
    },
    languageTemplates: {
      type: [languageTemplateSchema],
      required: true,
      validate: {
        validator: (v: ILanguageTemplate[]) => v && v.length > 0,
        message: 'At least one language template is required',
      },
    },
    testCases: {
      type: [testCaseSchema],
      required: true,
      validate: {
        validator: (v: ITestCase[]) => v && v.length > 0,
        message: 'At least one test case is required',
      },
    },
    constraints: {
      type: [String],
      default: [],
    },
    hints: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
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
problemSchema.index({ createdBy: 1, visibility: 1 });
problemSchema.index({ difficulty: 1, visibility: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ usageCount: -1 });
problemSchema.index({ title: 'text', description: 'text' });
problemSchema.index({ title: 1 }, { unique: true });

// Soft delete plugin
problemSchema.plugin(MongooseDelete, {
  overrideMethods: 'all',
  deletedAt: true,
  deletedBy: false,
});

const ProblemModel = model<IProblem, SoftDeleteModel<IProblem>>(
  'Problem',
  problemSchema
);

export default ProblemModel;

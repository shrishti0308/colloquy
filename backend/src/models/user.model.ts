import bcrypt from 'bcryptjs';
import { Schema, model } from 'mongoose';
import MongooseDelete, {
  SoftDeleteDocument,
  SoftDeleteModel,
} from 'mongoose-delete';
import { Config } from '../config';

export enum UserRole {
  USER = 'user',
  INTERVIEWER = 'interviewer',
  ADMIN = 'admin',
}

export interface IUser extends SoftDeleteDocument {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  comparePassword(password: string): Promise<boolean>;
  refreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

const userSchema = new Schema<IUser>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
      ],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,

    toJSON: {
      transform: function (doc, ret) {
        delete (ret as any).password;

        delete (ret as any).__v;
        delete (ret as any)._id;

        delete (ret as any).deleted;
        delete (ret as any).deletedAt;

        delete (ret as any).refreshToken;

        delete (ret as any).passwordResetToken;
        delete (ret as any).passwordResetExpires;
      },
    },
  }
);

// -- Pre-Save Hook to hash & save password --
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(Config.BCRYPT_SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// -- Instance Method to compare password --
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = await UserModel.findById(this._id).select('+password').exec();
  if (!user || !user.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, user.password);
};

// -- Plugin for Soft Delete --
userSchema.plugin(MongooseDelete, {
  overrideMethods: 'all', // Makes find(), findOne(), etc. exclude deleted docs
  deletedAt: true, // Adds a deletedAt field
  deletedBy: false,
});

const UserModel = model<IUser, SoftDeleteModel<IUser>>('User', userSchema);
export default UserModel;

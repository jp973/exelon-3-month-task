import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../../models/db/user';
import bcrypt from 'bcryptjs';

// CREATE USER
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      req.apiResponse = {
        success: false,
        message: 'Email already in use',
        error: { email: 'Email already exists' }
      };
      return next();
    }

    const { userName, email, password, ...rest } = req.body;

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName,
      email,
      password: hashedPassword,
      ...rest
    });

    req.apiResponse = {
      success: true,
      message: 'User created successfully',
      data: user
    };
    next();

  } catch (error: any) {
    console.error('[ERROR]', error);

    if (error.name === 'ValidationError') {
      req.apiResponse = {
        success: false,
        message: 'Validation failed',
        error: error.errors
      };
      return next();
    }

    if (error.code === 11000) {
      req.apiResponse = {
        success: false,
        message: 'Duplicate key error',
        error: error.keyValue
      };
      return next();
    }

    req.apiResponse = {
      success: false,
      message: 'Internal server error',
      error
    };
    next();
  }
};

// GET ALL USERS
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find();
    req.apiResponse = {
      code: 200,
      success: true,
      message: 'Users retrieved successfully',
      data: {
        totalCount: users.length,
        totalData: users
      }
    };
    next();
  } catch (error) {
    console.error('[ERROR]', error);
    req.apiResponse = {
      success: false,
      message: 'Internal server error',
      error
    };
    next();
  }
};

// GET USER BY ID
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      req.apiResponse = {
        success: false,
        message: 'Invalid user ID format'
      };
      return next();
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      req.apiResponse = {
        success: false,
        message: 'User not found'
      };
      return next();
    }

    req.apiResponse = {
      success: true,
      message: 'User retrieved successfully',
      data: user
    };
    next();

  } catch (error) {
    console.error('[ERROR]', error);
    req.apiResponse = {
      success: false,
      message: 'Internal server error',
      error
    };
    next();
  }
};

// UPDATE USER
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      req.apiResponse = {
        success: false,
        message: 'Invalid user ID format'
      };
      return next();
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      req.apiResponse = {
        success: false,
        message: 'User not found'
      };
      return next();
    }

    req.apiResponse = {
      success: true,
      message: 'User updated successfully',
      data: user
    };
    next();

  } catch (error: any) {
    console.error('[ERROR]', error);

    if (error.name === 'ValidationError') {
      req.apiResponse = {
        success: false,
        message: 'Validation failed',
        error: error.errors
      };
      return next();
    }

    req.apiResponse = {
      success: false,
      message: 'Internal server error',
      error
    };
    next();
  }
};

// DELETE USER
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      req.apiResponse = {
        success: false,
        message: 'Invalid user ID format'
      };
      return next();
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      req.apiResponse = {
        success: false,
        message: 'User not found'
      };
      return next();
    }

    req.apiResponse = {
      success: true,
      message: 'User deleted successfully'
    };
    next();

  } catch (error) {
    console.error('[ERROR]', error);
    req.apiResponse = {
      success: false,
      message: 'Internal server error',
      error
    };
    next();
  }
};

export const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Read from nested payload
    const pagination = req.body.pagination || {};
    const search = req.body.search || {};
    const filter = req.body.filter || {};
    const projection = req.body.projection || {};

    // 2. Extract pagination values
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 10;
    const skip = (page - 1) * limit;

    // 3. Extract search values
    const term = search.term || '';
    const searchFields = Array.isArray(search.fields) && search.fields.length > 0
      ? search.fields
      : ['userName', 'email'];

    // 4. Build match stage (search + filter)
    const matchStage: any = {};

    // Add non-empty filter fields
    for (const key in filter) {
      if (
        filter[key] !== undefined &&
        filter[key] !== null &&
        filter[key] !== ''
      ) {
        matchStage[key] = filter[key];
      }
    }

    // Add search logic if term is provided
    if (term && searchFields.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(term) && searchFields.includes('email')) {
        matchStage.email = { $regex: term, $options: 'i' };
      } else {
        const terms = term.trim().split(/\s+/);
        matchStage.$or = searchFields.flatMap((field: string) =>
          terms.map((t: string) => ({
            [field]: { $regex: t, $options: 'i' }
          }))
        );
      }
    }

    // 5. Build aggregation pipeline
    const pipeline: any[] = [];
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // 6. Add projection stage if provided
    if (Object.keys(projection).length > 0) {
      const values = Object.values(projection);
      const allOnes = values.every(v => v === 1);
      const allZeros = values.every(v => v === 0);
      if (allOnes || allZeros) {
        pipeline.push({ $project: projection });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid projection: cannot mix 1 and 0 (except _id). Use only one style.'
        });
      }
    }

    // 7. Add pagination stages
    pipeline.push(
      { $skip: skip },
      { $limit: limit }
    );

    // 8. Execute aggregation and count
    const [totalCountResult, users] = await Promise.all([
      User.countDocuments(matchStage),
      User.aggregate(pipeline)
    ]);

    // 9. Respond
    req.apiResponse = {
      code: 200,
      success: true,
      message: 'Users retrieved using aggregation',
      data: {
        totalCount: totalCountResult,
        page,
        limit,
        totalPages: Math.ceil(totalCountResult / limit),
        users
      }
    };

    next();
  } catch (error) {
    console.error('[ERROR]', error);
    req.apiResponse = {
      success: false,
      message: 'Internal server error',
      error
    };
    next();
  }
};
import { Request, Response, NextFunction } from 'express';
import Member from '../../models/db/member';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';


dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET!;


// ------------------ MEMBER CRUD OPERATIONS ------------------



export const createMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, address } = req.body;

    const exists = await Member.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newMember = await Member.create({
      name,
      email,
      password: hashedPassword,
      address
    });

    req.apiResponse = {
         success: true,
         message: "Member Created Succesfullly",
         data: newMember };
    next();
  } catch (error) {
    next(error);
  }
};

export const getMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await Member.find();

    req.apiResponse = { 
      code: 200,
      success: true,
      message: "Members retrieved successfully",
      data: {
        totalCount: members.length,
        totalData: members
      }
    };

    next();
  } catch (error) {
    next(error);
  }
};


export const getMemberById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    req.apiResponse = { 
        success: true, 
        message: " Member retrieved successfully ",
        data: member };
    next();
  } catch (error) {
    next(error);
  }
};

export const updateMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    req.apiResponse = { 
        success: true,
        message: " Member updated successfully ",
        data: member };
    next();
  } catch (error) {
    next(error);
  }
};

export const deleteMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    req.apiResponse = { success: true, message: 'Member deleted' };
    next();
  } catch (error) {
    next(error);
  }
};


export const searchMembers = async (req: Request, res: Response, next: NextFunction) => {
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
      : ['name', 'email'];

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
    const [totalCountResult, members] = await Promise.all([
      Member.countDocuments(matchStage),
      Member.aggregate(pipeline)
    ]);

    // 9. Respond
    req.apiResponse = {
      code: 200,
      success: true,
      message: 'Members retrieved using aggregation',
      data: {
        totalCount: totalCountResult,
        page,
        limit,
        totalPages: Math.ceil(totalCountResult / limit),
        members
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
// src/types/express/index.d.ts
import { ApiResponse } from '../../utils/apiResponse'; 
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      apiResponse?: ApiResponse;
      txtId?: string;
      startTime?: number;
      user?: string | JwtPayload;
    }
  }
}

import { AdminDocument } from '../../models/db/admin'; // adjust path
import { UserDocument } from '../../models/db/user';   // adjust path

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument | AdminDocument;
    }
  }
}

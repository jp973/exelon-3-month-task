import { ApiResponse } from '../../utils/apiResponse';
import { JwtPayload } from 'jsonwebtoken';
import { AdminDocument } from '../../models/db/admin';
import { UserDocument } from '../../models/db/user';
import { MemberDocument } from '../../models/db/member';

declare global {
  namespace Express {
    interface Request {
      apiResponse?: ApiResponse;
      txtId?: string;
      startTime?: number;
      user?: UserDocument | AdminDocument | MemberDocument | string | JwtPayload;
    }
  }
}
